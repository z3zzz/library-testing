import { CertificateModel } from "../schemas/certificate";

class Certificate {
  static async create({ newCertificate }) {
    const createdNewCertificate = await CertificateModel.create(newCertificate);
    return createdNewCertificate;
  }

  static async findById({ certificateId }) {
    const certificate = await CertificateModel.findOne({ id: certificateId });
    return certificate;
  }

  static async findByUserId({ user_id }) {
    const certificates = await CertificateModel.find({ user_id });
    return certificates;
  }

  static async update({ certificateId, fieldToUpdate, newValue }) {
    const filter = { id: certificateId };
    const update = { [fieldToUpdate]: newValue };
    const option = { returnOriginal: false };

    const updatedCertificate = await CertificateModel.findOneAndUpdate(
      filter,
      update,
      option
    );
    return updatedCertificate;
  }

  static async deleteById({ certificateId }) {
    const deleteResult = await CertificateModel.deleteOne({
      id: certificateId,
    });
    const isDataDeleted = deleteResult.deletedCount === 1;
    return isDataDeleted;
  }
}

export { Certificate };
