import { CertificateModel } from "../schemas/certificate";

interface ICertificateInfo {
  user_id: string;
  title: string;
  description: string;
  when_date: string;
}

class Certificate {
  static async findById({ certificateId }: { certificateId: string }) {
    const certificate = await CertificateModel.findOne({ id: certificateId });
    return certificate;
  }

  static async findByUserId({ user_id }: { user_id: string }) {
    const certificates = await CertificateModel.find({ user_id });
    return certificates;
  }

  static async create(newCertificateInfo: ICertificateInfo) {
    const createdNewCertificate = await CertificateModel.create(
      newCertificateInfo
    );
    return createdNewCertificate;
  }

  static async update(
    { certificateId }: { certificateId: string },
    update: { [key: string]: string }
  ) {
    const filter = { id: certificateId };
    const option = { returnOriginal: false };

    const updatedCertificate = await CertificateModel.findOneAndUpdate(
      filter,
      update,
      option
    );
    return updatedCertificate;
  }

  static async deleteById({ certificateId }: { certificateId: string }) {
    const deleteResult = await CertificateModel.deleteOne({
      id: certificateId,
    });
    const isDataDeleted = deleteResult.deletedCount === 1;
    return isDataDeleted;
  }
}

export { Certificate };
