import { EducationModel } from "../schemas/education";

class Education {
  static async create({ newEducation }) {
    const createdNewEducation = await EducationModel.create(newEducation);
    return createdNewEducation;
  }

  static async findById({ educationId }) {
    const education = await EducationModel.findOne({ id: educationId });
    return education;
  }

  static async findByUserId({ user_id }) {
    const educations = await EducationModel.find({ user_id });
    return educations;
  }

  static async update({ educationId, fieldToUpdate, newValue }) {
    const filter = { id: educationId };
    const update = { [fieldToUpdate]: newValue };
    const option = { returnOriginal: false };

    const updatedEducation = await EducationModel.findOneAndUpdate(
      filter,
      update,
      option
    );
    return updatedEducation;
  }

  static async deleteById({ educationId }) {
    const deleteResult = await EducationModel.deleteOne({ id: educationId });
    const isDataDeleted = deleteResult.deletedCount === 1;
    return isDataDeleted;
  }
}

export { Education };
