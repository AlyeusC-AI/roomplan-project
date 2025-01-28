import { Database } from "@/types/database";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// export const defaultInferencesState = []

// const projectsState = atom<ProjectType[]>({
//   key: 'ProjectsState',
//   default: defaultInferencesState,
// })

declare global {
  type FlatProject = Database["public"]["Tables"]["Project"]["Row"];
  type FlatImage = Database["public"]["Tables"]["Image"]["Row"];
  type FlatAssignee = Database["public"]["Tables"]["UserToProject"]["Row"];
  type Assignee = FlatAssignee & {
    User: { firstName: string; lastName: string; email: string } | null;
  };
  type Image = FlatImage & { url: string };
  interface Project extends FlatProject {
    images: Image[];
    assignees: Assignee[];
  }
}

// export default projectsState
interface State {
  projects: Project[];
  totalProjects: number;
}

interface Actions {
  addProject: (project: Project) => void;
  addProjects: (projects: Project[]) => void;
  removeProject: (id: string) => void;
  setProjects: (projects: Project[], total: number) => void;
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
    }),
    {
      name: "projects",
    }
  )
);
