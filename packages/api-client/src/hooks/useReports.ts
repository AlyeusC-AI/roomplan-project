import useSWR from "swr";
import { reportsService } from "../services/reports";
import {
  Report,
  CreateReportRequest,
  UpdateReportRequest,
} from "../types/report";

export const useReports = (projectId: string) => {
  const { data, error, mutate } = useSWR<Report[]>(
    projectId ? [`reports`, projectId] : null,
    () => reportsService.findAll(projectId)
  );

  return {
    reports: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};

export const useReport = (id: string) => {
  const { data, error, mutate } = useSWR<Report>(
    id ? [`report`, id] : null,
    () => reportsService.findOne(id)
  );

  return {
    report: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};

export const useCreateReport = () => {
  const createReport = async (data: CreateReportRequest) => {
    return reportsService.create(data);
  };

  return { createReport };
};

export const useUpdateReport = () => {
  const updateReport = async (id: string, data: UpdateReportRequest) => {
    return reportsService.update(id, data);
  };

  return { updateReport };
};

export const useDeleteReport = () => {
  const deleteReport = async (id: string) => {
    return reportsService.remove(id);
  };

  return { deleteReport };
};

export const useGeneratePDF = () => {
  const generatePDF = async (id: string) => {
    return reportsService.generatePDF(id);
  };

  return { generatePDF };
};
