"use client";

import { useState, useEffect } from "react";
import { Form, FormField, FormSection } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, ArrowUpDown, ChevronDown, ChevronRight, Badge } from "lucide-react";
import { FormFieldEditor } from "./FormFieldEditor";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DamageType, DAMAGE_TYPES } from "@/types/damage";

interface FormBuilderProps {
  form: Form | null;
  onSave: (form: Form) => void;
  onUpdate: (form: Form) => void;
  onDelete: (formId: number) => void;
  setSelectedForm: (form: Form | null) => void;
  isFormsListCollapsed: boolean;
  isSaving: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

function DragHandle({ className }: { className?: string }) {
  return (
    <button
      className={cn(
        "cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary/20",
        className
      )}
      aria-label="Drag to reorder"
    >
      <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
    </button>
  );
}

function SortableSection({ section, onUpdate, onDelete, children }: {
  section: FormSection;
  onUpdate: (field: keyof FormSection, value: any) => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "p-4 sm:p-6 transition-all duration-200 border-2",
        "dark:bg-gray-800 dark:border-gray-700",
        isDragging ? "shadow-lg ring-2 ring-primary/20 bg-primary/5 dark:bg-primary/10" : "hover:shadow-md",
        "group"
      )}
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div {...attributes} {...listeners}>
                  <DragHandle />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Drag to reorder section</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
          <Input
            value={section.name}
            onChange={(e) => onUpdate("name", e.target.value)}
            placeholder="Section name"
            className="font-medium text-base sm:text-lg border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent p-0 h-10 sm:h-12 dark:text-gray-100"
          />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete section</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "h-0 overflow-hidden" : "h-auto"
      )}>
        {children}
      </div>
    </Card>
  );
}

function SortableField({ field, sectionId, onUpdate, onDelete, children }: {
  field: FormField;
  sectionId: number;
  onUpdate: (fieldIndex: number | null, updatedField: FormField) => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "flex items-start space-x-2 sm:space-x-4 p-4 sm:p-6 rounded-lg transition-all duration-200",
        "bg-white dark:bg-gray-800 border dark:border-gray-700",
        isDragging ? "bg-primary/5 dark:bg-primary/10 shadow-md" : "hover:bg-gray-50 dark:hover:bg-gray-700/50",
        "group"
      )}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div {...attributes} {...listeners}>
              <DragHandle className="mt-2" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Drag to reorder field</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

function DragOverlayContent({ id, type }: { id: number; type: 'section' | 'field' }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center space-x-3 border-2 border-primary/20 dark:border-primary/30">
      <ArrowUpDown className="w-4 h-4 text-primary animate-pulse" />
      <span className="text-sm font-medium dark:text-gray-100">
        {type === 'section' ? 'Section' : 'Field'} {id}
      </span>
    </div>
  );
}

