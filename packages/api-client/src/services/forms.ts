import type {
  Form,
  FormResponse,
  CreateFormDto,
  UpdateFormDto,
  CreateFormResponseDto,
  FormSection,
  FormField,
  CreateFormSectionDto,
  UpdateFormSectionDto,
  CreateFormFieldDto,
  UpdateFormFieldDto,
  FormProject,
  CreateFormProjectDto,
} from "../types/forms";
import { apiClient } from "./client";

class FormsService {
  async create(data: CreateFormDto) {
    const response = await apiClient.post<Form>("/forms", data);
    return response.data;
  }

  async findAll(organizationId: string) {
    const response = await apiClient.get<Form[]>(
      `/forms/organization/${organizationId}`
    );
    return response.data;
  }

  async findFormsByProject(projectId: string) {
    const response = await apiClient.get<
      (Form & { projects: { projectId: string; id: string }[] })[]
    >(`/forms/project/${projectId}`);
    return response.data;
  }

  async findOne(id: string) {
    const response = await apiClient.get<Form>(`/forms/${id}`);
    return response.data;
  }

  async update(id: string, data: UpdateFormDto) {
    const response = await apiClient.patch<Form>(`/forms/${id}`, data);
    return response.data;
  }

  async remove(id: string) {
    const response = await apiClient.delete<Form>(`/forms/${id}`);
    return response.data;
  }

  // Form Section methods
  async createSection(formId: string, data: CreateFormSectionDto) {
    const response = await apiClient.post<FormSection>(
      `/forms/${formId}/sections`,
      data
    );
    return response.data;
  }

  async updateSection(
    formId: string,
    sectionId: string,
    data: UpdateFormSectionDto
  ) {
    const response = await apiClient.patch<FormSection>(
      `/forms/${formId}/sections/${sectionId}`,
      data
    );
    return response.data;
  }

  async deleteSection(formId: string, sectionId: string) {
    const response = await apiClient.delete<FormSection>(
      `/forms/${formId}/sections/${sectionId}`
    );
    return response.data;
  }

  // Form Field methods
  async createField(formId: string, data: CreateFormFieldDto) {
    const response = await apiClient.post<FormField>(
      `/forms/${formId}/fields`,
      data
    );
    return response.data;
  }

  async updateField(formId: string, fieldId: string, data: UpdateFormFieldDto) {
    const response = await apiClient.patch<FormField>(
      `/forms/${formId}/fields/${fieldId}`,
      data
    );
    return response.data;
  }

  async deleteField(formId: string, fieldId: string) {
    const response = await apiClient.delete<FormField>(
      `/forms/${formId}/fields/${fieldId}`
    );
    return response.data;
  }

  // Form Project methods
  async addFormToProject(projectId: string, formId: string) {
    const response = await apiClient.post<FormProject>(
      `/forms/projects/${projectId}/forms`,
      { formId }
    );
    return response.data;
  }

  async removeFormFromProject(projectId: string, formId: string) {
    const response = await apiClient.delete<FormProject>(
      `/forms/projects/${projectId}/forms/${formId}`
    );
    return response.data;
  }

  async getProjectForms(projectId: string) {
    const response = await apiClient.get<FormProject[]>(
      `/forms/projects/${projectId}/forms`
    );
    return response.data;
  }

  // Form Response methods
  async createResponse(data: CreateFormResponseDto) {
    const response = await apiClient.post<FormResponse>(
      "/forms/response",
      data
    );
    return response.data;
  }

  async getProjectResponses(projectId: string) {
    const response = await apiClient.get<FormResponse[]>(
      `/forms/project/${projectId}/responses`
    );
    return response.data;
  }

  async getResponse(id: string) {
    const response = await apiClient.get<FormResponse>(`/forms/response/${id}`);
    return response.data;
  }

  async updateResponse(
    id: string,
    fields: { fieldId: string; value?: string }[]
  ) {
    const response = await apiClient.patch<FormResponse>(
      `/forms/response/${id}`,
      {
        fields,
      }
    );
    return response.data;
  }

  async removeResponse(id: string) {
    const response = await apiClient.delete<FormResponse>(
      `/forms/response/${id}`
    );
    return response.data;
  }

  async generatePdf(projectId: string, responseIds: string[]) {
    const response = await apiClient.post<Blob>(
      `/forms/project/${projectId}/responses/generate-pdf`,
      { responseIds },
      {
        responseType: "blob",
      }
    );
    return response.data;
  }
}

export const formsService = new FormsService();
