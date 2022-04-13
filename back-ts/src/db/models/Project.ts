import { ProjectModel } from "../schemas/project";

interface IProjectInfo {
  user_id: string;
  title: string;
  description: string;
  from_date: string;
  to_date: string;
}

class Project {
  static async findById({ projectId }: { projectId: string }) {
    const project = await ProjectModel.findOne({ id: projectId });
    return project;
  }

  static async findByUserId({ user_id }: { user_id: string }) {
    const projects = await ProjectModel.find({ user_id });
    return projects;
  }

  static async create(newProjectInfo: IProjectInfo) {
    const createdNewProject = await ProjectModel.create(newProjectInfo);
    return createdNewProject;
  }

  static async update(
    { projectId }: { projectId: string },
    update: { [key: string]: string }
  ) {
    const filter = { id: projectId };
    const option = { returnOriginal: false };

    const updatedProject = await ProjectModel.findOneAndUpdate(
      filter,
      update,
      option
    );
    return updatedProject;
  }

  static async deleteById({ projectId }: { projectId: string }) {
    const deleteResult = await ProjectModel.deleteOne({ id: projectId });
    const isDataDeleted = deleteResult.deletedCount === 1;
    return isDataDeleted;
  }
}

export { Project };