export function FormBuilder({ 
  form:currentForm, 
  onSave, 
  onUpdate, 
  onDelete,
  setSelectedForm: setCurrentForm,
  isFormsListCollapsed,
  isSaving,
  isUpdating,
  isDeleting
}: FormBuilderProps) {
  console.log("🚀 ~ currentForm:", currentForm)
//   const [currentForm, setCurrentForm] = useState<Form | null>(form);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [activeType, setActiveType] = useState<'section' | 'field' | null>(null);

  // Update currentForm when form prop changes
//   useEffect(() => {
//     setCurrentForm(form);
//   }, [form]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as number);
    
    // Determine if we're dragging a section or field
    if (currentForm?.sections?.find(s => s.id === active.id)) {
      setActiveType('section');
    } else {
      setActiveType('field');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!currentForm) return;

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Handle section reordering
    if (typeof activeId === 'number' && currentForm.sections?.find(s => s.id === activeId)) {
      const oldIndex = currentForm.sections?.findIndex(s => s.id === activeId);
      const newIndex = currentForm.sections?.findIndex(s => s.id === overId);
      
      // Update orders for all sections
      const updatedSections = arrayMove(currentForm.sections, oldIndex, newIndex).map((section, index) => ({
        ...section,
        order: index + 1
      }));
      
      setCurrentForm({
        ...currentForm,
        sections: updatedSections,
      });
      return;
    }

    // Handle field reordering within a section
    currentForm.sections?.forEach(section => {
      const activeField = section.fields.find(f => f.id === activeId);
      const overField = section.fields.find(f => f.id === overId);
      
      if (activeField && overField) {
        const oldIndex = section.fields.findIndex(f => f.id === activeId);
        const newIndex = section.fields.findIndex(f => f.id === overId);
        
        // Update orders for all fields in the section
        const updatedFields = arrayMove(section.fields, oldIndex, newIndex).map((field, index) => ({
          ...field,
          order: index + 1
        }));
        
        setCurrentForm({
          ...currentForm,
          sections: currentForm.sections?.map(s => 
            s.id === section.id
              ? {
                  ...s,
                  fields: updatedFields,
                }
              : s
          ),
        });
      }
    });

    setActiveId(null);
    setActiveType(null);
  };

  const handleFormChange = (field: keyof Form, value: any) => {
    if (!currentForm) return;
    setCurrentForm({ ...currentForm, [field]: value });
  };

  const handleAddSection = () => {
    if (!currentForm) return;
    const newSection: FormSection = {
      name: `Section ${(currentForm.sections?.length || 0) + 1}`,
      fields: [],
      order: (currentForm.sections?.length || 0) + 1,
    };
    const updatedForm: Form = {
      ...currentForm,
      sections: [...(currentForm.sections || []), newSection],
    };
    setCurrentForm(updatedForm);
    
    // Auto-save after adding section
    if (typeof currentForm.id === 'number') {
      onUpdate(updatedForm);
    } else {
      onSave(updatedForm);
    }
  };

  const handleUpdateSection = (sectionId: number, field: keyof FormSection, value: any) => {
    if (!currentForm) return;
    setCurrentForm({
      ...currentForm,
      sections: currentForm.sections?.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section
      ),
    });
  };

  const handleDeleteSection = (sectionId: number) => {
    if (!currentForm) return;
    setCurrentForm({
      ...currentForm,
      sections: currentForm.sections?.filter((section) => section.id !== sectionId),
    });
  };

  const handleAddField = (sectionId: number) => {
    if (!currentForm) return;
    const section = currentForm.sections?.find(s => s.id === sectionId);
    if (!section) return;

    const newField: FormField = {
      name: "New Field" +( (section.fields?.length || 0) + 1),
      type: "TEXT",
      isRequired: false,
      sectionId: sectionId,
      order: (section.fields?.length || 0) + 1,
    };

    const updatedForm: Form = {
      ...currentForm,
      sections: currentForm.sections?.map((section) =>
        section.id === sectionId
          ? { ...section, fields: [...(section.fields || []), newField] }
          : section
      ),
    };
    setCurrentForm(updatedForm);
    
    // Auto-save after adding field
    if (typeof currentForm.id === 'number') {
      onUpdate(updatedForm);
    } else {
      onSave(updatedForm);
    }
  };

  const handleUpdateField = (sectionId: number, fieldIndex: number | null, updatedField: FormField) => {
    if (!currentForm) return;
    
    setCurrentForm({
      ...currentForm,
      sections: currentForm.sections?.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            fields: section.fields.map((field, index) => {
              // If fieldIndex is provided, update by index
              if (fieldIndex !== null && index === fieldIndex) {
                return {
                  ...field,
                  ...updatedField,
                  sectionId: sectionId,
                  order: field.order || index + 1,
                };
              }
              // For existing fields, update by ID
              if (field.id && field.id === updatedField.id) {
                return {
                  ...field,
                  ...updatedField,
                  sectionId: sectionId,
                };
              }
              return field;
            }),
          };
        }
        return section;
      }),
    });
  };

  const handleDeleteField = (sectionId: number, fieldId: number | null, fieldIndex: number | null) => {
    if (!currentForm) return;
    setCurrentForm({
      ...currentForm,
      sections: currentForm.sections?.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.filter((field, index) => {
                // If we have a fieldId, filter by ID
                if (fieldId !== null) {
                  return field.id !== fieldId;
                }
                // Otherwise, filter by index
                return index !== fieldIndex;
              }),
            }
          : section
      ),
    });
  };

  const handleSave = () => {
    if (!currentForm) return;
    if (currentForm.id) {
      onUpdate(currentForm);
    } else {
      onSave(currentForm);
    }
  };

  const handleDamageTypeToggle = (type: DamageType) => {
    if (!currentForm) return;
    const currentTypes = currentForm.damageTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    setCurrentForm({
      ...currentForm,
      damageTypes: newTypes,
    });
  };

  if (!currentForm) {
    return (
      <div className="text-center text-gray-500 py-8">
        Create a new form or select an existing one to edit
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="formName" className="text-base font-medium dark:text-gray-100">Form Name</Label>
            <Input
              id="formName"
              value={currentForm.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              placeholder="Enter form name"
              className="text-base sm:text-lg font-medium h-10 sm:h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              disabled={isSaving || isUpdating}
            />
          </div>

          <div className="space-y-2"> 
            <Label htmlFor="formDamageTypes" className="text-base font-medium dark:text-gray-100">Damage Types</Label>
            <div className="flex flex-wrap gap-2">
              {DAMAGE_TYPES.map((type) => (
                <div
                  key={type.value}
                  className={cn(
                    "flex items-center space-x-2 rounded-md border px-3 py-2 cursor-pointer transition-colors",
                    "hover:bg-gray-100 dark:hover:bg-gray-700",
                    currentForm.damageTypes?.includes(type.value as DamageType)
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-gray-200 dark:border-gray-700"
                  )}
                  onClick={() => handleDamageTypeToggle(type.value as DamageType)}
                >
                  <Checkbox
                    id={`damage-type-${type.value}`}
                    checked={currentForm.damageTypes?.includes(type.value as DamageType)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label
                    className="text-sm font-medium cursor-pointer"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="formDescription" className="text-base font-medium dark:text-gray-100">Description</Label>
            <Textarea
              id="formDescription"
              value={currentForm.desc || ""}
              onChange={(e) => handleFormChange("desc", e.target.value)}
              placeholder="Enter form description"
              className="min-h-[100px] resize-y dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              disabled={isSaving || isUpdating}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold dark:text-gray-100">Form Sections</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Organize your form into sections</p>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={currentForm.sections?.sort((a, b) => (a.order || 0) - (b.order || 0)).map(s => s.id! || "section-"+s.order) || []}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {currentForm.sections?.sort((a, b) => (a.order || 0) - (b.order || 0)).map((section, i) => (
                <SortableSection
                  key={`section-${section.id}-${i}`}
                  section={{...section, id: section.id||0}}
                  onUpdate={(field, value) => handleUpdateSection(section.id!, field, value)}
                  onDelete={() => handleDeleteSection(section.id!)}
                >
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-gray-500">Fields in this section</h4>
                    </div>

                    <SortableContext
                      items={section.fields?.sort((a, b) => (a.order || 0) - (b.order || 0)).map(f => f.id! || "field-"+f.order) || []}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {section.fields?.sort((a, b) => (a.order || 0) - (b.order || 0)).map((field, fieldIndex) => (
                          <SortableField
                            key={field.id ? `field-${field.id}` : `field-${section.id}-${fieldIndex}`}
                            field={{...field, id: field.id||0}}
                            sectionId={section.id!}
                            onUpdate={(fieldIndex, updatedField) =>
                              handleUpdateField(section.id!, fieldIndex, updatedField)
                            }
                            onDelete={() => handleDeleteField(section.id!, field.id || null, fieldIndex)}
                          >
                            <FormFieldEditor
                              key={field.id ? `editor-${field.id}` : `editor-${section.id}-${fieldIndex}`}
                              field={field}
                              onUpdate={(updatedField: FormField) =>
                                handleUpdateField(section.id!, fieldIndex, updatedField)
                              }
                              onDelete={() => handleDeleteField(section.id!, field.id || null, fieldIndex)}
                            />
                          </SortableField>
                        ))}
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-200"></div>
                          </div>
                          <div className="relative flex justify-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddField(section.id!)}
                                    className="bg-white hover:bg-primary/5 transition-colors"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Field
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Add a new field to this section</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                    </SortableContext>
                  </div>
                </SortableSection>
              ))}
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="lg" 
                          onClick={handleAddSection}
                          className="bg-white hover:bg-primary/5 transition-colors"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Add Section
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add a new section to your form</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </SortableContext>

          <DragOverlay>
            {activeId && activeType && (
              <DragOverlayContent key={`overlay-${activeId}`} id={activeId} type={activeType} />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      <div className={cn(
        "sticky bg-white dark:bg-gray-800 border-t dark:border-gray-700 pt-4 mt-8",
        isFormsListCollapsed ? "bottom-0 py-4" : "bottom-0"
      )}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          {currentForm.id && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    onClick={() => currentForm.id && onDelete(currentForm.id)}
                    className="w-full sm:w-auto hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Form"
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Permanently delete this form</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleSave}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                  disabled={isSaving || isUpdating}
                >
                  {isSaving || isUpdating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {isUpdating ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    currentForm.id ? "Update Form" : "Save Form"
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{currentForm.id ? "Update the form" : "Save the new form"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
} 