import { UserModel } from "../schemas/user";

interface IUserDb {
  name: string;
  email: string;
  password: string;
  description: string;
}

class User {
  static async findByEmail({ email }: { email: string }) {
    const user = await UserModel.findOne({ email });
    return user;
  }

  static async findById({ user_id: user_id }: { user_id: string }) {
    const user = await UserModel.findOne({ id: user_id });
    return user;
  }

  static async create(newUser: Omit<IUserDb, "description">) {
    const createdNewUser = await UserModel.create(newUser);
    return createdNewUser;
  }

  static async findAll() {
    const users = await UserModel.find({});
    return users;
  }

  static async update(
    { user_id: user_id }: { user_id: string },
    update: { [key: string]: string }
  ) {
    const filter = { id: user_id };
    const option = { returnOriginal: false };

    const updatedUser = await UserModel.findOneAndUpdate(
      filter,
      update,
      option
    );
    return updatedUser;
  }
}

export { User };
