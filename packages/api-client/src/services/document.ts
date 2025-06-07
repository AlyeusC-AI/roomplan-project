import type {
  Document,
  CreateDocumentDto,
  UpdateDocumentDto,
} from "../types/document";
import { apiClient } from "./client";

class DocumentService {
  async create(data: CreateDocumentDto) {
    return apiClient.post<Document>("/documents", data);
  }

  async findAll(projectId: string) {
    return apiClient.get<Document[]>(`/documents/project/${projectId}`);
  }

  async findOne(id: string) {
    return apiClient.get<Document>(`/documents/${id}`);
  }

  async update(id: string, data: UpdateDocumentDto) {
    return apiClient.patch<Document>(`/documents/${id}`, data);
  }

  async remove(id: string) {
    return apiClient.delete<Document>(`/documents/${id}`);
  }

  async sendEmail(id: string) {
    return apiClient.post<void>(`/documents/${id}/email`);
  }
}

export const documentService = new DocumentService();
