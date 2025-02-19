import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
  projects: Project[];
  totalProjects: number;
}

interface Actions {
  addProject: (project: Project) => void;
  addProjects: (projects: Project[]) => void;
  removeProject: (id: string) => void;
  setProjects: (projects: Project[], total: number) => void;
  updateProject: (project: Partial<Project>) => void;
}

export const projectsStore = create<State & Actions>()(
  persist(
    (set) => ({
      projects: [],
      totalProjects: 0,
      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),
      addProjects: (projects) =>
        set((state) => ({ projects: [...state.projects, ...projects] })),
      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((i) => i.publicId !== id),
        })),
      setProjects: (projects, total) =>
        set(() => ({ projects, totalProjects: total })),
      updateProject: (project) =>
        set((state) => ({
          projects: state.projects.map((i) =>
            i.publicId === project.publicId ? { ...i, ...project } : i
          ),
        })),
    }),
    {
      name: "projects",
    }
  )
);
