'''Automatic grader that supports elice_exercise.json config files.'''

import enum
import functools
import json
import os.path
import re
import subprocess
import time
from io import StringIO
from typing import (Any, Callable, Dict, List, NamedTuple, Optional, Union,
                    cast, overload)

from grader_elice_utils import EliceUtils

CONFIG_FILE_PATH = '.elice/elice_exercise.json'


elice_utils = EliceUtils()


@overload
def _safe_file_read(path: str) -> str: ...


@overload
def _safe_file_read(path: Optional[str]) -> Optional[str]: ...


def _safe_file_read(path: Optional[str]) -> Optional[str]:
    if path is None:
        return None

    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        return f.read()


def _try_value(d: Dict[str, Any],
               key: str,
               instance_of: Any,
               required: bool,
               *,
               default: Any = None) -> Any:
    try_value = d.get(key, default)
    if required and try_value is None:
        raise ValueError(f'설정값 `{key}` 이 누락되었습니다.')
    if (try_value is not None
            and not isinstance(try_value, instance_of)):
        raise ValueError(f'설정값 `{key}` 의 형식이 잘못되었습니다.', try_value, instance_of)
    return try_value


class GradingCheckType(enum.Enum):
    STDOUT = 'stdout'
    STDOUT_MATCH = 'stdout_match'
    STDOUT_NOMATCH = 'stdout_nomatch'
    STDOUT_REGEX = 'stdout_regex'
    STDOUT_REGEX_NOMATCH = 'stdout_regex_nomatch'


class GradingCheck(NamedTuple):
    type_: GradingCheckType
    input_file: Optional[str]
    output_file: str
    score: int
    time_limit: Optional[float]
    time_limit_soft: Optional[float]
    time_limit_soft_penalty: Optional[int]

    @staticmethod
    def from_dict(d: Dict[str, Any]) -> 'GradingCheck':
        if not isinstance(d, dict):
            raise ValueError('설정의 형식이 잘못되없습니다.')

        try_type: str = _try_value(d, 'type', str, True)
        if try_type not in [x.value for x in GradingCheckType]:
            raise ValueError('설정값 `type` 에 대해 지원되지 않는 값입니다.', try_type)

        try_input_file: Optional[str] = _try_value(d, 'input_file', str, False)
        if (try_input_file is not None
                and not os.path.isfile(try_input_file)):
            raise ValueError('설정값 `input_file` 에서 지정한 파일이 존재하지 않습니다.', try_input_file)

        try_output_file: str = _try_value(d, 'output_file', str, True)
        if not os.path.isfile(try_output_file):
            raise ValueError('설정값 `output_file` 에서 지정한 파일이 존재하지 않습니다.', try_output_file)
        if GradingCheckType(try_type) in [GradingCheckType.STDOUT_REGEX,
                                          GradingCheckType.STDOUT_REGEX_NOMATCH]:
            try:
                re.compile(_safe_file_read(try_output_file))
            except Exception:
                raise ValueError('설정값 `output_file` 의 내용이 올바른 정규표현식이 아닙니다.', try_output_file)

        try_score: int = _try_value(d, 'score', int, False)
        if try_score < 0:
            raise ValueError('설정값 `score` 은 0 보다 크거나 같아야 합니다.', try_score)

        try_time_limit: Union[float, int] = _try_value(d, 'time_limit', (float, int), True)
        if try_time_limit <= 0.0:
            raise ValueError('설정값 `time_limit` 은 0.0 보다 커야 합니다.', try_time_limit)

        try_time_limit_soft: Optional[Union[float, int]] = _try_value(d, 'time_limit_soft', (float, int), False)
        if (try_time_limit_soft is not None
                and not 0.0 < try_time_limit_soft < try_time_limit):
            raise ValueError('설정값 `time_limit_soft` 는 0.0 보다 크고 `time_limit` 보다 작아야 합니다.',
                             try_time_limit_soft, try_time_limit)

        try_time_limit_soft_penalty: Optional[int] = _try_value(d, 'time_limit_soft_penalty', int, False)
        if not ((try_time_limit_soft is None and try_time_limit_soft_penalty is None)
                or (try_time_limit_soft is not None and try_time_limit_soft_penalty is not None)):
            raise ValueError('설정값 `time_limit_soft_penalty` 는 `time_limit_soft` 와 함께 사용되어야 합니다.',
                             try_time_limit_soft_penalty, try_time_limit_soft)
        if (try_time_limit_soft_penalty is not None
                and not 0 <= try_time_limit_soft_penalty <= try_score):
            raise ValueError('설정값 `time_limit_soft_penalty` 는 0.0 보다 크거나 같고, '
                             '`score` 보다 작거나 같아야 합니다.', try_time_limit_soft_penalty, try_score)

        return GradingCheck(
            type_=GradingCheckType(try_type),
            input_file=try_input_file,
            output_file=try_output_file,
            score=try_score,
            time_limit=float(try_time_limit),
            time_limit_soft=try_time_limit_soft and float(try_time_limit_soft),
            time_limit_soft_penalty=try_time_limit_soft_penalty
        )


