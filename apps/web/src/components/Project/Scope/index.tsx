"use client";

import { useState } from "react";
import EmptyState from "@components/DesignSystem/EmptyState";
import { useParams } from "next/navigation";
import { Checkbox } from "@components/ui/checkbox";
import { Input } from "@components/ui/input";
import { Separator } from "@components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Delete } from "lucide-react";

import Dimensions from "./Dimensions";
import {
  AreaAffected as AreaAffectedInterface,
  Room,
  useGetAreaAffected,
  useGetRoom,
  useGetRooms,
  useUpdateAreaAffected,
  useUpdateRoom,
} from "@service-geek/api-client";
// import FloorMaterial from "./FloorMaterial";
// import WallMaterial from "./WallMaterial";

type AreaAffectedType = "walls" | "floor" | "ceiling";
const areaAffectedTitle: Record<AreaAffectedType, string> = {
  walls: "Walls",
  floor: "Floor",
  ceiling: "Ceiling",
};

const areaAffectedOrder = ["walls", "floor", "ceiling"] as const;

// Update the type definitions
type ExtraField = {
  label: string;
  unit: string;
  value: string;
};

type ExtraFields = {
  [key: string]: ExtraField;
};

function AreasAffectedSide({ room }: { room: Room }) {
  const { data: areaAffected } = useGetAreaAffected(room.id);
  const { mutate: updateAreaAffected } = useUpdateAreaAffected();

  return (
    <fieldset className='sticky top-2 col-span-1 h-fit rounded-lg border border-border/10 bg-gradient-to-b from-background/95 to-background p-4 shadow-sm ring-1 ring-background/5 backdrop-blur-xl'>
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <div className='h-6 w-1 rounded-full bg-gradient-to-b from-primary/80 to-primary/40' />
          <h2 className='bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-lg font-semibold text-transparent'>
            Areas Affected
          </h2>
        </div>

        <div className='space-y-2'>
          {[
            {
              id: "walls",
              type: "walls",
              label: "Walls",
              areaAffected: areaAffected?.wallsAffected,
              isChecked: areaAffected?.wallsAffected?.isVisible,
            },
            {
              id: "ceilings",
              type: "ceiling",
              label: "Ceilings",
              areaAffected: areaAffected?.ceilingAffected,
              isChecked: areaAffected?.ceilingAffected?.isVisible,
            },
            {
              id: "floors",
              type: "floor",
              label: "Floors",
              areaAffected: areaAffected?.floorAffected,
              isChecked: areaAffected?.floorAffected?.isVisible,
            },
          ].map(({ id, type, label, areaAffected, isChecked }) => (
            <div
              key={id}
              className='group relative flex items-center gap-2 rounded-md border border-border/5 bg-background/30 p-2 transition-all duration-200 hover:border-border/20 hover:bg-background/50'
            >
              <div className='flex h-5 items-center'>
                <Checkbox
                  id={id}
                  aria-describedby={`${id}-description`}
                  name={id}
                  checked={isChecked}
                  onCheckedChange={(e) =>
                    updateAreaAffected({
                      data: {
                        isVisible: !!e,
                      },
                      roomId: room.id,
                      type: type as AreaAffectedType,
                    })
                  }
                  className='h-5 w-5 rounded-md border-primary/20 transition-all duration-200 data-[state=checked]:scale-100 data-[state=checked]:animate-in data-[state=checked]:fade-in-0'
                />
              </div>
              <div className='flex-1'>
                <label
                  htmlFor={id}
                  className='font-medium text-foreground/80 transition-colors duration-200 group-hover:text-foreground'
                >
                  {label}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </fieldset>
  );
}

function AreaAffected({ room }: { room: Room }) {
  const { data: areaAffected } = useGetAreaAffected(room.id);
  const { mutate: updateRoom, isPending: isUpdatingRoom } = useUpdateRoom();
  const { mutate: updateAreaAffected, isPending: isUpdatingAreaAffected } =
    useUpdateAreaAffected();

  const [hasChanges, setHasChanges] = useState(false);
  const [showExtraFieldModal, setShowExtraFieldModal] = useState(false);
  const [editingExtraField, setEditingExtraField] = useState<{
    id: string;
    label: string;
    unit: string;
  } | null>(null);
  const [newExtraField, setNewExtraField] = useState({ label: "", unit: "" });
  const [currentArea, setCurrentArea] = useState<{
    type: AreaAffectedType;
    id: string;
    areaAffected?: AreaAffectedInterface;
  } | null>(null);
  const [extraFieldValues, setExtraFieldValues] = useState<
    Record<string, string>
  >({});
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    fieldId: string;
    areaType: AreaAffectedType;
    areaId: string;
  } | null>(null);

  const isSaving = isUpdatingRoom || isUpdatingAreaAffected;
  const areaAffectedByType = {
    walls: areaAffected?.wallsAffected,
    floor: areaAffected?.floorAffected,
    ceiling: areaAffected?.ceilingAffected,
  };

  // Update handleAddExtraField
  const handleAddExtraField = async (areaType: AreaAffectedType) => {
    if (!newExtraField.label) return;

    const area = areaAffectedByType[areaType];
    if (!area) return;

    const fieldId = `extra_${Date.now()}`;
    const updatedArea = {
      ...area,
      extraFields: {
        ...(area.extraFields || {}),
        [fieldId]: {
          label: newExtraField.label,
          unit: newExtraField.unit,
          value: "",
        },
      },
    };

    // Update local state
    setExtraFieldValues((prev) => ({
      ...prev,
      [fieldId]: "",
    }));

    // Save to backend
    await updateAreaAffected({
      data: updatedArea,
      roomId: room.id,
      type: areaType as AreaAffectedType,
    });

    // Reset form
    setNewExtraField({ label: "", unit: "" });
    setShowExtraFieldModal(false);
  };

  // Update handleUpdateExtraField
  const handleUpdateExtraField = async (
    areaType: AreaAffectedType,
    fieldId: string
  ) => {
    if (!editingExtraField) return;

    const area = areaAffectedByType[areaType];
    if (!area) return;

    const updatedArea = {
      ...area,
      extraFields: {
        ...(area.extraFields || {}),
        [fieldId]: {
          ...(area.extraFields?.[fieldId] || {}),
          label: editingExtraField.label,
          unit: editingExtraField.unit,
        },
      },
    };

    await updateAreaAffected({
      data: updatedArea,
      roomId: room.id,
      type: areaType as AreaAffectedType,
    });
    setEditingExtraField(null);
  };

  // Update handleRemoveExtraField
  const handleRemoveExtraField = async (
    areaType: AreaAffectedType,
    fieldId: string
  ) => {
    setDeleteConfirmation({
      isOpen: true,
      fieldId,
      areaType,
      areaId: areaAffectedByType[areaType]?.id || "",
    });
  };

  // Add confirmDelete function
  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    const { fieldId, areaType } = deleteConfirmation;
    const area = areaAffectedByType[areaType];
    if (!area) return;

    const updatedArea = {
      ...area,
      extraFields: {
        ...(area.extraFields || {}),
      },
    };

    // Remove the field from extraFields
    delete updatedArea.extraFields[fieldId];

    // Remove from local state
    setExtraFieldValues((prev) => {
      const newValues = { ...prev };
      delete newValues[fieldId];
      return newValues;
    });

    await updateAreaAffected({
      data: updatedArea,
      roomId: room.id,
      type: areaType as AreaAffectedType,
    });
    setDeleteConfirmation(null);
  };
  return (
    <>
      <div
        key={room.id}
        className='relative overflow-hidden rounded-xl border border-border/10 bg-gradient-to-b from-background/95 to-background shadow-lg'
      >
        <div className='border-b border-border/10 bg-muted/20 px-6 py-4'>
          <h1 className='text-xl font-semibold text-foreground'>{room.name}</h1>
        </div>

        <div className='p-4'>
          <div className='mb-6'>
            <h2 className='mb-4 text-base font-medium text-foreground/90'>
              Room Dimensions
            </h2>
            <Dimensions room={room} />
          </div>

          <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
            <AreasAffectedSide room={room} />

            <div className='lg:col-span-2'>
              <Tabs defaultValue={"walls"} className='w-full'>
                <TabsList className='mb-4 grid w-full grid-cols-3'>
                  {[
                    {
                      id: "walls",
                      type: "walls",
                      areaAffected: areaAffected?.wallsAffected,
                    },
                    {
                      id: "floor",
                      type: "floor",
                      areaAffected: areaAffected?.floorAffected,
                    },
                    {
                      id: "ceiling",
                      type: "ceiling",
                      areaAffected: areaAffected?.ceilingAffected,
                    },
                  ]
                    .filter((area) => area.areaAffected?.isVisible)
                    .map((area) => {
                      return (
                        <TabsTrigger key={area.id} value={area.type}>
                          <span className='text-sm'>
                            {areaAffectedTitle[area.type as AreaAffectedType]}
                          </span>
                        </TabsTrigger>
                      );
                    })}
                </TabsList>
                {[
                  {
                    id: "walls",
                    type: "walls",
                    areaAffected: areaAffected?.wallsAffected,
                  },
                  {
                    id: "floor",
                    type: "floor",
                    areaAffected: areaAffected?.floorAffected,
                  },
                  {
                    id: "ceiling",
                    type: "ceiling",
                    areaAffected: areaAffected?.ceilingAffected,
                  },
                ].map(({ id, type, areaAffected }) => {
                  if (!areaAffected?.isVisible) return null;
                  return (
                    <TabsContent key={id} value={type}>
                      <div className='rounded-lg border border-border/10 bg-gradient-to-br from-background/80 via-background/50 to-background/80 p-4'>
                        <div className='mb-3 flex items-center gap-2'>
                          <div className='h-4 w-1 rounded-full bg-gradient-to-b from-primary/60 to-primary/30' />
                          <h2 className='text-sm font-medium text-foreground/90'>
                            {areaAffectedTitle[type as AreaAffectedType]}
                          </h2>
                          <div className='flex-1 border-t border-border/20'></div>
                        </div>

                        <div className='grid gap-3'>
                          <div className='rounded-md border border-border/10 bg-muted/5 p-2.5'>
                            <div className='w-full'>
                              <div className='mb-2'>
                                {type === "walls"
                                  ? "Wall Material"
                                  : type === "floor"
                                    ? "Floor Material"
                                    : "Material"}
                              </div>
                              <Input
                                className='w-full pr-12 text-sm'
                                defaultValue={areaAffected?.material || ""}
                                placeholder='Enter value'
                                type='text'
                                onChange={(e) => {
                                  setHasChanges(true);
                                  updateAreaAffected({
                                    data: {
                                      material: e.target.value,
                                    },
                                    roomId: room.id,
                                    type: type as AreaAffectedType,
                                  });
                                }}
                                name='material'
                              />
                              {/* {areaType === "wall" ? (
                          <WallMaterial
                            defaultValue={
                              areaAffected.material || ""
                            }
                            onChange={(material) =>
                              saveAffectedArea(
                                { material, id: areaAffected.id },
                                areaType,
                                room.publicId
                              )
                            }
                          />
                        ) : areaType === "floor" ? (
                          <FloorMaterial
                            defaultValue={
                              areaAffected.material || ""
                            }
                            onChange={(material) =>
                              saveAffectedArea(
                                { material, id: areaAffected.id },
                                areaType,
                                room.publicId
                              )
                            }
                          />
                        ) : null} */}
                            </div>
                          </div>

                          <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                            <div className='rounded-md border border-border/10 bg-muted/5 p-2.5'>
                              <h3 className='mb-1.5 text-xs font-medium text-muted-foreground'>
                                Total Area Removed
                              </h3>
                              <div className='relative flex items-center'>
                                <Input
                                  className='w-full pr-12 text-sm'
                                  defaultValue={
                                    areaAffected?.totalAreaRemoved || ""
                                  }
                                  placeholder='Enter value'
                                  type='number'
                                  onChange={(e) => {
                                    setHasChanges(true);
                                    updateAreaAffected({
                                      data: {
                                        totalAreaRemoved: e.target.value,
                                      },
                                      roomId: room.id,
                                      type: type as AreaAffectedType,
                                    });
                                  }}
                                  name='totalAreaRemoved'
                                />
                                <span className='absolute right-3 text-xs text-muted-foreground'>
                                  sqft
                                </span>
                              </div>
                            </div>

                            <div className='rounded-md border border-border/10 bg-muted/5 p-2.5'>
                              <h3 className='mb-1.5 text-xs font-medium text-muted-foreground'>
                                Total Area Anti-Microbial Applied
                              </h3>
                              <div className='relative flex items-center'>
                                <Input
                                  className='w-full pr-12 text-sm'
                                  defaultValue={
                                    areaAffected?.totalAreaMicrobialApplied ||
                                    ""
                                  }
                                  placeholder='Enter value'
                                  type='number'
                                  onChange={(e) => {
                                    setHasChanges(true);
                                    updateAreaAffected({
                                      data: {
                                        totalAreaMicrobialApplied:
                                          e.target.value,
                                      },
                                      roomId: room.id,
                                      type: type as AreaAffectedType,
                                    });
                                  }}
                                  name='totalAreaApplied'
                                />
                                <span className='absolute right-3 text-xs text-muted-foreground'>
                                  sqft
                                </span>
                              </div>
                            </div>

                            {type === "walls" && (
                              <div className='rounded-md border border-border/10 bg-muted/5 p-2.5'>
                                <h3 className='mb-1.5 text-xs font-medium text-muted-foreground'>
                                  Cabinetry Removed
                                </h3>
                                <div className='relative flex items-center'>
                                  <Input
                                    className='w-full pr-12 text-sm'
                                    defaultValue={
                                      areaAffected?.cabinetryRemoved || ""
                                    }
                                    placeholder='Enter value'
                                    type='number'
                                    onChange={(e) => {
                                      setHasChanges(true);
                                      updateAreaAffected({
                                        data: {
                                          cabinetryRemoved: e.target.value,
                                        },
                                        roomId: room.id,
                                        type: type as AreaAffectedType,
                                      });
                                    }}
                                    name='cabinetryremoved'
                                  />
                                  <span className='absolute right-3 text-xs text-muted-foreground'>
                                    sqft
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Extra Fields Section */}
                          <div className='rounded-lg border border-border/10 bg-gradient-to-br from-background/80 via-background/50 to-background/80 p-4'>
                            <div className='mb-3 flex items-center gap-2'>
                              <div className='h-4 w-1 rounded-full bg-gradient-to-b from-primary/60 to-primary/30' />
                              <h2 className='text-sm font-medium text-foreground/90'>
                                Additional Fields
                              </h2>
                              <div className='flex-1 border-t border-border/20'></div>
                              <button
                                onClick={() => {
                                  setCurrentArea({
                                    type: type as AreaAffectedType,
                                    id: areaAffected?.id || "",
                                    areaAffected: areaAffected,
                                  });
                                  setShowExtraFieldModal(true);
                                }}
                                className='flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20'
                              >
                                <Plus className='h-4 w-4' />
                                Add Field
                              </button>
                            </div>

                            <div className='grid gap-4'>
                              {areaAffected?.extraFields &&
                                Object.entries(
                                  areaAffected.extraFields as ExtraFields
                                ).map(([fieldId, field]) => (
                                  <div
                                    key={fieldId}
                                    className='group relative rounded-md border border-border/10 bg-muted/5 p-3 transition-colors hover:border-border/20'
                                  >
                                    <div className='mb-2 flex items-center justify-between'>
                                      <h3 className='text-sm font-medium text-foreground/90'>
                                        {field.label}
                                      </h3>
                                      <div className='flex items-center gap-2'>
                                        <button
                                          onClick={() => {
                                            setCurrentArea({
                                              type: type as AreaAffectedType,
                                              id: areaAffected?.id || "",
                                            });
                                            setEditingExtraField({
                                              id: fieldId,
                                              label: field.label,
                                              unit: field.unit,
                                            });
                                          }}
                                          className='p-1.5 text-xs text-primary transition-colors hover:text-primary/80'
                                        >
                                          <Pencil className='h-4 w-4' />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleRemoveExtraField(
                                              type as AreaAffectedType,
                                              fieldId
                                            )
                                          }
                                          className='p-1.5 text-xs text-red-500 transition-colors hover:text-red-600'
                                        >
                                          <Trash2 className='h-4 w-4' />
                                        </button>
                                      </div>
                                    </div>
                                    <div className='relative flex items-center'>
                                      <Input
                                        className='w-full pr-12 text-sm'
                                        value={
                                          extraFieldValues[fieldId] ??
                                          field.value
                                        }
                                        placeholder='Enter value'
                                        type='number'
                                        onChange={(e) => {
                                          setExtraFieldValues((prev) => ({
                                            ...prev,
                                            [fieldId]: e.target.value,
                                          }));
                                          const updatedArea = {
                                            ...areaAffected,
                                            extraFields: {
                                              ...((areaAffected.extraFields as ExtraFields) ||
                                                {}),
                                              [fieldId]: {
                                                ...field,
                                                value: e.target.value,
                                              },
                                            },
                                          };
                                          updateAreaAffected({
                                            data: updatedArea,
                                            roomId: room.id,
                                            type: type as AreaAffectedType,
                                          });
                                        }}
                                      />
                                      <span className='absolute right-3 text-xs text-muted-foreground'>
                                        {field.unit}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      {/* Sticky Save Bar */}
      {hasChanges && (
        <div className='fixed bottom-0 left-0 right-0 border-t border-border/10 bg-background/95 p-4 shadow-lg backdrop-blur-xl transition-all duration-300'>
          <div className='container mx-auto flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>
              {isSaving ? "Saving changes..." : "You have unsaved changes"}
            </p>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => window.location.reload()}
                className='rounded-lg px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-muted/50 hover:text-foreground'
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={() => setHasChanges(false)}
                className='rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90'
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extra Field Modal */}
      {showExtraFieldModal || editingExtraField ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='w-full max-w-md rounded-xl bg-background shadow-xl'>
            <div className='border-b border-border/10 p-4'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-semibold text-foreground'>
                  {editingExtraField ? "Edit Field" : "Add New Field"}
                </h2>
                <button
                  onClick={() => {
                    setShowExtraFieldModal(false);
                    setEditingExtraField(null);
                    setCurrentArea(null);
                  }}
                  className='text-primary transition-colors hover:text-primary/80'
                >
                  <X className='h-5 w-5' />
                </button>
              </div>
            </div>

            <div className='space-y-4 p-6'>
              <div>
                <label className='mb-2 block text-sm font-medium text-muted-foreground'>
                  Field Label
                </label>
                <Input
                  placeholder='Enter field label'
                  value={
                    editingExtraField
                      ? editingExtraField.label
                      : newExtraField.label
                  }
                  onChange={(e) => {
                    if (editingExtraField) {
                      setEditingExtraField({
                        ...editingExtraField,
                        label: e.target.value,
                      });
                    } else {
                      setNewExtraField({
                        ...newExtraField,
                        label: e.target.value,
                      });
                    }
                  }}
                />
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium text-muted-foreground'>
                  Unit
                </label>
                <Input
                  placeholder='Enter unit (e.g., sqft, ft, etc.)'
                  value={
                    editingExtraField
                      ? editingExtraField.unit
                      : newExtraField.unit
                  }
                  onChange={(e) => {
                    if (editingExtraField) {
                      setEditingExtraField({
                        ...editingExtraField,
                        unit: e.target.value,
                      });
                    } else {
                      setNewExtraField({
                        ...newExtraField,
                        unit: e.target.value,
                      });
                    }
                  }}
                />
              </div>

              <div className='flex gap-3 pt-4'>
                <button
                  onClick={() => {
                    setShowExtraFieldModal(false);
                    setEditingExtraField(null);
                    setCurrentArea(null);
                    setNewExtraField({ label: "", unit: "" });
                  }}
                  className='flex-1 rounded-md border border-border/20 px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-muted/50'
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (editingExtraField && currentArea) {
                      handleUpdateExtraField(
                        currentArea.type,
                        editingExtraField.id
                      );
                    } else if (currentArea) {
                      handleAddExtraField(currentArea.type);
                    }
                    setShowExtraFieldModal(false);
                    setEditingExtraField(null);
                    setCurrentArea(null);
                    setNewExtraField({ label: "", unit: "" });
                  }}
                  className='flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90'
                  disabled={
                    editingExtraField
                      ? !editingExtraField.label
                      : !newExtraField.label
                  }
                >
                  {editingExtraField ? "Update Field" : "Add Field"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='w-full max-w-md rounded-xl bg-background shadow-xl'>
            <div className='border-b border-border/10 p-4'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-semibold text-foreground'>
                  Delete Field
                </h2>
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className='text-primary transition-colors hover:text-primary/80'
                >
                  <X className='h-5 w-5' />
                </button>
              </div>
            </div>

            <div className='space-y-4 p-6'>
              <p className='text-foreground/80'>
                Are you sure you want to delete this field? This action cannot
                be undone.
              </p>

              <div className='flex gap-3 pt-4'>
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className='flex-1 rounded-md border border-border/20 px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-muted/50'
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className='flex-1 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600'
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Scope() {
  const { id } = useParams<{ id: string }>();
  const { data: rooms } = useGetRooms(id);

  return (
    <div className='relative min-h-screen pb-20'>
      <div className='mb-8 space-y-6 bg-background/50 p-6 backdrop-blur-sm'>
        <div>
          <h1 className='text-3xl font-semibold text-foreground'>
            Scope Details
          </h1>
          <p className='mt-2 text-base text-muted-foreground'>
            Enter room dimensions, number of windows and doors, as well as
            document affected areas.
          </p>
        </div>
        <Separator className='bg-border/40' />
      </div>

      {rooms?.length === 0 ? (
        <EmptyState
          imagePath={"/images/empty.svg"}
          title={"No Rooms Added"}
          description={
            "Get started by adding rooms. Scope details can be added for each room"
          }
        />
      ) : (
        <div className='container mx-auto space-y-16 px-4'>
          {rooms?.map((room) => <AreaAffected key={room.id} room={room} />)}
        </div>
      )}
    </div>
  );
}
