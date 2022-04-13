
import os
import subprocess
import sys
import json

sys.path.append(os.getcwd())
from grader_elice_utils import EliceUtils  # isort:skip

elice_utils = EliceUtils()
elice_utils.secure_init()

try:
    elice_utils.secure_send_grader('채점을 시작합니다...\n')
    elice_utils.secure_send_grader('================================\n')
    subprocess.run(['/bin/bash', '.elice/forgrading.sh'], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    
    student_result = None
    with open('result.json') as json_file:
        student_result = json.load(json_file)

    
    testcase_count = student_result['numTotalTestSuites']
    testcase_score = 50
    total_score = 0
    
    result = list()
    
    student_result = student_result['testResults'][0]['assertionResults']
    for i in range(testcase_count):
        result.append((student_result[i]['status'], student_result[i]['title']))
    
    
    # elice_utils.secure_send_grader(result)
        
    count = 1
    for res, message in result:
        if res == 'passed':
            total_score += testcase_score
            elice_utils.secure_send_grader(f'Case {count}. 테스트를 통과했습니다! (+{testcase_score})\n')
        elif res == 'failed':
            elice_utils.secure_send_grader(f'Case {count}. 정답이 틀렸습니다. (+0)\n')
        
        count += 1
    elice_utils.secure_send_grader('================================\n')
    elice_utils.secure_send_grader(f"총 점수: {total_score} / 100 \n")
    elice_utils.secure_send_score(total_score)
except Exception as err:
    # elice_utils.secure_send_grader(err)
    elice_utils.secure_send_grader("코드가 정상적으로 작성되지 않아 테스트에 실패하였습니다. 지시사항을 다시 확인해주세요.")
    elice_utils.secure_send_score(0)
    sys.exit(1)