class GradingMessageType(enum.Enum):
    BEGIN = 'begin'
    END = 'end'
    CHECK_CORRECT = 'check_correct'
    CHECK_SOFT_TIMEOUT = 'check_soft_timeout'
    CHECK_WRONG = 'check_wrong'
    CHECK_TIMEOUT = 'check_timeout'


DEFAULT_MESSAGES = {
    GradingMessageType.BEGIN: '채점을 시작합니다...\n' + '=' * 32,
    GradingMessageType.END: '=' * 32 + '\n채점을 마쳤습니다.\n총 점수: {score} / {score_total}',
    GradingMessageType.CHECK_CORRECT: 'Case {gc_number}. 테스트를 통과했습니다! (+{gc_score})',
    GradingMessageType.CHECK_SOFT_TIMEOUT: (
        'Case {gc_number}. 테스트를 통과했지만 (+{gc_score}), '
        '실행하는 데 너무 오래 걸렸습니다. (-{gc_time_limit_soft_penalty})'
    ),
    GradingMessageType.CHECK_WRONG: 'Case {gc_number}. 정답이 틀렸습니다. (+0)',
    GradingMessageType.CHECK_TIMEOUT: 'Case {gc_number}. 실행 시간을 초과했습니다. (+0)'
}


class Config(NamedTuple):
    version: int
    cmd: List[str]
    grading_checks: List[GradingCheck]
    messages: Dict[GradingMessageType, str]

    @staticmethod
    def from_dict(d: Dict[str, Any]) -> 'Config':
        if not isinstance(d, dict):
            raise ValueError('설정의 형식이 잘못되없습니다.')

        try_vesrion: int = _try_value(d, 'version', int, True)

        try_cmd: list = _try_value(d, 'cmd', list, False, default=[])
        if not all(isinstance(v, str) for v in try_cmd):
            raise ValueError('설정값 `cmd` 의 형식이 잘못되었습니다.', try_cmd)
        try_cmd = cast(List[str], try_cmd)

        try_grading_checks: list = _try_value(d, 'grading_checks', list, True)
        if not (all(isinstance(v, dict) for v in try_grading_checks)
                and all(all(isinstance(k, str) for k in d2.keys()) for d2 in try_grading_checks)):
            raise ValueError('설정값 `grading_checks` 의 형식이 잘못되었습니다.', try_grading_checks)
        try_grading_checks = cast(List[Dict[str, Any]], try_grading_checks)

        try_messages: dict = _try_value(d, 'messages', dict, False, default={})
        if not (all(isinstance(k, str) for k in try_messages.keys())
                and all(isinstance(v, str) for v in try_messages.values())):
            raise ValueError('설정값 `messages` 의 형식이 잘못되었습니다.', try_messages)
        try_messages = cast(Dict[str, str], try_messages)

        return Config(
            version=int(try_vesrion),
            cmd=try_cmd or ['bash', '.elice/runner.sh'],
            grading_checks=[GradingCheck.from_dict(v) for v in try_grading_checks],
            messages={
                **DEFAULT_MESSAGES,
                **{
                    GradingMessageType(k): v
                    for k, v in try_messages.items()
                }
            }
        )


