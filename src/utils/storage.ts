import { Project, ProjectVersion } from '../types';

const STORAGE_KEYS = {
  PROJECTS: 'prompt-manager-projects',
  ACTIVE_PROJECT: 'prompt-manager-active-project',
};

export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // 项目相关方法
  async getAllProjects(): Promise<Project[]> {
    const projectsJson = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return projectsJson ? JSON.parse(projectsJson) : [];
  }

  async saveProject(project: Project): Promise<void> {
    const projects = await this.getAllProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.push(project);
    }

    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }

  async deleteProject(projectId: string): Promise<void> {
    const projects = await this.getAllProjects();
    const filteredProjects = projects.filter(p => p.id !== projectId);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filteredProjects));
  }

  async getProject(projectId: string): Promise<Project | null> {
    const projects = await this.getAllProjects();
    return projects.find(p => p.id === projectId) || null;
  }

  // 版本相关方法
  async addVersion(projectId: string, version: ProjectVersion): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) return;

    project.versions.push(version);
    project.updatedAt = new Date().toISOString();
    await this.saveProject(project);
  }

  async getVersions(projectId: string): Promise<ProjectVersion[]> {
    const project = await this.getProject(projectId);
    return project?.versions || [];
  }

  // 活动项目
  async setActiveProject(projectId: string): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT, projectId);
  }

  async getActiveProject(): Promise<string | null> {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT);
  }

  // 工具方法
  async clearAll(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROJECT);
  }
}
