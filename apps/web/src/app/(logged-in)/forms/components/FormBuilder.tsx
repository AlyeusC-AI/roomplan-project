"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  GripVertical,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Badge,
} from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  LossType,
  Form,
  FormSection,
  FormField,
  FormFieldType,
  useUpdateForm,
  useCreateFormSection,
  CreateFormSectionDto,
  useCreateFormField,
  useUpdateFormSection,
  useUpdateFormField,
  UpdateFormSectionDto,
  useDeleteFormSection,
  useDeleteFormField,
} from "@service-geek/api-client";
import debounce from "lodash/debounce";

export const getLossTypeLabel = (type: LossType) => {
  switch (type) {
    case LossType.FIRE:
      return "Fire Damage";
    case LossType.WATER:
      return "Water Damage";
    case LossType.MOLD:
      return "Mold Damage";
    case LossType.HAIL:
      return "Hail Damage";
    case LossType.WIND:
      return "Wind Damage";
    case LossType.OTHER:
      return "Other";

    default:
      return type;
  }
};

interface FormBuilderProps {
  form: Form | null;
  onSave: (form: Form) => void;
  onUpdate: (form: Form) => void;
  onDelete: (formId: string) => void;
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
        "cursor-grab rounded-md p-2 transition-all duration-200 hover:bg-gray-100 active:cursor-grabbing dark:hover:bg-gray-800",
        "focus:outline-none focus:ring-2 focus:ring-primary/20",
        className
      )}
      aria-label='Drag to reorder'
    >
      <GripVertical className='h-4 w-4 text-gray-400 dark:text-gray-500' />
    </button>
  );
}

function SortableSection({
  section,
  onUpdate,
  onDelete,
  children,
}: {
  section: FormSection;
  onUpdate: (field: keyof UpdateFormSectionDto, value: any) => void;
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
        "border-2 p-4 transition-all duration-200 sm:p-6",
        "dark:border-gray-700 dark:bg-gray-800",
        isDragging
          ? "bg-primary/5 shadow-lg ring-2 ring-primary/20 dark:bg-primary/10"
          : "hover:shadow-md",
        "group"
      )}
    >
      <div className='mb-4 flex items-center justify-between sm:mb-6'>
        <div className='flex items-center space-x-2 sm:space-x-3'>
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
            variant='ghost'
            size='sm'
            onClick={() => setIsCollapsed(!isCollapsed)}
            className='hover:bg-gray-100 dark:hover:bg-gray-700'
          >
            {isCollapsed ? (
              <ChevronRight className='h-4 w-4' />
            ) : (
              <ChevronDown className='h-4 w-4' />
            )}
          </Button>
          <Input
            defaultValue={section.name}
            onChange={(e) =>
              debounce(() => onUpdate("name", e.target.value), 1000)()
            }
            placeholder='Section name'
            className='h-10 border-none bg-transparent p-0 text-base font-medium focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-gray-100 sm:h-12 sm:text-lg'
          />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={onDelete}
                className='opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 dark:hover:bg-destructive/20'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete section</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          isCollapsed ? "h-0 overflow-hidden" : "h-auto"
        )}
      >
        {children}
      </div>
    </Card>
  );
}

function SortableField({
  field,
  sectionId,
  onUpdate,
  onDelete,
  children,
}: {
  field: FormField;
  sectionId: string;
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
        "flex items-start space-x-2 rounded-lg p-4 transition-all duration-200 sm:space-x-4 sm:p-6",
        "border bg-white dark:border-gray-700 dark:bg-gray-800",
        isDragging
          ? "bg-primary/5 shadow-md dark:bg-primary/10"
          : "hover:bg-gray-50 dark:hover:bg-gray-700/50",
        "group"
      )}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div {...attributes} {...listeners}>
              <DragHandle className='mt-2' />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Drag to reorder field</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className='flex-1'>{children}</div>
    </div>
  );
}

function DragOverlayContent({
  id,
  type,
}: {
  id: number;
  type: "section" | "field";
}) {
  return (
    <div className='flex items-center space-x-3 rounded-lg border-2 border-primary/20 bg-white p-4 shadow-lg dark:border-primary/30 dark:bg-gray-800'>
      <ArrowUpDown className='h-4 w-4 animate-pulse text-primary' />
      <span className='text-sm font-medium dark:text-gray-100'>
        {type === "section" ? "Section" : "Field"} {id}
      </span>
    </div>
  );
}