class RunnerResult(NamedTuple):
    returncode: Optional[int]
    stdout: str
    stderr: str
    run_duration: float
    is_process_timeout: bool


class GradingCheckResultType(enum.Enum):
    CORRECT = 'correct'
    SOFT_TIMEOUT = 'soft_timeout'
    WRONG = 'wrong'
    TIMEOUT = 'timeout'


class GradingCheckResult(NamedTuple):
    type_: GradingCheckResultType
    time_spent: float


class MissingKeySafeFormatDict(Dict[str, Any]):
    def __missing__(self, key: str) -> str:
        return '{' + key + '}'

    def __add__(self, other: 'MissingKeySafeFormatDict') -> 'MissingKeySafeFormatDict':
        return MissingKeySafeFormatDict({**self, **other})


def elice_print(*values, sep: Optional[str] = None, end: Optional[str] = None) -> None:
    '''Wrapper for EliceUtils.secure_send_grader() that behaves like print().
    '''
    buffer = StringIO()
    print(*values, sep=sep, end=end, file=buffer)
    elice_utils.secure_send_grader(buffer.getvalue())


def run_student_code(
    *,
    cmd: List[str],
    input_: Optional[str] = None,
    timeout: Optional[float] = None,
) -> RunnerResult:
    run_start_time = time.perf_counter()
    stdout = stderr = ''
    try:
        p = subprocess.Popen(
            args=cmd,
            stdin=subprocess.PIPE,
            stderr=subprocess.PIPE,
            stdout=subprocess.PIPE,
            encoding='utf-8',
            errors='replace',
        )
        stdout, stderr = p.communicate(input=input_, timeout=timeout)
    except subprocess.TimeoutExpired:
        p.kill()
        # NOTE: `p.communicate()` after `p.kill()` can hang (https://bugs.python.org/issue38207)
        p.wait()
        returncode = p.returncode
        is_process_timeout = True
    else:
        returncode = p.returncode
        is_process_timeout = False

    run_duration = time.perf_counter() - run_start_time

    return RunnerResult(
        returncode=returncode,
        run_duration=run_duration,
        stdout=stdout,
        stderr=stderr,
        is_process_timeout=is_process_timeout,
    )


def _grade_checker(config: Config,
                   grading_check: GradingCheck,
                   fn: Callable[[str, str], bool]) -> GradingCheckResult:
    stdin_content = _safe_file_read(grading_check.input_file)
    stdout_expected_content = _safe_file_read(grading_check.output_file)

    result = run_student_code(
        cmd=config.cmd,
        input_=stdin_content,
        timeout=grading_check.time_limit
    )

    if result.is_process_timeout:
        result_type = GradingCheckResultType.TIMEOUT
        return GradingCheckResult(GradingCheckResultType.TIMEOUT, result.run_duration)
    elif (result.returncode
          or not fn(result.stdout, stdout_expected_content)):
        result_type = GradingCheckResultType.WRONG
    elif (grading_check.time_limit_soft is not None
          and grading_check.time_limit_soft < result.run_duration):
        result_type = GradingCheckResultType.SOFT_TIMEOUT
    else:
        result_type = GradingCheckResultType.CORRECT

    return GradingCheckResult(result_type, result.run_duration)


def _grade_checker_stdout(output: str, output_expected: str) -> bool:
    '''Checks its output against a expected string.'''
    return output.rstrip() == output_expected.rstrip()


def _grade_checker_stdout_match(output: str, output_expected: str) -> bool:
    '''Checks if its output contains a string.'''
    return output_expected in output


def _grade_checker_stdout_nomatch(output: str, output_expected: str) -> bool:
    '''Checks if its output contains a string.'''
    return not _grade_checker_stdout_match(output, output_expected)


def _grade_checker_stdout_regex(output: str, output_expected: str) -> bool:
    '''Checks its output against a regular expression.'''
    return re.search(output_expected, output) is not None


