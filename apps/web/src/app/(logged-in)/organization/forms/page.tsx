"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormBuilder } from "./components/FormBuilder";
import { FormPreview } from "./components/FormPreview";
import { Form } from "./types";
import { toast } from "sonner";
import { Plus, LayoutGrid, List, FileText, Trash2, Eye, ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFormsListCollapsed, setIsFormsListCollapsed] = useState(false);

  // Fetch forms on component mount
  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await fetch("/api/v1/organization/forms");
      if (!response.ok) {
        throw new Error("Failed to fetch forms");
      }
      const data = await response.json();
      setForms(data);
      if(selectedForm){
        setSelectedForm(data.find((form: Form) => form.id === selectedForm.id) || null);
      }
    } catch (error) {
      console.error("Error fetching forms:", error);
      toast.error("Failed to load forms");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveForm = async (form: Form) => {
    try {
      const response = await fetch("/api/v1/organization/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to save form");
      }

      const savedForm = await response.json();
      toast.success("Form saved successfully");
     
      fetchForms();
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error("Failed to save form");
    }
  };

  const handleUpdateForm = async (form: Form) => {
    try {
      const response = await fetch("/api/v1/organization/forms", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({...form}),
      });

      if (!response.ok) {
        throw new Error("Failed to update form");
      }

      const updatedForm = await response.json();
      toast.success("Form updated successfully");
     
      fetchForms();
    } catch (error) {
      console.error("Error updating form:", error);
      toast.error("Failed to update form");
    }
  };

  const handleDeleteForm = async (formId: number) => {
    try {
      const response = await fetch("/api/v1/organization/forms", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete form");
      }

      toast.success("Form deleted successfully");
      setSelectedForm(null);
      fetchForms();
    } catch (error) {
      console.error("Error deleting form:", error);
      toast.error("Failed to delete form");
    }
  };

  const handleNewForm = () => {
    setSelectedForm({
      name: "",
      desc: "",
      sections: [],
    });
    setIsPreviewMode(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Form Builder</h1>
          <p className="text-gray-600 mt-2">Create and manage your forms with ease</p>
        </div>
        <div className="flex items-center space-x-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFormsListCollapsed(!isFormsListCollapsed)}
                  className="hover:bg-gray-100"
                >
                  {isFormsListCollapsed ? (
                    <>
                      <ChevronRight className="w-4 h-4 mr-2" />
                      Show Forms List
                    </>
                  ) : (
                    <>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Hide Forms List
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFormsListCollapsed ? "Show forms list" : "Hide forms list"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleNewForm}
                  className="bg-primary hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
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

      <div className={cn(
        "grid gap-8 transition-all duration-300 ease-in-out",
        isFormsListCollapsed ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-4"
      )}>
        <Card className={cn(
          "p-6 shadow-sm transition-all duration-300 ease-in-out",
          isFormsListCollapsed ? "hidden" : "block"
        )}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold text-gray-900">Forms List</h2>
            </div>
            <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "hover:bg-white transition-colors",
                  viewMode === "grid" ? "bg-white shadow-sm" : ""
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={cn(
                  "hover:bg-white transition-colors",
                  viewMode === "list" ? "bg-white shadow-sm" : ""
                )}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-20rem)]">
            {forms.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <FileText className="w-12 h-12 mb-4 animate-pulse" />
                <p className="text-lg">No forms created yet</p>
                <p className="text-sm mt-2">Click "New Form" to create your first form</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1  gap-4">
                {forms.map((form) => (
                  <Card
                    key={form.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-200",
                      "hover:shadow-md hover:border-primary/20",
                      selectedForm?.id === form.id
                        ? "border-primary shadow-md bg-primary/5"
                        : "hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedForm(form)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="font-medium text-gray-900">{form.name}</h3>
                        {form.desc && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {form.desc}
                          </p>
                        )}
                        <div className="flex items-center text-sm text-gray-500">
                          <FileText className="w-4 h-4 mr-1" />
                          {form.sections?.length || 0} sections
                        </div>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedForm(form);
                                  setIsPreviewMode(true);
                                }}
                                className="hover:bg-primary/10"
                              >
                                <Eye className="w-4 h-4" />
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
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteForm(form.id!);
                                }}
                                className="hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete form</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {forms.map((form) => (
                  <div
                    key={form.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-200",
                      "hover:bg-gray-50",
                      selectedForm?.id === form.id
                        ? "bg-primary/5"
                        : ""
                    )}
                    onClick={() => setSelectedForm(form)}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="font-medium text-gray-900">{form.name}</div>
                      {form.desc && (
                        <div className="text-sm text-gray-600 line-clamp-1">
                          {form.desc}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedForm(form);
                                setIsPreviewMode(true);
                              }}
                              className="hover:bg-primary/10"
                            >
                              <Eye className="w-4 h-4" />
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
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteForm(form.id!);
                              }}
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
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

        <Card className={cn(
          "px-6 pt-6 pb-0 shadow-sm transition-all duration-300 ease-in-out" ,
          isFormsListCollapsed ? "lg:col-span-1" : "lg:col-span-3"
        )}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedForm ? "Edit Form" : "Form Preview"}
            </h2>
            {selectedForm && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                      className="hover:bg-primary/5 transition-colors"
                    >
                      {isPreviewMode ? "Edit Mode" : "Preview Mode"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isPreviewMode ? "Switch to edit mode" : "Switch to preview mode"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <ScrollArea className={cn(
            "transition-all duration-300 ease-in-out",
            isFormsListCollapsed 
              ? "h-[calc(100vh-12rem)]" // Taller when forms list is collapsed
              : "h-[calc(100vh-20rem)]" // Original height when forms list is visible
          )}>
            {selectedForm ? (
              isPreviewMode ? (
                <FormPreview form={selectedForm} />
              ) : (
                <FormBuilder
                  form={selectedForm}
                  onSave={handleSaveForm}
                  onUpdate={handleUpdateForm}
                  onDelete={handleDeleteForm}
                  isFormsListCollapsed={isFormsListCollapsed}
                  setSelectedForm={setSelectedForm}
                />
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <FileText className="w-12 h-12 mb-4 animate-pulse" />
                <p className="text-lg">Select a form to edit or create a new one</p>
                <p className="text-sm mt-2">Choose from the list or start fresh</p>
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
} 