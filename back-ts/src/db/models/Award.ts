import { AwardModel } from "../schemas/award";

interface IAwardInfo {
  user_id: string;
  title: string;
  description: string;
}

class Award {
  static async findById({ awardId }: { awardId: string }) {
    const award = await AwardModel.findOne({ id: awardId });
    return award;
  }

  static async findByUserId({ user_id }: { user_id: string }) {
    const awards = await AwardModel.find({ user_id });
    return awards;
  }

  static async create(newAwardInfo: IAwardInfo) {
    const createdNewAward = await AwardModel.create(newAwardInfo);
    return createdNewAward;
  }

  static async update(
    { awardId }: { awardId: string },
    update: { [key: string]: string }
  ) {
    const filter = { id: awardId };
    const option = { returnOriginal: false };

    const updatedAward = await AwardModel.findOneAndUpdate(
      filter,
      update,
      option
    );
    return updatedAward;
  }

  static async deleteById({ awardId }: { awardId: string }) {
    const deleteResult = await AwardModel.deleteOne({ id: awardId });
    const isDataDeleted = deleteResult.deletedCount === 1;
    return isDataDeleted;
  }
}

export { Award };
