"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ClipboardList,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
} from "lucide-react";
import { FormPreview } from "@/app/(logged-in)/forms/components/FormPreview";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FormConnectionModal } from "./components/FormConnectionModal";
import {
  useGetFormsByProject,
  useGetProjectFormResponses,
  useCreateFormResponse,
  Form,
} from "@service-geek/api-client";

export default function ProjectFormsPage() {
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const params = useParams();
  const projectId = params.id as string;
  const { data: forms, isLoading: isFormsLoading } =
    useGetFormsByProject(projectId);
  console.log("🚀 ~ ProjectFormsPage ~ forms:", forms);
  const { data: responses, isLoading: isResponsesLoading } =
    useGetProjectFormResponses(projectId);
  const isLoading = isFormsLoading || isResponsesLoading;
  const [responseCount, setResponseCount] = useState<{ [key: string]: number }>(
    {}
  );
  const { mutate: submitForm, isPending: isSubmitting } =
    useCreateFormResponse();

  useEffect(() => {
    if (forms && responses) {
      const responseCount = responses.reduce(
        (acc: { [key: string]: number }, response: any) => {
          acc[response.formId] = (acc[response.formId] || 0) + 1;
          return acc;
        },
        {}
      );
      setResponseCount(responseCount);
    }
  }, [forms, responses]);

  const handleSubmitForm = async (
    formData: {
      fieldId: string;
      value: string;
    }[]
  ) => {
    if (!selectedForm) return;

    try {
      await submitForm({
        formId: selectedForm.id,
        fields: formData,
        projectId: projectId,
      });
      toast.success("Form submitted successfully");
      setSelectedForm(null);
      // fetchProjectForms();
    } catch (error) {
      console.error("Error submitting form:", error);
      // toast.error("Failed to submit form");
    }
  };
  //
  if (isLoading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <div className='h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
          <p className='text-sm text-muted-foreground'>Loading forms...</p>
        </div>
      </div>
    );
  }

  if (selectedForm) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold dark:text-gray-100'>
                {selectedForm.name}
              </h1>
              <p className='mt-1 text-sm text-muted-foreground'>
                Fill out the form below
              </p>
            </div>
            <Button
              variant='outline'
              onClick={() => setSelectedForm(null)}
              className='dark:border-gray-700 dark:text-gray-100'
            >
              Back to Forms
            </Button>
          </div>
          <Card className='p-6'>
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
    <div className='container mx-auto px-4 py-8'>
      <FormConnectionModal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
      />

      <div className='space-y-6'>
        <div className='flex items-start justify-between'>
          <div>
            <h1 className='text-lg font-medium dark:text-gray-100'>
              Project Forms
            </h1>
            <p className='text-sm text-muted-foreground'>
              View and fill out forms associated with this project
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              onClick={() => setIsConnectionModalOpen(true)}
              className='gap-2'
            >
              <LinkIcon className='h-4 w-4' />
              Manage Forms
            </Button>
            <Link href={`/projects/${projectId}/forms/responses`}>
              <Button variant='outline' className='gap-2'>
                <ClipboardList className='h-4 w-4' />
                View Responses
              </Button>
            </Link>
          </div>
        </div>

        {forms?.length === 0 ? (
          <Card className='p-8'>
            <div className='flex flex-col items-center justify-center text-center'>
              <div className='mb-4 rounded-full bg-muted p-3'>
                <FileText className='h-8 w-8 text-muted-foreground' />
              </div>
              <h3 className='mb-1 font-semibold'>No forms connected</h3>
              <p className='mb-4 max-w-sm text-sm text-muted-foreground'>
                There are no forms connected to this project yet.
              </p>
              <Button
                onClick={() => setIsConnectionModalOpen(true)}
                className='gap-2'
              >
                <LinkIcon className='h-4 w-4' />
                Connect Forms
              </Button>
            </div>
          </Card>
        ) : (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {forms?.map((form) => (
              <Card
                key={form.id}
                className='p-5 transition-shadow hover:shadow-md'
              >
                <div className='space-y-4'>
                  <div>
                    <div className='flex items-start justify-between gap-4'>
                      <h3 className='line-clamp-2 font-semibold dark:text-gray-100'>
                        {form.name}
                      </h3>
                      <Link
                        href={`/projects/${projectId}/forms/responses?formId=${form.id}`}
                        className='no-underline'
                      >
                        <Badge
                          variant={
                            responseCount[form.id] ? "secondary" : "destructive"
                          }
                          className={cn(
                            "shrink-0 cursor-pointer transition-opacity hover:opacity-80",
                            responseCount[form.id] ? "" : "animate-pulse"
                          )}
                        >
                          {responseCount[form.id] || 0} Responses
                        </Badge>
                      </Link>
                    </div>
                    {form.description && (
                      <p className='mt-2 line-clamp-2 text-sm text-muted-foreground'>
                        {form.description}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className='space-y-3'>
                    <div className='flex items-center gap-2 text-sm'>
                      <div className='flex items-center gap-2 text-muted-foreground'>
                        <CheckCircle2 className='h-4 w-4' />
                        <span>{form.sections?.length || 0} Sections</span>
                      </div>
                      <span className='text-muted-foreground'>•</span>
                      <div className='flex items-center gap-2 text-muted-foreground'>
                        <AlertCircle className='h-4 w-4' />
                        <span>
                          {form.sections?.reduce(
                            (acc, section) =>
                              acc + (section.fields?.length || 0),
                            0
                          ) || 0}{" "}
                          Fields
                        </span>
                      </div>
                    </div>

                    <Button
                      className='w-full gap-2'
                      onClick={() => setSelectedForm(form)}
                    >
                      Fill Form
                      <ArrowRight className='h-4 w-4' />
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