def _grade_checker_stdout_regex_nomatch(output: str, output_expected: str) -> bool:
    '''Checks its output against a regular expression.'''
    return not _grade_checker_stdout_regex(output, output_expected)


def do_grading(config: Config) -> int:
    '''Executes all grading checks specified in the config file and returns the
    final score.'''
    GRADE_CHECKERS = {
        GradingCheckType.STDOUT: functools.partial(
            _grade_checker, fn=_grade_checker_stdout),
        GradingCheckType.STDOUT_MATCH: functools.partial(
            _grade_checker, fn=_grade_checker_stdout_match),
        GradingCheckType.STDOUT_NOMATCH: functools.partial(
            _grade_checker, fn=_grade_checker_stdout_nomatch),
        GradingCheckType.STDOUT_REGEX: functools.partial(
            _grade_checker, fn=_grade_checker_stdout_regex),
        GradingCheckType.STDOUT_REGEX_NOMATCH: functools.partial(
            _grade_checker, fn=_grade_checker_stdout_regex_nomatch),
    }

    grading_context = MissingKeySafeFormatDict({
        'num_gc_all': len(config.grading_checks),
        'num_gc_pass': 0,
        'num_gc_correct': 0,
        'num_gc_soft_timeout': 0,
        'num_gc_fail': 0,
        'num_gc_wrong': 0,
        'num_gc_timeout': 0,
        'score_total': 0,
        'score': 0,
    })

    elice_print(config.messages[GradingMessageType.BEGIN].format_map(grading_context))

    for idx, grading_check in enumerate(config.grading_checks):
        check_context = MissingKeySafeFormatDict({
            'gc_index': idx,
            'gc_number': idx + 1,
            'gc_score': grading_check.score,
            'gc_time_limit': grading_check.time_limit,
            'gc_time_limit_soft': grading_check.time_limit_soft,
            'gc_time_limit_soft_penalty': grading_check.time_limit_soft_penalty
        })

        check_result = GRADE_CHECKERS[grading_check.type_](config, grading_check)

        grading_context['score_total'] += grading_check.score
        score_delta = 0

        if check_result.type_ == GradingCheckResultType.CORRECT:
            grading_context['num_gc_pass'] += 1
            grading_context['num_gc_correct'] += 1

            score_delta = grading_check.score

            msg_type = GradingMessageType.CHECK_CORRECT

        elif check_result.type_ == GradingCheckResultType.SOFT_TIMEOUT:
            grading_context['num_gc_pass'] += 1
            grading_context['num_gc_soft_timeout'] += 1

            score_delta = grading_check.score - (grading_check.time_limit_soft_penalty or 0)

            msg_type = GradingMessageType.CHECK_SOFT_TIMEOUT

        elif check_result.type_ == GradingCheckResultType.WRONG:
            grading_context['num_gc_fail'] += 1
            grading_context['num_gc_wrong'] += 1

            msg_type = GradingMessageType.CHECK_WRONG

        elif check_result.type_ == GradingCheckResultType.TIMEOUT:
            grading_context['num_gc_fail'] += 1
            grading_context['num_gc_timeout'] += 1

            msg_type = GradingMessageType.CHECK_TIMEOUT

        grading_context['score'] += score_delta

        result_context = MissingKeySafeFormatDict({
            'gc_result_run_duration': check_result.time_spent,
            'gc_result_score': score_delta
        })

        elice_print(config.messages[msg_type].format_map(grading_context + check_context + result_context))

    elice_print(config.messages[GradingMessageType.END].format_map(grading_context))

    return cast(int, grading_context['score'])


def main() -> None:
    '''Entry point for the grader script.'''
    elice_utils.secure_init()

    with open(CONFIG_FILE_PATH, encoding='utf-8') as config_file:
        try:
            config = Config.from_dict(json.load(config_file))
        except json.JSONDecodeError:
            raise RuntimeError('설정 파일이 올바른 JSON 형식이 아닙니다.')

    if config.version != 0:
        raise RuntimeError('지원하는 설정 파일 버전이 아닙니다.', config.version)

    final_score = do_grading(config)
    elice_utils.secure_send_score(final_score)


if __name__ == '__main__':
    main()
