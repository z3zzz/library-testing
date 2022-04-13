// from을 폴더(db) 로 설정 시, 디폴트로 index.js 로부터 import함.
import { v4 as uuidv4 } from "uuid";
import { Project } from "../db/";

interface IProjectInfo {
  user_id: string;
  title: string;
  description: string;
  from_date: string;
  to_date: string;
}

class ProjectService {
  static async addProject({
    user_id,
    title,
    description,
    from_date,
    to_date,
  }: IProjectInfo) {
    // id로 유니크 값 사용
    const id = uuidv4();

    // db에 저장
    const newProject = { id, user_id, title, description, from_date, to_date };
    const createdNewProject = await Project.create(newProject);

    return createdNewProject;
  }

  static async getProject({ projectId }: { projectId: string }) {
    // 해당 id를 가진 데이터가 db에 존재 여부 확인
    const project = await Project.findById({ projectId });
    if (!project) {
      const errorMessage =
        "해당 id를 가진 프로젝트 데이터는 없습니다. 다시 한 번 확인해 주세요.";
      return { errorMessage };
    }

    return project;
  }

  static async getProjectList({ user_id }: { user_id: string }) {
    const projects = await Project.findByUserId({ user_id });
    return projects;
  }

  static async setProject(
    { projectId }: { projectId: string },
    toUpdate: Omit<IProjectInfo, "user_id">
  ) {
    let project = await Project.findById({ projectId });

    // db에서 찾지 못한 경우, 에러 메시지 반환
    if (!project) {
      const errorMessage =
        "해당 id를 가진 프로젝트 데이터는 없습니다. 다시 한 번 확인해 주세요.";
      return { errorMessage };
    }

    if (toUpdate.title) {
      project = await Project.update({ projectId }, { title: toUpdate.title });
    }

    if (toUpdate.description) {
      project = await Project.update(
        { projectId },
        { description: toUpdate.description }
      );
    }

    if (toUpdate.from_date) {
      project = await Project.update(
        { projectId },
        { from_date: toUpdate.from_date }
      );
    }

    if (toUpdate.to_date) {
      project = await Project.update(
        { projectId },
        { to_date: toUpdate.to_date }
      );
    }

    return project;
  }

  static async deleteProject({ projectId }: { projectId: string }) {
    const isDataDeleted = await Project.deleteById({ projectId });

    // db에서 찾지 못한 경우, 에러 메시지 반환
    if (!isDataDeleted) {
      const errorMessage =
        "해당 id를 가진 프로젝트 데이터는 없습니다. 다시 한 번 확인해 주세요.";
      return { errorMessage };
    }

    return { status: "ok" };
  }
}

export { ProjectService };
