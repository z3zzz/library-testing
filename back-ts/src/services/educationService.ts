// from을 폴더(db) 로 설정 시, 디폴트로 index.js 로부터 import함.
import { Education } from "../db";
import { v4 as uuidv4 } from "uuid";

interface IEducationInfo {
  user_id: string;
  school: string;
  major: string;
  position: string;
}

class EducationService {
  static async addEducation({
    user_id,
    school,
    major,
    position,
  }: IEducationInfo) {
    // id로 유니크 값 사용
    const id = uuidv4();

    // db에 저장
    const newEducation = { id, user_id, school, major, position };
    const createdNewEducation = await Education.create(newEducation);

    return createdNewEducation;
  }

  static async getEducation({ educationId }: { educationId: string }) {
    // 해당 id를 가진 데이터가 db에 존재 여부 확인
    const education = await Education.findById({ educationId });
    if (!education) {
      const errorMessage =
        "해당 id를 가진 교육 데이터는 없습니다. 다시 한 번 확인해 주세요.";
      return { errorMessage };
    }

    return education;
  }

  static async getEducationList({ user_id }: { user_id: string }) {
    const educations = await Education.findByUserId({ user_id });
    return educations;
  }

  static async setEducation(
    { educationId }: { educationId: string },
    toUpdate: Omit<IEducationInfo, "user_id">
  ) {
    let education = await Education.findById({ educationId });

    // db에서 찾지 못한 경우, 에러 메시지 반환
    if (!education) {
      const errorMessage =
        "해당 id를 가진 교육 데이터는 없습니다. 다시 한 번 확인해 주세요.";
      return { errorMessage };
    }

    if (toUpdate.school) {
      education = await Education.update(
        { educationId },
        { school: toUpdate.school }
      );
    }

    if (toUpdate.major) {
      education = await Education.update(
        { educationId },
        { major: toUpdate.major }
      );
    }

    if (toUpdate.position) {
      education = await Education.update(
        { educationId },
        { position: toUpdate.position }
      );
    }

    return education;
  }

  static async deleteEducation({ educationId }: { educationId: string }) {
    const isDataDeleted = await Education.deleteById({ educationId });

    // db에서 찾지 못한 경우, 에러 메시지 반환
    if (!isDataDeleted) {
      const errorMessage =
        "해당 id를 가진 교육 데이터는 없습니다. 다시 한 번 확인해 주세요.";
      return { errorMessage };
    }

    return { status: "ok" };
  }
}

export { EducationService };
