"use client";

import { useEffect, useState } from "react";
import { Form } from "@/app/(logged-in)/forms/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ClipboardList, ArrowRight, CheckCircle2, AlertCircle, Link as LinkIcon } from "lucide-react";
import { FormPreview } from "@/app/(logged-in)/forms/components/FormPreview";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FormConnectionModal } from "./components/FormConnectionModal";

export default function ProjectFormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseCount, setResponseCount] = useState<{[key: number]: number}>({});
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const params = useParams();
  const projectId = params.id as string;

  useEffect(() => {
    fetchProjectForms();
  }, [projectId]);

  const fetchProjectForms = async () => {
    try {
      const [formsResponse, responsesResponse] = await Promise.all([
        fetch(`/api/v1/projects/${projectId}/forms`),
        fetch(`/api/v1/projects/${projectId}/forms/responses`)
      ]);

      if (!formsResponse.ok) throw new Error("Failed to fetch forms");
      if (!responsesResponse.ok) throw new Error("Failed to fetch responses");

      const formsData = await formsResponse.json();
      const responsesData = await responsesResponse.json();

      setForms(formsData.forms);
      
      // Calculate response count for each form
      const counts = responsesData.responses.reduce((acc: {[key: number]: number}, response: any) => {
        acc[response.formId] = (acc[response.formId] || 0) + 1;
        return acc;
      }, {});
      setResponseCount(counts);
    } catch (error) {
      console.error("Error fetching forms:", error);
      toast.error("Failed to load forms");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitForm = async (formData: any) => {
    if (!selectedForm) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/forms/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: selectedForm.id,
          data: formData,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit form");
      
      toast.success("Form submitted successfully");
      setSelectedForm(null);
      fetchProjectForms();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading forms...</p>
        </div>
      </div>
    );
  }

  if (selectedForm) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold dark:text-gray-100">{selectedForm.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">Fill out the form below</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedForm(null)}
              className="dark:border-gray-700 dark:text-gray-100"
            >
              Back to Forms
            </Button>
          </div>
          <Card className="p-6">
            <FormPreview 
              form={selectedForm} 
              onSubmit={handleSubmitForm}
              isSubmitting={isSubmitting}
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <FormConnectionModal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        onConnectionChange={fetchProjectForms}
      />

      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold dark:text-gray-100">Project Forms</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and fill out forms associated with this project
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsConnectionModalOpen(true)}
              className="gap-2"
            >
              <LinkIcon className="h-4 w-4" />
              Manage Forms
            </Button>
            <Link href={`/projects/${projectId}/forms/responses`}>
              <Button variant="outline" className="gap-2">
                <ClipboardList className="h-4 w-4" />
                View Responses
              </Button>
            </Link>
          </div>
        </div>

        {forms.length === 0 ? (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No forms connected</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                There are no forms connected to this project yet.
              </p>
              <Button
                onClick={() => setIsConnectionModalOpen(true)}
                className="gap-2"
              >
                <LinkIcon className="h-4 w-4" />
                Connect Forms
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.map((form) => (
              <Card key={form.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold dark:text-gray-100 line-clamp-2">
                        {form.name}
                      </h3>
                      <Link 
                        href={`/projects/${projectId}/forms/responses?formId=${form.id}`}
                        className="no-underline"
                      >
                        <Badge 
                          variant={responseCount[form.id!] ? "secondary" : "destructive"} 
                          className={cn(
                            "shrink-0 cursor-pointer hover:opacity-80 transition-opacity",
                            responseCount[form.id!] ? "" : "animate-pulse"
                          )}
                        >
                          {responseCount[form.id!] || 0} Responses
                        </Badge>
                      </Link>
                    </div>
                    {form.desc && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {form.desc}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{form.sections?.length || 0} Sections</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          {form.sections?.reduce((acc, section) => acc + (section.fields?.length || 0), 0) || 0} Fields
                        </span>
                      </div>
                    </div>

                    <Button 
                      className="w-full gap-2" 
                      onClick={() => setSelectedForm(form)}
                    >
                      Fill Form
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
