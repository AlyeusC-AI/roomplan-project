import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Edit2,
  ChevronLeft,
  Clock,
  Calendar,
  Filter,
  Printer,
  Check,
  Eye,
  Info,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { FormPreview } from "@/app/(logged-in)/forms/components/FormPreview";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generatePDF } from "../utils/pdfGenerator";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponseViewer } from "./ResponseViewer";
import {
  FormResponse,
  useGenerateFormResponsesPdf,
  useGetFormById,
  useGetForms,
  useGetFormsByProject,
  useGetProjectFormResponses,
  useRemoveFormResponse,
  useUpdateFormResponse,
} from "@service-geek/api-client";

export function FormResponses() {
  const [filteredResponses, setFilteredResponses] = useState<FormResponse[]>(
    []
  );
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedResponses, setSelectedResponses] = useState<Set<string>>(
    new Set()
  );
  const [viewMode, setViewMode] = useState<"edit" | "info">("info");
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = params.id as string;
  const formId = searchParams.get("formId");
  const [currentResponseIndex, setCurrentResponseIndex] = useState(0);
  const { data: forms, isLoading: isFormsLoading } =
    useGetFormsByProject(projectId);

  const { data: responses, isLoading: isResponsesLoading } =
    useGetProjectFormResponses(projectId);
  const { mutate: updateFormResponse } = useUpdateFormResponse();
  const { mutate: removeFormResponse } = useRemoveFormResponse();
  const { mutateAsync: generatePdf } = useGenerateFormResponsesPdf(projectId);
  const isLoading = isFormsLoading || isResponsesLoading;
  const { data: form } = useGetFormById(selectedResponse?.formId || "");

  useEffect(() => {
    if (formId && responses) {
      setFilteredResponses(responses.filter((r) => r.formId === formId));
    } else if (responses) {
      setFilteredResponses(responses);
    }
  }, [responses, formId]);

  const handleFilterChange = (value: string) => {
    const url = new URL(window.location.href);
    if (value === "all") {
      url.searchParams.delete("formId");
    } else {
      url.searchParams.set("formId", value);
    }
    router.push(url.pathname + url.search);
  };

  const handleSubmitForm = async (
    formData: {
      fieldId: string;
      value: string;
    }[]
  ) => {
    if (!selectedResponse) return;

    setIsSubmitting(true);
    try {
      const response = await updateFormResponse({
        id: selectedResponse.id,
        fields: formData,
      });

      toast.success("Form updated successfully");
      setSelectedResponse(null);
    } catch (error) {
      console.error("Error updating form:", error);
      // toast.error("Failed to update form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeneratePDF = async (
    responses: FormResponse[],
    title: string
  ) => {
    const loadingToast = toast.loading("Generating PDF...");
    try {
      const response = await generatePdf(responses.map((r) => r.id));

      // Get the PDF blob from the response
      const pdfBlob = response;

      // Create a URL for the blob
      const url = window.URL.createObjectURL(pdfBlob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.download = `form-responses-${format(new Date(), "yyyy-MM-dd")}.pdf`;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL
      window.URL.revokeObjectURL(url);

      toast.success("PDF generated successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleSelectResponse = (responseId: string) => {
    const newSelected = new Set(selectedResponses);
    if (newSelected.has(responseId)) {
      newSelected.delete(responseId);
    } else {
      newSelected.add(responseId);
    }
    setSelectedResponses(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedResponses.size === filteredResponses.length) {
      setSelectedResponses(new Set());
    } else {
      setSelectedResponses(new Set(filteredResponses.map((r) => r.id)));
    }
  };

  const handleGenerateSelectedPDF = async () => {
    if (selectedResponses.size === 0) {
      toast.error("Please select at least one response");
      return;
    }

    const selectedItems = filteredResponses.filter((r) =>
      selectedResponses.has(r.id)
    );
    await handleGeneratePDF(
      selectedItems,
      selectedFormName || "Selected Form Responses"
    );
  };

  const navigateToResponse = (index: number) => {
    if (index >= 0 && index < filteredResponses.length) {
      setSelectedResponse(filteredResponses[index]);
      setCurrentResponseIndex(index);
    }
  };

  const navigateNext = () => {
    navigateToResponse(currentResponseIndex + 1);
  };

  const navigatePrevious = () => {
    navigateToResponse(currentResponseIndex - 1);
  };

  useEffect(() => {
    if (selectedResponse) {
      const index = filteredResponses.findIndex(
        (r) => r.id === selectedResponse.id
      );
      if (index !== -1) {
        setCurrentResponseIndex(index);
      }
    }
  }, [selectedResponse, filteredResponses]);

  if (isLoading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <div className='h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
          <p className='text-sm text-muted-foreground'>Loading responses...</p>
        </div>
      </div>
    );
  }

  if (selectedResponse) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setSelectedResponse(null)}
                className='h-8 w-8'
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <div>
                <h1 className='text-2xl font-bold dark:text-gray-100'>
                  {selectedResponse.form.name}
                </h1>
                <p className='text-sm text-muted-foreground'>
                  Response submitted on{" "}
                  {format(new Date(selectedResponse.createdAt), "MMMM d, yyyy")}{" "}
                  at {format(new Date(selectedResponse.createdAt), "h:mm a")}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Tabs
                value={viewMode}
                onValueChange={(v) => setViewMode(v as "edit" | "info")}
              >
                <TabsList>
                  <TabsTrigger value='info' className='gap-2'>
                    <Eye className='h-4 w-4' />
                    View
                  </TabsTrigger>
                  <TabsTrigger value='edit' className='gap-2'>
                    <Edit2 className='h-4 w-4' />
                    Edit
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  handleGeneratePDF(
                    [selectedResponse],
                    `${selectedResponse.form.name} - Response #${selectedResponse.id}`
                  )
                }
                className='gap-2'
              >
                <Printer className='h-4 w-4' />
                Download PDF
              </Button>
            </div>
          </div>

          <Card className='p-6'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-lg font-semibold'>Response Details</h2>
                  <p className='text-sm text-muted-foreground'>
                    {viewMode === "edit"
                      ? "Review and edit the form response below"
                      : "View the form response details below"}
                  </p>
                </div>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={navigatePrevious}
                      disabled={currentResponseIndex === 0}
                      className='h-8 w-8'
                    >
                      <ChevronLeft className='h-4 w-4' />
                    </Button>
                    <div className='text-sm text-muted-foreground'>
                      <span className='font-medium text-foreground'>
                        {currentResponseIndex + 1}
                      </span>
                      {" / "}
                      <span>{filteredResponses.length}</span>
                    </div>
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={navigateNext}
                      disabled={
                        currentResponseIndex === filteredResponses.length - 1
                      }
                      className='h-8 w-8'
                    >
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                  </div>
                  <Badge variant='outline' className='text-xs'>
                    ID: {selectedResponse.id}
                  </Badge>
                </div>
              </div>
              <Separator />

              {viewMode === "edit" ? (
                <FormPreview
                  form={form!}
                  onSubmit={handleSubmitForm}
                  isSubmitting={isSubmitting}
                  initialValues={selectedResponse.formResponseFields.reduce(
                    (acc, field) => ({
                      ...acc,
                      [field.field.id]: field.value,
                    }),
                    {}
                  )}
                />
              ) : (
                <ResponseViewer response={selectedResponse} />
              )}
            </div>
          </Card>

          <div className='fixed bottom-6 left-1/2 -translate-x-1/2 transform'>
            <Card className='p-2 shadow-lg'>
              <div className='flex items-center gap-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => navigateToResponse(0)}
                  disabled={currentResponseIndex === 0}
                  className='text-xs'
                >
                  First
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={navigatePrevious}
                  disabled={currentResponseIndex === 0}
                  className='h-8 w-8'
                >
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                <div className='flex min-w-[100px] items-center justify-center gap-2 px-2'>
                  <Select
                    value={currentResponseIndex.toString()}
                    onValueChange={(value) =>
                      navigateToResponse(parseInt(value))
                    }
                  >
                    <SelectTrigger className='h-8 w-[80px]'>
                      <SelectValue>{currentResponseIndex + 1}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {filteredResponses.map((_, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {index + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className='text-sm text-muted-foreground'>
                    of {filteredResponses.length}
                  </span>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={navigateNext}
                  disabled={
                    currentResponseIndex === filteredResponses.length - 1
                  }
                  className='h-8 w-8'
                >
                  <ChevronRight className='h-4 w-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() =>
                    navigateToResponse(filteredResponses.length - 1)
                  }
                  disabled={
                    currentResponseIndex === filteredResponses.length - 1
                  }
                  className='text-xs'
                >
                  Last
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const totalResponses = filteredResponses.length;
  const selectedFormName = formId
    ? forms?.find((f) => f.id === formId)?.name
    : null;

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='space-y-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl font-bold dark:text-gray-100'>
              Form Responses
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              {selectedFormName
                ? `Showing responses for "${selectedFormName}"`
                : "View and manage all form submissions for this project"}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-2'>
              <Filter className='h-4 w-4 text-muted-foreground' />
              <Select
                value={formId || "all"}
                onValueChange={handleFilterChange}
              >
                <SelectTrigger className='w-[200px]'>
                  <SelectValue placeholder='Filter by form' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Forms</SelectItem>
                  {forms?.map((form) => (
                    <SelectItem key={form.id} value={form.id!.toString()}>
                      {form.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filteredResponses.length > 0 && (
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleGenerateSelectedPDF}
                  className='gap-2'
                  disabled={selectedResponses.size === 0}
                >
                  <Printer className='h-4 w-4' />
                  Download Selected
                </Button>
              </div>
            )}
          </div>
        </div>

        {filteredResponses.length === 0 ? (
          <Card className='p-8'>
            <div className='flex flex-col items-center justify-center text-center'>
              <div className='mb-4 rounded-full bg-muted p-3'>
                <FileText className='h-8 w-8 text-muted-foreground' />
              </div>
              <h3 className='mb-1 font-semibold'>No responses found</h3>
              <p className='max-w-sm text-sm text-muted-foreground'>
                {formId
                  ? "There are no responses for this form yet."
                  : "When forms are submitted, they will appear here for review and management."}
              </p>
            </div>
          </Card>
        ) : (
          <>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Badge variant='secondary' className='rounded-full'>
                  {totalResponses}{" "}
                  {totalResponses === 1 ? "Response" : "Responses"}
                </Badge>
                {selectedFormName && (
                  <Button
                    variant='ghost'
                    className='h-auto p-0 text-sm font-normal hover:bg-transparent hover:underline'
                    onClick={() => handleFilterChange("all")}
                  >
                    Clear filter
                  </Button>
                )}
              </div>
              <div className='flex items-center gap-2'>
                <Checkbox
                  checked={
                    selectedResponses.size === filteredResponses.length &&
                    filteredResponses.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                  id='select-all'
                />
                <label
                  htmlFor='select-all'
                  className='cursor-pointer text-sm text-muted-foreground'
                >
                  Select All
                </label>
                {selectedResponses.size > 0 && (
                  <Badge variant='secondary'>
                    {selectedResponses.size} selected
                  </Badge>
                )}
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {filteredResponses.map((response) => (
                <Card
                  key={response.id}
                  className='group relative cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg dark:hover:shadow-primary/5'
                  onClick={() => {
                    setSelectedResponse(response);
                    setViewMode("info");
                  }}
                >
                  {/* Hover Effect Gradient Border */}
                  <div className='pointer-events-none absolute inset-0 rounded-lg border border-transparent transition-colors group-hover:border-primary/20' />

                  {/* Checkbox - Stop event propagation */}
                  <div
                    className='absolute right-0 top-0 z-20 flex items-center gap-1.5 p-3'
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Checkbox
                      checked={selectedResponses.has(response.id)}
                      onCheckedChange={() => handleSelectResponse(response.id)}
                      className='h-4 w-4'
                    />
                  </div>

                  <div className='p-5'>
                    <div className='space-y-4'>
                      {/* Header Section */}
                      <div>
                        <div className='mb-2 flex items-start gap-3'>
                          <div className='min-w-0 flex-1'>
                            <h3 className='line-clamp-2 text-base font-semibold transition-colors group-hover:text-primary dark:text-gray-100'>
                              {response.form.name}
                            </h3>
                            <div className='mt-1.5 flex items-center gap-2'>
                              {/* <Badge variant='outline' className='text-xs'>
                                #{response.id}
                              </Badge> */}
                              <span className='text-xs text-muted-foreground'>
                                {format(
                                  new Date(response.createdAt),
                                  "MMM d, yyyy"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Info Section */}
                      <div className='grid grid-cols-2 gap-3 py-2'>
                        <div className='space-y-1'>
                          <p className='text-xs text-muted-foreground'>
                            Submitted
                          </p>
                          <div className='flex items-center gap-1.5'>
                            <Clock className='h-3.5 w-3.5 text-muted-foreground' />
                            <span className='text-sm'>
                              {format(new Date(response.createdAt), "h:mm a")}
                            </span>
                          </div>
                        </div>
                        <div className='space-y-1'>
                          <p className='text-xs text-muted-foreground'>
                            Fields
                          </p>
                          <div className='flex items-center gap-1.5'>
                            <FileText className='h-3.5 w-3.5 text-muted-foreground' />
                            <span className='text-sm'>
                              {response.formResponseFields.length} responses
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions Section - Stop event propagation */}
                      <div
                        className='flex flex-col gap-2'
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className='grid grid-cols-2 gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            className='w-full hover:bg-primary/10'
                            onClick={() => {
                              setSelectedResponse(response);
                              setViewMode("info");
                            }}
                          >
                            <Eye className='mr-1.5 h-3.5 w-3.5' />
                            View
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            className='w-full hover:bg-primary/10'
                            onClick={() => {
                              setSelectedResponse(response);
                              setViewMode("edit");
                            }}
                          >
                            <Edit2 className='mr-1.5 h-3.5 w-3.5' />
                            Edit
                          </Button>
                        </div>
                        <Button
                          variant='secondary'
                          size='sm'
                          className='w-full hover:bg-secondary/80'
                          onClick={() =>
                            handleGeneratePDF(
                              [response],
                              `${response.form.name} - Response #${response.id}`
                            )
                          }
                        >
                          <Printer className='mr-1.5 h-3.5 w-3.5' />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
