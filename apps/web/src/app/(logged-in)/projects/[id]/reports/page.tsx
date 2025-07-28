"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  useReports,
  useCreateReport,
  useDeleteReport,
  useGeneratePDF,
} from "@service-geek/api-client";
import { ReportStatus } from "@service-geek/api-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Play,
  Trash2,
  FileText,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function ReportsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const { reports, isLoading, mutate } = useReports(projectId!);
  const { createReport } = useCreateReport();
  const { deleteReport } = useDeleteReport();
  const { generatePDF } = useGeneratePDF();
  const [isCreating, setIsCreating] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const handleCreateReport = async () => {
    setIsCreating(true);
    try {
      await createReport({
        name: `Report ${new Date().toLocaleDateString()}`,
        description: "Project report",
        projectId: projectId!,
      });
      mutate();
      toast.success("Report created successfully");
    } catch (error) {
      toast.error("Failed to create report");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      await deleteReport(reportId);
      mutate();
      toast.success("Report deleted successfully");
    } catch (error) {
      toast.error("Failed to delete report");
    }
  };

  const handleGeneratePDF = async (reportId: string) => {
    setGeneratingId(reportId);
    try {
      const blob = await generatePDF(reportId);

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      mutate();
      toast.success("PDF generated successfully");
    } catch (error) {
      toast.error("Failed to generate PDF");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDownloadPDF = async (report: any) => {
    if (!report.fileUrl) {
      toast.error("No PDF file available for download");
      return;
    }

    try {
      // Download the PDF from the stored URL
      const response = await fetch(report.fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.name}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error("Failed to download PDF");
    }
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.COMPLETED:
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case ReportStatus.GENERATING:
        return <Clock className='h-4 w-4 text-yellow-500' />;
      case ReportStatus.FAILED:
        return <XCircle className='h-4 w-4 text-red-500' />;
      default:
        return <AlertCircle className='h-4 w-4 text-gray-500' />;
    }
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      case ReportStatus.GENERATING:
        return "bg-yellow-100 text-yellow-800";
      case ReportStatus.FAILED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.COMPLETED:
        return "Completed";
      case ReportStatus.GENERATING:
        return "Generating";
      case ReportStatus.FAILED:
        return "Failed";
      default:
        return "Pending";
    }
  };

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8'>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Reports</h1>
          <p className='mt-2 text-gray-600'>
            Generate and manage PDF reports for this project
          </p>
        </div>
        <Button onClick={handleCreateReport} disabled={isCreating}>
          {isCreating ? (
            <div className='h-4 w-4 animate-spin rounded-full border-b-2 border-white'></div>
          ) : (
            <Plus className='mr-2 h-4 w-4' />
          )}
          Create Report
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card className='py-12 text-center'>
          <CardContent>
            <FileText className='mx-auto mb-4 h-12 w-12 text-gray-400' />
            <h3 className='mb-2 text-lg font-medium text-gray-900'>
              No reports yet
            </h3>
            <p className='mb-4 text-gray-600'>
              Create your first report to get started
            </p>
            <Button onClick={handleCreateReport} disabled={isCreating}>
              {isCreating ? (
                <div className='h-4 w-4 animate-spin rounded-full border-b-2 border-white'></div>
              ) : (
                <Plus className='mr-2 h-4 w-4' />
              )}
              Create Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {reports.map((report) => (
            <Card key={report.id} className='transition-shadow hover:shadow-lg'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg'>{report.name}</CardTitle>
                  <Badge className={getStatusColor(report.status)}>
                    <div className='flex items-center gap-1'>
                      {getStatusIcon(report.status)}
                      {getStatusText(report.status)}
                    </div>
                  </Badge>
                </div>
                {report.description && (
                  <CardDescription>{report.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='text-sm text-gray-600'>
                    <p>
                      Created by {report.createdBy.firstName}{" "}
                      {report.createdBy.lastName}
                    </p>
                    <p>{new Date(report.createdAt).toLocaleDateString()}</p>
                    {report.generatedAt && (
                      <p>
                        Generated:{" "}
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className='flex gap-2'>
                    {report.status === ReportStatus.COMPLETED && (
                      <Button
                        size='sm'
                        onClick={() => handleDownloadPDF(report)}
                      >
                        <Download className='mr-2 h-4 w-4' />
                        Download PDF
                      </Button>
                    )}

                    {report.status === ReportStatus.PENDING && (
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleGeneratePDF(report.id)}
                        disabled={generatingId === report.id}
                      >
                        {generatingId === report.id ? (
                          <div className='h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600'></div>
                        ) : (
                          <Play className='mr-2 h-4 w-4' />
                        )}
                        Generate PDF
                      </Button>
                    )}

                    <Button
                      size='sm'
                      variant='destructive'
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      <Trash2 className='mr-2 h-4 w-4' />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
