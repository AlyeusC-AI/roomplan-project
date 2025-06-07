"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormBuilder } from "./components/FormBuilder";
import { FormPreview } from "./components/FormPreview";
import { toast } from "sonner";
import {
  Plus,
  LayoutGrid,
  List,
  FileText,
  Trash2,
  Eye,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CreateFormDto,
  Form,
  useCreateForm,
  useDeleteForm,
  useGetFormById,
  useGetForms,
  useUpdateForm,
} from "@service-geek/api-client";

export default function FormsPage() {
  const [selectedForm, setSelectedForm] = useState<Partial<Form> | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFormsListCollapsed, setIsFormsListCollapsed] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: forms, isLoading } = useGetForms();
  const { data: formById, isLoading: isFormByIdLoading } = useGetFormById(
    selectedForm?.id!
  );
  useEffect(() => {
    if (formById) {
      setSelectedForm(formById);
    }
  }, [formById]);
  console.log("🚀 ~ FormsPage ~ forms:", formById);
  const { mutate: createForm, data: createdForm } = useCreateForm();
  const { mutate: updateForm, data: updatedForm } = useUpdateForm();
  const { mutate: deleteForm, data: deletedForm } = useDeleteForm();
  useEffect(() => {
    if (forms) {
      setSelectedForm(
        selectedForm
          ? forms.find((f) => f.id === selectedForm.id) || forms[0]
          : forms[0] || null
      );
    }
  }, [forms]);
  useEffect(() => {
    if (createdForm) {
      setSelectedForm(createdForm);
    }
  }, [createdForm]);

  const handleSaveForm = async (form: CreateFormDto) => {
    setIsSaving(true);
    try {
      await createForm({
        name: form.name,
        description: form.description,
        lossTypes: form.lossTypes,
      });
      toast.success("Form saved successfully");
    } catch (error) {
      console.error("Error saving form:", error);
      // toast.error("Failed to save form");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateForm = async (form: Form) => {
    setIsUpdating(true);
    try {
      await updateForm({
        id: form.id,
        data: {
          name: form.name,
          description: form.description,
          lossTypes: form.lossTypes,
        },
      });

      toast.success("Form updated successfully");
    } catch (error) {
      console.error("Error updating form:", error);
      toast.error("Failed to update form");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    const form = forms?.find((f) => f.id === formId);
    if (!form) return;
    setFormToDelete(form);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!formToDelete) return;
    setIsDeleting(true);

    try {
      await deleteForm(formToDelete.id);

      toast.success("Form deleted successfully");
      setSelectedForm(null);
      setIsFormsListCollapsed(false);
    } catch (error) {
      console.error("Error deleting form:", error);
      // toast.error("Failed to delete form");
    } finally {
      setDeleteDialogOpen(false);
      setFormToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleNewForm = () => {
    setSelectedForm({
      name: "",
      description: "",
      sections: [],
    });
    setIsPreviewMode(false);
    setIsFormsListCollapsed(true);
  };

  useEffect(() => {
    if (selectedForm) {
      setIsFormsListCollapsed(true);
    }
  }, [selectedForm]);

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-4 sm:py-8'>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className='sm:max-w-[425px]'>
          <AlertDialogHeader>
            <div className='flex items-center gap-2'>
              <div className='rounded-full bg-destructive/10 p-2'>
                <Trash2 className='h-5 w-5 text-destructive' />
              </div>
              <AlertDialogTitle className='dark:text-gray-100'>
                Delete Form
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className='pt-2 dark:text-gray-300'>
              Are you sure you want to delete "{formToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className='dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className='mb-6 flex flex-col items-start justify-between space-y-4 sm:mb-8 sm:flex-row sm:items-center sm:space-y-0'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl'>
            Form Builder
          </h1>
          <p className='mt-2 text-sm text-gray-600 dark:text-gray-400 sm:text-base'>
            Create and manage your forms with ease
          </p>
        </div>
        <div className='flex w-full items-center space-x-2 sm:w-auto sm:space-x-4'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setIsFormsListCollapsed(!isFormsListCollapsed)}
                  className='flex-1 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700 sm:flex-none'
                >
                  {isFormsListCollapsed ? (
                    <>
                      <ChevronRight className='mr-2 h-4 w-4' />
                      Show Forms List
                    </>
                  ) : (
                    <>
                      <ChevronLeft className='mr-2 h-4 w-4' />
                      Hide Forms List
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isFormsListCollapsed ? "Show forms list" : "Hide forms list"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleNewForm}
                  className='flex-1 bg-primary transition-colors hover:bg-primary/90 sm:flex-none'
                >
                  <Plus className='mr-2 h-4 w-4' />
                  New Form
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create a new form</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div
        className={cn(
          "grid gap-4 transition-all duration-300 ease-in-out sm:gap-8",
          isFormsListCollapsed ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-4"
        )}
      >
        <Card
          className={cn(
            "p-4 shadow-sm transition-all duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-800 sm:p-6",
            isFormsListCollapsed ? "hidden" : "block"
          )}
        >
          <div className='mb-4 flex items-center justify-between sm:mb-6'>
            <div className='flex items-center space-x-2'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100 sm:text-xl'>
                Forms List
              </h2>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='flex items-center space-x-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-700'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "transition-colors hover:bg-white dark:hover:bg-gray-600",
                    viewMode === "grid"
                      ? "bg-white shadow-sm dark:bg-gray-600"
                      : ""
                  )}
                >
                  <LayoutGrid className='h-4 w-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "transition-colors hover:bg-white dark:hover:bg-gray-600",
                    viewMode === "list"
                      ? "bg-white shadow-sm dark:bg-gray-600"
                      : ""
                  )}
                >
                  <List className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>

          <ScrollArea className='h-[calc(100vh-20rem)]'>
            {forms?.length === 0 ? (
              <div className='flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400'>
                <FileText className='mb-4 h-12 w-12 animate-pulse' />
                <p className='text-base sm:text-lg'>No forms created yet</p>
                <p className='mt-2 text-sm'>
                  Click "New Form" to create your first form
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className='grid grid-cols-1 gap-4'>
                {forms?.map((form) => (
                  <Card
                    key={form.id}
                    className={cn(
                      "cursor-pointer p-4 transition-all duration-200",
                      "hover:border-primary/20 hover:shadow-md",
                      "dark:border-gray-700 dark:bg-gray-800",
                      selectedForm?.id === form.id
                        ? "border-primary bg-primary/5 shadow-md dark:bg-primary/10"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    )}
                    onClick={() => setSelectedForm(form)}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='space-y-2'>
                        <h3 className='font-medium text-gray-900 dark:text-gray-100'>
                          {form.name}
                        </h3>
                        {form.description && (
                          <p className='line-clamp-2 text-sm text-gray-600 dark:text-gray-400'>
                            {form.description}
                          </p>
                        )}
                        <div className='flex items-center text-sm text-gray-500 dark:text-gray-400'>
                          <FileText className='mr-1 h-4 w-4' />
                          {form.sections?.length || 0} sections
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className='space-y-2'>
                {forms?.map((form) => (
                  <div
                    key={form.id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-lg p-4 transition-all duration-200",
                      "hover:bg-gray-50 dark:hover:bg-gray-700/50",
                      "dark:border-gray-700 dark:bg-gray-800",
                      selectedForm?.id === form.id
                        ? "bg-primary/5 dark:bg-primary/10"
                        : ""
                    )}
                    onClick={() => setSelectedForm(form)}
                  >
                    <div className='flex-1 space-y-1'>
                      <div className='font-medium text-gray-900 dark:text-gray-100'>
                        {form.name}
                      </div>
                      {form.description && (
                        <div className='line-clamp-1 text-sm text-gray-600 dark:text-gray-400'>
                          {form.description}
                        </div>
                      )}
                    </div>
                    <div className='flex items-center space-x-2 opacity-0 transition-opacity group-hover:opacity-100'>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedForm(form);
                                setIsPreviewMode(true);
                              }}
                              className='hover:bg-primary/10 dark:hover:bg-primary/20'
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Preview form</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteForm(form.id!);
                              }}
                              className='hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete form</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        <Card
          className={cn(
            "px-4 pb-0 pt-4 shadow-sm transition-all duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-800 sm:px-6 sm:pt-6",
            isFormsListCollapsed ? "lg:col-span-1" : "lg:col-span-3"
          )}
        >
          <div className='mb-4 flex items-center justify-between sm:mb-6'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100 sm:text-xl'>
              {selectedForm ? "Edit Form" : "Form Preview"}
            </h2>
            {selectedForm && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                      className='transition-colors hover:bg-primary/5 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-primary/10'
                    >
                      {isPreviewMode ? "Edit Mode" : "Preview Mode"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {isPreviewMode
                        ? "Switch to edit mode"
                        : "Switch to preview mode"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <ScrollArea
            className={cn(
              "transition-all duration-300 ease-in-out",
              isFormsListCollapsed
                ? "h-[calc(100vh-12rem)]" // Taller when forms list is collapsed
                : "h-[calc(100vh-20rem)]" // Original height when forms list is visible
            )}
          >
            {selectedForm ? (
              isPreviewMode ? (
                <FormPreview form={selectedForm as Form} />
              ) : (
                <FormBuilder
                  form={selectedForm as Form}
                  onSave={handleSaveForm}
                  onUpdate={handleUpdateForm}
                  onDelete={handleDeleteForm}
                  isFormsListCollapsed={isFormsListCollapsed}
                  setSelectedForm={setSelectedForm}
                  isSaving={isSaving}
                  isUpdating={isUpdating}
                  isDeleting={isDeleting}
                />
              )
            ) : (
              <div className='flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400'>
                <FileText className='mb-4 h-12 w-12 animate-pulse' />
                <p className='text-base sm:text-lg'>
                  Select a form to edit or create a new one
                </p>
                <p className='mt-2 text-sm'>
                  Choose from the list or start fresh
                </p>
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