export function FormBuilder({
  form: currentForm,
  onSave,
  onUpdate,
  onDelete,
  setSelectedForm: setCurrentForm,
  isFormsListCollapsed,
  isSaving,
  isUpdating,
  isDeleting,
}: FormBuilderProps) {
  //   const [currentForm, setCurrentForm] = useState<Form | null>(form);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [activeType, setActiveType] = useState<"section" | "field" | null>(
    null
  );
  const { mutate: updateForm } = useUpdateForm();
  const { mutate: createFormSection } = useCreateFormSection(currentForm?.id!);
  const { mutate: createFormField } = useCreateFormField(currentForm?.id!);
  const { mutate: updateFormSection } = useUpdateFormSection(currentForm?.id!);
  const { mutate: updateFormField } = useUpdateFormField(currentForm?.id!);
  const { mutate: deleteFormSection } = useDeleteFormSection(currentForm?.id!);
  const { mutate: deleteFormField } = useDeleteFormField(currentForm?.id!);
  const isEditing = !!currentForm?.id;

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
    if (currentForm?.sections?.find((s: FormSection) => s.id === active.id)) {
      setActiveType("section");
    } else {
      setActiveType("field");
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const isSection = currentForm?.sections?.find(
      (s) => s.id === event.active.id
    );
    console.log("🚀 ~ handleDragEnd ~ isSection:", isSection);
    if (!currentForm) return;

    const { active, over } = event;
    console.log("🚀 ~ handleDragEnd ~ active:", active, over);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Handle section reordering
    if (
      typeof activeId === "string" &&
      currentForm.sections?.find((s) => s.id === activeId)
    ) {
      const oldIndex = currentForm.sections?.findIndex(
        (s) => s.id === activeId
      );
      const newIndex = currentForm.sections?.findIndex((s) => s.id === overId);
      // Update orders for all sections
      const updatedSections = arrayMove(
        currentForm.sections,
        oldIndex,
        newIndex
      ).map((section, index) => ({
        ...section,
        order: index + 1,
      }));

      for (const section of updatedSections) {
        updateFormSection({
          sectionId: section.id!,
          data: {
            order: section.order,
          },
        });
      }

      setCurrentForm({
        ...currentForm,
        sections: updatedSections,
      });
      return;
    }

    // Handle field reordering within a section
    currentForm.sections?.forEach((section) => {
      const activeField = section.fields.find((f) => f.id === activeId);
      const overField = section.fields.find((f) => f.id === overId);

      if (activeField && overField) {
        const oldIndex = section.fields.findIndex((f) => f.id === activeId);
        const newIndex = section.fields.findIndex((f) => f.id === overId);

        // Update orders for all fields in the section
        const updatedFields = arrayMove(section.fields, oldIndex, newIndex).map(
          (field, index) => ({
            ...field,
            order: index + 1,
          })
        );

        for (const field of updatedFields) {
          updateFormField({
            fieldId: field.id!,
            data: {
              order: field.order,
            },
          });
        }

        setCurrentForm({
          ...currentForm,
          sections: currentForm.sections?.map((s) =>
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
    const newSection: CreateFormSectionDto = {
      name: `Section ${(currentForm.sections?.length || 0) + 1}`,
      order: (currentForm.sections?.length || 0) + 1,
    };

    createFormSection(newSection);
    // Auto-save after adding section
    // if (typeof currentForm.id === "string") {
    //   onUpdate(updatedForm as Form);
    // } else {
    //   onSave(updatedForm as Form);
    // }
  };

  const handleUpdateSection = (
    sectionId: string,
    field: keyof UpdateFormSectionDto,
    value: any
  ) => {
    if (!currentForm) return;
    updateFormSection({
      sectionId,
      data: {
        [field]: value,
      },
    });
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!currentForm) return;
    deleteFormSection(sectionId);
  };

  const handleAddField = (sectionId: string) => {
    if (!currentForm) return;
    const section = currentForm.sections?.find((s) => s.id === sectionId);
    if (!section) return;

    // const newField: Partial<FormField> = {
    //   name: "New Field" + ((section.fields?.length || 0) + 1),
    //   type: "TEXT" as FormFieldType,
    //   isRequired: false,
    //   // sectionId: sectionId,
    //   formSectionId: sectionId,
    //   order: (section.fields?.length || 0) + 1,
    // };

    createFormField({
      name: "New Field" + ((section.fields?.length || 0) + 1),
      type: "TEXT" as FormFieldType,
      isRequired: false,
      // sectionId: sectionId,
      formSectionId: sectionId,
      order: (section.fields?.length || 0) + 1,
    });
    // const updatedForm: Partial<Form> = {
    //   ...currentForm,
    //   sections: currentForm.sections?.map((section) =>
    //     section.id === sectionId
    //       ? {
    //           ...section,
    //           fields: [...(section.fields || []), newField as FormField],
    //         }
    //       : section
    //   ),
    // };
    // setCurrentForm(updatedForm as Form);

    // Auto-save after adding field
    // if (typeof currentForm.id === "string") {
    //   onUpdate(updatedForm as Form);
    // } else {
    //   onSave(updatedForm as Form);
    // }
  };

  const handleUpdateField = async (
    sectionId: string,
    fieldIndex: number | null,
    updatedField: FormField
  ) => {
    console.log("🚀 ~ fieldIndex:", fieldIndex);
    if (!currentForm) return;

    await updateFormField({
      fieldId: updatedField.id!,
      data: {
        name: updatedField.name,
        type: updatedField.type,
        isRequired: updatedField.isRequired,
        formSectionId: sectionId,
        order: fieldIndex || 0,
      },
    });
    // setCurrentForm({
    //   ...currentForm,
    //   sections: currentForm.sections?.map((section) => {
    //     if (section.id === sectionId) {
    //       return {
    //         ...section,
    //         fields: section.fields.map((field, index) => {
    //           // If fieldIndex is provided, update by index
    //           if (fieldIndex !== null && index === fieldIndex) {
    //             return {
    //               ...field,
    //               ...updatedField,
    //               // sectionId: sectionId,
    //               formSectionId: sectionId,
    //               order: field.order || index + 1,
    //             };
    //           }
    //           // For existing fields, update by ID
    //           if (field.id && field.id === updatedField.id) {
    //             return {
    //               ...field,
    //               ...updatedField,
    //               sectionId: sectionId,
    //             };
    //           }
    //           return field;
    //         }),
    //       };
    //     }
    //     return section;
    //   }),
    // });
  };

  const handleDeleteField = (
    sectionId: string,
    fieldId: string | null,
    fieldIndex: number | null
  ) => {
    if (!currentForm) return;
    deleteFormField(fieldId!);
    // setCurrentForm({
    //   ...currentForm,
    //   sections: currentForm.sections?.map((section) =>
    //     section.id === sectionId
    //       ? {
    //           ...section,
    //           fields: section.fields.filter((field, index) => {
    //             // If we have a fieldId, filter by ID
    //             if (fieldId !== null) {
    //               return field.id !== fieldId;
    //             }
    //             // Otherwise, filter by index
    //             return index !== fieldIndex;
    //           }),
    //         }
    //       : section
    //   ),
    // });
  };

  const handleSave = () => {
    if (!currentForm) return;
    if (currentForm.id) {
      onUpdate(currentForm);
    } else {
      onSave(currentForm);
    }
  };

  const handleDamageTypeToggle = (type: LossType) => {
    if (!currentForm) return;
    const currentTypes = currentForm.lossTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];

    setCurrentForm({
      ...currentForm,
      lossTypes: newTypes,
    });
  };

  if (!currentForm) {
    return (
      <div className='py-8 text-center text-gray-500'>
        Create a new form or select an existing one to edit
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-5xl space-y-6 sm:space-y-8'>
      <div className='space-y-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 sm:space-y-6 sm:p-6'>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label
              htmlFor='formName'
              className='text-base font-medium dark:text-gray-100'
            >
              Form Name
            </Label>
            <Input
              id='formName'
              value={currentForm.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              placeholder='Enter form name'
              className='h-10 text-base font-medium dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 sm:h-12 sm:text-lg'
              disabled={isSaving || isUpdating}
            />
          </div>

          <div className='space-y-2'>
            <Label
              htmlFor='formDamageTypes'
              className='text-base font-medium dark:text-gray-100'
            >
              Damage Types
            </Label>
            <div className='flex flex-wrap gap-2'>
              {Object.values(LossType).map((type: LossType) => (
                <div
                  key={type}
                  className={cn(
                    "flex cursor-pointer items-center space-x-2 rounded-md border px-3 py-2 transition-colors",
                    "hover:bg-gray-100 dark:hover:bg-gray-700",
                    currentForm.lossTypes?.includes(type)
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-gray-200 dark:border-gray-700"
                  )}
                  onClick={() => handleDamageTypeToggle(type)}
                >
                  <Checkbox
                    id={`damage-type-${type}`}
                    checked={currentForm.lossTypes?.includes(type)}
                    className='data-[state=checked]:border-primary data-[state=checked]:bg-primary'
                  />
                  <Label className='cursor-pointer text-sm font-medium'>
                    {getLossTypeLabel(type)}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className='space-y-2'>
            <Label
              htmlFor='formDescription'
              className='text-base font-medium dark:text-gray-100'
            >
              Description
            </Label>
            <Textarea
              id='formDescription'
              value={currentForm.description || ""}
              onChange={(e) => handleFormChange("description", e.target.value)}
              placeholder='Enter form description'
              className='min-h-[100px] resize-y dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
              disabled={isSaving || isUpdating}
            />
          </div>
        </div>
      </div>

      {isEditing && (
        <div className='space-y-4 sm:space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-semibold dark:text-gray-100 sm:text-xl'>
                Form Sections
              </h3>
              <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                Organize your form into sections
              </p>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={
                currentForm.sections
                  ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((s) => s.id! || "section-" + s.order) || []
              }
              strategy={verticalListSortingStrategy}
            >
              <div className='space-y-6'>
                {currentForm.sections
                  ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((section, i) => (
                    <SortableSection
                      key={`section-${section.id}-${i}`}
                      section={{ ...section, id: section.id }}
                      onUpdate={(field, value) =>
                        handleUpdateSection(section.id!, field, value)
                      }
                      onDelete={() => handleDeleteSection(section.id!)}
                    >
                      <div className='space-y-6'>
                        <div className='flex items-center justify-between'>
                          <h4 className='text-sm font-medium text-gray-500'>
                            Fields in this section
                          </h4>
                        </div>
                        {/* <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                        > */}
                        <SortableContext
                          items={
                            section.fields
                              ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                              .map((f) => f.id! || "field-" + f.order) || []
                          }
                          strategy={verticalListSortingStrategy}
                        >
                          <div className='space-y-4'>
                            {section.fields
                              ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                              .map((field, fieldIndex) => (
                                <SortableField
                                  key={
                                    field.id
                                      ? `field-${field.id}`
                                      : `field-${section.id}-${fieldIndex}`
                                  }
                                  field={{ ...field, id: field.id || "" }}
                                  sectionId={section.id!}
                                  onUpdate={async (
                                    fieldIndex,
                                    updatedField
                                  ) => {
                                    console.log("🚀 ~ fieldIndex:", fieldIndex);
                                    await handleUpdateField(
                                      section.id!,
                                      fieldIndex,
                                      updatedField
                                    );
                                  }}
                                  onDelete={() =>
                                    handleDeleteField(
                                      section.id!,
                                      field.id || null,
                                      fieldIndex
                                    )
                                  }
                                >
                                  <FormFieldEditor
                                    key={
                                      field.id
                                        ? `editor-${field.id}`
                                        : `editor-${section.id}-${fieldIndex}`
                                    }
                                    field={field}
                                    onUpdate={(updatedField: FormField) =>
                                      handleUpdateField(
                                        section.id!,
                                        fieldIndex,
                                        updatedField
                                      )
                                    }
                                    onDelete={() =>
                                      handleDeleteField(
                                        section.id!,
                                        field.id || null,
                                        fieldIndex
                                      )
                                    }
                                  />
                                </SortableField>
                              ))}
                            <div className='relative'>
                              <div
                                className='absolute inset-0 flex items-center'
                                aria-hidden='true'
                              >
                                <div className='w-full border-t border-gray-200'></div>
                              </div>
                              <div className='relative flex justify-center'>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() =>
                                          handleAddField(section.id!)
                                        }
                                        className='bg-white transition-colors hover:bg-primary/5'
                                      >
                                        <Plus className='mr-2 h-4 w-4' />
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
                        {/* </DndContext> */}
                      </div>
                    </SortableSection>
                  ))}
                <div className='relative'>
                  <div
                    className='absolute inset-0 flex items-center'
                    aria-hidden='true'
                  >
                    <div className='w-full border-t border-gray-200'></div>
                  </div>
                  <div className='relative flex justify-center'>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='outline'
                            size='lg'
                            onClick={handleAddSection}
                            className='bg-white transition-colors hover:bg-primary/5'
                          >
                            <Plus className='mr-2 h-5 w-5' />
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
                <DragOverlayContent
                  key={`overlay-${activeId}`}
                  id={activeId}
                  type={activeType}
                />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      )}
      <div
        className={cn(
          "sticky mt-8 border-t bg-white pt-4 dark:border-gray-700 dark:bg-gray-800",
          isFormsListCollapsed ? "bottom-0 py-4" : "bottom-0"
        )}
      >
        <div className='mx-auto flex max-w-5xl flex-col justify-end space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0'>
          {currentForm.id && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='destructive'
                    onClick={() => currentForm.id && onDelete(currentForm.id)}
                    className='w-full hover:bg-destructive/90 sm:w-auto'
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
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
                  className='w-full bg-primary hover:bg-primary/90 sm:w-auto'
                  disabled={isSaving || isUpdating}
                >
                  {isSaving || isUpdating ? (
                    <>
                      <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                      {isUpdating ? "Updating..." : "Saving..."}
                    </>
                  ) : currentForm.id ? (
                    "Update Form"
                  ) : (
                    "Save Form"
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {currentForm.id ? "Update the form" : "Save the new form"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
