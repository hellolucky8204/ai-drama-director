import { Project } from "./domain";
export interface ProjectRepository {
  load(): Project[];
  save(projects: Project[]): void;
}
export const STORAGE_KEY = "ai-drama-director:v1";
export const repository: ProjectRepository = {
  load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const value = JSON.parse(raw);
    if (
      value.version !== 1 ||
      !Array.isArray(value.projects) ||
      value.projects.some(
        (p: Project) =>
          !p.id ||
          !p.story ||
          !Array.isArray(p.characters) ||
          !p.episode ||
          !Array.isArray(p.shots) ||
          !Array.isArray(p.generated) ||
          !p.editing ||
          !Number.isInteger(p.current_step) ||
          p.current_step < 0 ||
          p.current_step > 7,
      )
    )
      throw new Error("本地数据格式异常");
    return value.projects;
  },
  save(projects) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, projects }));
  },
};
