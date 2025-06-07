import { Organization } from "./organization";
import { Project } from "./project";

interface ProjectWithOrganization extends Project {
  organization: Organization;
}
export interface Document {
  id: string;
  name?: string;
  type: DocumentType;
  json?: any;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  project: ProjectWithOrganization;
}

export enum DocumentType {
  AUTH = "AUTH",
  COS = "COS",
}

export interface CreateDocumentDto {
  name?: string;
  type: DocumentType;
  json?: any;
  projectId: string;
}

export interface UpdateDocumentDto {
  name?: string;
  type?: DocumentType;
  json?: any;
}
