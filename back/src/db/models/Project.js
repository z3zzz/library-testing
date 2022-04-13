import { ProjectModel } from "../schemas/project";

class Project {
  static async create({ newProject }) {
    const createdNewProject = await ProjectModel.create(newProject);
    return createdNewProject;
  }

  static async findById({ projectId }) {
    const project = await ProjectModel.findOne({ id: projectId });
    return project;
  }

  static async findByUserId({ user_id }) {
    const projects = await ProjectModel.find({ user_id });
    return projects;
  }

  static async update({ projectId, fieldToUpdate, newValue }) {
    const filter = { id: projectId };
    const update = { [fieldToUpdate]: newValue };
    const option = { returnOriginal: false };

    const updatedProject = await ProjectModel.findOneAndUpdate(
      filter,
      update,
      option
    );
    return updatedProject;
  }

  static async deleteById({ projectId }) {
    const deleteResult = await ProjectModel.deleteOne({ id: projectId });
    const isDataDeleted = deleteResult.deletedCount === 1;
    return isDataDeleted;
  }
}

export { Project };
