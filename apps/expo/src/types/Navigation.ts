import { RouterOutputs } from "@servicegeek/api";
import { RoomData } from "./ProjectType";

export type RootStackParamList = {
  Home: undefined;
  CreateProject: undefined;
  Project: { projectName: string; projectId: string };
  Photos: { projectName: string; projectId: string };
  Insurance: { projectName: string; projectId: string };
  Readings: { projectName: string; projectId: string };
  Notes: { projectName: string; projectId: string };
  "Create Room": { projectId: string };
  "Edit Project": { projectId: string };
  Camera: {
    projectId: string;
    rooms: RouterOutputs["mobile"]["getProjectImages"]["rooms"];
    organizationId: string;
  };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Settings: undefined;
};
