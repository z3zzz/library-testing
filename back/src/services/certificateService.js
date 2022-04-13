// from을 폴더(db) 로 설정 시, 디폴트로 index.js 로부터 import함.
import { v4 as uuidv4 } from "uuid";
import { Certificate } from "../db/";

class CertificateService {
  static async addCertificate({ user_id, title, description, when_date }) {
    // id로 유니크 값 사용
    const id = uuidv4();

    // db에 저장
    const newCertificate = { id, user_id, title, description, when_date };
    const createdNewCertificate = await Certificate.create({ newCertificate });

    return createdNewCertificate;
  }

  static async getCertificate({ certificateId }) {
    // 해당 id를 가진 데이터가 db에 존재 여부 확인
    const certificate = await Certificate.findById({ certificateId });
    if (!certificate) {
      const errorMessage =
        "해당 id를 가진 자격증 데이터는 없습니다. 다시 한 번 확인해 주세요.";
      return { errorMessage };
    }

    return certificate;
  }

  static async getCertificateList({ user_id }) {
    const certificates = await Certificate.findByUserId({ user_id });
    return certificates;
  }

  static async setCertificate({ certificateId, toUpdate }) {
    let certificate = await Certificate.findById({ certificateId });

    // db에서 찾지 못한 경우, 에러 메시지 반환
    if (!certificate) {
      const errorMessage =
        "해당 id를 가진 자격증 데이터는 없습니다. 다시 한 번 확인해 주세요.";
      return { errorMessage };
    }

    if (toUpdate.title) {
      const fieldToUpdate = "title";
      const newValue = toUpdate.title;
      certificate = await Certificate.update({
        certificateId,
        fieldToUpdate,
        newValue,
      });
    }

    if (toUpdate.description) {
      const fieldToUpdate = "description";
      const newValue = toUpdate.description;
      certificate = await Certificate.update({
        certificateId,
        fieldToUpdate,
        newValue,
      });
    }

    if (toUpdate.when_date) {
      const fieldToUpdate = "when_date";
      const newValue = toUpdate.when_date;
      certificate = await Certificate.update({
        certificateId,
        fieldToUpdate,
        newValue,
      });
    }

    return certificate;
  }

  static async deleteCertificate({ certificateId }) {
    const isDataDeleted = await Certificate.deleteById({ certificateId });

    // db에서 찾지 못한 경우, 에러 메시지 반환
    if (!isDataDeleted) {
      const errorMessage =
        "해당 id를 가진 자격증 데이터는 없습니다. 다시 한 번 확인해 주세요.";
      return { errorMessage };
    }

    return { status: "ok" };
  }
}

export { CertificateService };
