import { FileObject } from "@supabase/storage-js";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
  project: Project | null;
  projectFiles: FileObject[];
}

interface Actions {
  setProject: (project: Project) => void;
  removeFile: (name: string) => void;
}

export const projectStore = create<State & Actions>()(
  persist(
    (set) => ({
      project: null,
      projectFiles: [],
      setProject: (project) =>
        set((state) => ({ project: { ...state.project, ...project } })),
      removeFile: (name) =>
        set((state) => ({
          ...state,
          projectFiles: state.projectFiles.filter((file) => file.id !== name),
        })),
    }),
    {
      name: "projectInfo",
    }
  )
);
