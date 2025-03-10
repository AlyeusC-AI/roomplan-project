import { FileObject } from "@supabase/storage-js";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
  project: Project | null;
  projectFiles: FileObject[];
  pendingReports: Report[];
}

interface Actions {
  setProject: (project: Project) => void;
  removeFile: (name: string) => void;
  addFile: (file: FileObject) => void;
  setFiles: (files: FileObject[]) => void;
  setReports: (reports: Report[]) => void;
}

export const projectStore = create<State & Actions>()(
  persist(
    (set) => ({
      project: null,
      projectFiles: [],
      pendingReports: [],
      setProject: (project) =>
        set((state) => ({ project: { ...state.project, ...project } })),
      removeFile: (name) =>
        set((state) => ({
          ...state,
          projectFiles: state.projectFiles.filter((file) => file.id !== name),
        })),
      setFiles: (files) => set((state) => ({ ...state, projectFiles: files })),
      addFile: (file) =>
        set((state) => ({
          ...state,
          projectFiles: [...state.projectFiles, file],
        })),
      setReports: (reports) =>
        set((state) => ({ ...state, pendingReports: reports })),
    }),
    {
      name: "projectInfo",
    }
  )
);
