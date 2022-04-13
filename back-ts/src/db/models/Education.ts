import { EducationModel } from "../schemas/education";

interface IEducationInfo {
  user_id: string;
  school: string;
  major: string;
  position: string;
}

class Education {
  static async findById({ educationId }: { educationId: string }) {
    const education = await EducationModel.findOne({ id: educationId });
    return education;
  }

  static async findByUserId({ user_id }: { user_id: string }) {
    const educations = await EducationModel.find({ user_id });
    return educations;
  }

  static async create(newEducationInfo: IEducationInfo) {
    const createdNewEducation = await EducationModel.create(newEducationInfo);
    return createdNewEducation;
  }

  static async update(
    { educationId }: { educationId: string },
    update: { [key: string]: string }
  ) {
    const filter = { id: educationId };
    const option = { returnOriginal: false };

    const updatedEducation = await EducationModel.findOneAndUpdate(
      filter,
      update,
      option
    );
    return updatedEducation;
  }

  static async deleteById({ educationId }: { educationId: string }) {
    const deleteResult = await EducationModel.deleteOne({ id: educationId });
    const isDataDeleted = deleteResult.deletedCount === 1;
    return isDataDeleted;
  }
}

export { Education };
