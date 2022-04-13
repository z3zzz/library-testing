// from을 폴더(db) 로 설정 시, 디폴트로 index.js 로부터 import함.
import { Award } from "../db";
import { v4 as uuidv4 } from "uuid";

interface IAwardInfo {
  user_id: string;
  title: string;
  description: string;
}

class AwardService {
  static async addAward({ user_id, title, description }: IAwardInfo) {
    // id로 유니크 값 사용
    const id = uuidv4();

    // db에 저장
    const newAward = { id, user_id, title, description };
    const createdNewAward = await Award.create(newAward);

    return createdNewAward;
  }

  static async getAward({ awardId }: { awardId: string }) {
    // 해당 id를 가진 데이터가 db에 존재 여부 확인
    const award = await Award.findById({ awardId });
    if (!award) {
      const errorMessage =
        "해당 id를 가진 수상 데이터는 없습니다. 다시 한 번 확인해 주세요.";
      return { errorMessage };
    }

    return award;
  }

  static async getAwardList({ user_id }: { user_id: string }) {
    const awards = await Award.findByUserId({ user_id });
    return awards;
  }

  static async setAward(
    { awardId }: { awardId: string },
    toUpdate: Omit<IAwardInfo, "user_id">
  ) {
    let award = await Award.findById({ awardId });

    // db에서 찾지 못한 경우, 에러 메시지 반환
    if (!award) {
      const errorMessage =
        "해당 id를 가진 수상 데이터는 없습니다. 다시 한 번 확인해 주세요.";
      return { errorMessage };
    }

    if (toUpdate.title) {
      award = await Award.update({ awardId }, { title: toUpdate.title });
    }

    if (toUpdate.description) {
      award = await Award.update(
        { awardId },
        { description: toUpdate.description }
      );
    }

    return award;
  }

  static async deleteAward({ awardId }: { awardId: string }) {
    const isDataDeleted = await Award.deleteById({ awardId });

    // db에서 찾지 못한 경우, 에러 메시지 반환
    if (!isDataDeleted) {
      const errorMessage =
        "해당 id를 가진 수상 데이터는 없습니다. 다시 한 번 확인해 주세요.";
      return { errorMessage };
    }

    return { status: "ok" };
  }
}

export { AwardService };
