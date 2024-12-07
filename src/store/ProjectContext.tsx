import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, ProjectVersion } from '../types';
import { StorageService } from '../utils/storage';

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  isLoading: boolean;
  createProject: (name: string) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  setActiveProject: (projectId: string) => Promise<void>;
  addVersion: (projectId: string, version: ProjectVersion) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const storage = StorageService.getInstance();

  // 初始化加载
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const allProjects = await storage.getAllProjects();
        setProjects(allProjects);

        const activeProjectId = await storage.getActiveProject();
        if (activeProjectId) {
          const active = allProjects.find(p => p.id === activeProjectId);
          setActiveProject(active || null);
        }
      } catch (error) {
        console.error('无法加载初始数据', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [storage]);

  const createProject = async (name: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      prompt: '',
      versions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await storage.saveProject(newProject);
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = async (project: Project) => {
    await storage.saveProject(project);
    setProjects(prev => 
      prev.map(p => p.id === project.id ? project : p)
    );
    if (activeProject?.id === project.id) {
      setActiveProject(project);
    }
  };

  const deleteProject = async (projectId: string) => {
    await storage.deleteProject(projectId);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (activeProject?.id === projectId) {
      setActiveProject(null);
    }
  };

  const handleSetActiveProject = async (projectId: string) => {
    await storage.setActiveProject(projectId);
    const project = projects.find(p => p.id === projectId);
    setActiveProject(project || null);
  };

  const addVersion = async (projectId: string, version: ProjectVersion) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedProject = {
      ...project,
      versions: [...project.versions, version],
      updatedAt: new Date().toISOString(),
    };

    await updateProject(updatedProject);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        isLoading,
        createProject,
        updateProject,
        deleteProject,
        setActiveProject: handleSetActiveProject,
        addVersion,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
