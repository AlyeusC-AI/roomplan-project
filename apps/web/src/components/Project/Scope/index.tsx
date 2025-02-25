"use client";

import EmptyState from "@components/DesignSystem/EmptyState";
import { useParams } from "next/navigation";
import { roomStore } from "@atoms/room";
import { Checkbox } from "@components/ui/checkbox";
import { Input } from "@components/ui/input";
import { Separator } from "@components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";

import Dimensions from "./Dimensions";
import FloorMaterial from "./FloorMaterial";
import WallMaterial from "./WallMaterial";

const areaAffectedTitle = {
  wall: "Walls",
  floor: "Floor",
  ceiling: "Ceiling",
};

const areaAffectedOrder = ["wall", "floor", "ceiling"] as const;

function AreasAffected({
  affectedAreas,
  setAffectedAreas,
}: {
  affectedAreas: AreaAffected[];
  setAffectedAreas: (s: AreaAffectedType, data: Partial<AreaAffected>) => void;
}) {
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
            { id: "walls", type: "wall", label: "Walls" },
            { id: "ceilings", type: "ceiling", label: "Ceilings" },
            { id: "floors", type: "floor", label: "Floors" },
          ].map(({ id, type, label }) => (
            <div
              key={id}
              className='group relative flex items-center gap-2 rounded-md border border-border/5 bg-background/30 p-2 transition-all duration-200 hover:border-border/20 hover:bg-background/50'
            >
              <div className='flex h-5 items-center'>
                <Checkbox
                  id={id}
                  aria-describedby={`${id}-description`}
                  name={id}
                  checked={
                    !!affectedAreas.find((a) => a.type === type && !a.isDeleted)
                  }
                  onCheckedChange={(e) =>
                    setAffectedAreas(type as AreaAffectedType, {
                      isDeleted: !e,
                      id: affectedAreas.find((a) => a.type === type)?.id,
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

export default function Scope() {
  const rooms = roomStore((state) => state.rooms);
  console.log("🚀 ~ Scope ~ rooms:", rooms);
  const { id } = useParams<{ id: string }>();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const saveAffectedArea = async (
    data: Partial<AreaAffected>,
    type: AreaAffectedType,
    roomId: string
  ) => {
    const oldState = rooms;
    setIsSaving(true);
    setHasChanges(true);

    roomStore.getState().updateAreasAffected(roomId, data, type);
    try {
      const res = await fetch(`/api/v1/projects/${id}/room/affected-area`, {
        method: "POST",
        body: JSON.stringify({
          roomId,
          affectedAreaData: data,
          type,
        }),
      });

      const json = await res.json();
      roomStore.getState().updateAreasAffected(roomId, json.areaAffected, type);

      if (!res.ok) {
        roomStore.getState().updateAllRooms(oldState);
        toast.error("Failed to save changes");
      } else {
        toast.success("Changes saved successfully");
        setHasChanges(false);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

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

      {rooms.length === 0 ? (
        <EmptyState
          imagePath={"/images/empty.svg"}
          title={"No Rooms Added"}
          description={
            "Get started by adding rooms. Scope details can be added for each room"
          }
        />
      ) : (
        <div className='container mx-auto space-y-16 px-4'>
          {rooms.map((room) => (
            <div
              key={room.publicId}
              className='relative overflow-hidden rounded-xl border border-border/10 bg-gradient-to-b from-background/95 to-background shadow-lg'
            >
              <div className='border-b border-border/10 bg-muted/20 px-6 py-4'>
                <h1 className='text-xl font-semibold text-foreground'>
                  {room.name}
                </h1>
              </div>

              <div className='p-4'>
                <div className='mb-6'>
                  <h2 className='mb-4 text-base font-medium text-foreground/90'>
                    Room Dimensions
                  </h2>
                  <Dimensions room={room} />
                </div>

                <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                  <AreasAffected
                    setAffectedAreas={(s, data) => {
                      saveAffectedArea(data, s, room.publicId);
                    }}
                    affectedAreas={room.AreaAffected}
                  />

                  <div className='lg:col-span-2'>
                    <Tabs
                      defaultValue={
                        room.AreaAffected.find((area) => !area.isDeleted)
                          ?.type || "wall"
                      }
                      className='w-full'
                    >
                      <TabsList className='mb-4 grid w-full grid-cols-3'>
                        {areaAffectedOrder.map((areaType) => {
                          const area = room.AreaAffected.find(
                            (a) => a.type === areaType && !a.isDeleted
                          );
                          if (!area) return null;
                          return (
                            <TabsTrigger key={area.publicId} value={areaType}>
                              {areaAffectedTitle[areaType]}
                            </TabsTrigger>
                          );
                        })}
                      </TabsList>
                      {areaAffectedOrder.map((areaType) => {
                        const areaAffected = room.AreaAffected.find(
                          (a) => a.type === areaType && !a.isDeleted
                        );
                        if (!areaAffected) return null;
                        return (
                          <TabsContent
                            key={areaAffected.publicId}
                            value={areaType}
                          >
                            <div className='rounded-lg border border-border/10 bg-gradient-to-br from-background/80 via-background/50 to-background/80 p-4'>
                              <div className='mb-4 flex items-center gap-2'>
                                <div className='h-5 w-1 rounded-full bg-gradient-to-b from-primary/60 to-primary/30' />
                                <h2 className='text-base font-medium text-foreground/90'>
                                  {areaAffectedTitle[areaType]}
                                </h2>
                                <div className='flex-1 border-t border-border/20'></div>
                              </div>

                              <div className='grid gap-4'>
                                <div className='rounded-md border border-border/10 bg-muted/5 p-3'>
                                  <div className='w-full'>
                                    {areaType === "wall" ? (
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
                                    ) : null}
                                  </div>
                                </div>

                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                  <div className='rounded-md border border-border/10 bg-muted/5 p-3'>
                                    <h3 className='mb-2 text-sm font-medium text-muted-foreground'>
                                      Total Area Removed
                                    </h3>
                                    <Input
                                      className='w-full'
                                      defaultValue={
                                        areaAffected.totalAreaRemoved || ""
                                      }
                                      placeholder='Enter value'
                                      type='number'
                                      onChange={(e) => {
                                        setHasChanges(true);
                                        saveAffectedArea(
                                          {
                                            totalAreaRemoved: e.target.value,
                                            id: areaAffected.id,
                                          },
                                          areaType,
                                          room.publicId
                                        );
                                      }}
                                      name='totalAreaRemoved'
                                    />
                                  </div>

                                  <div className='rounded-md border border-border/10 bg-muted/5 p-3'>
                                    <h3 className='mb-2 text-sm font-medium text-muted-foreground'>
                                      Total Area Anti-Microbial Applied
                                    </h3>
                                    <Input
                                      className='w-full'
                                      defaultValue={
                                        areaAffected.totalAreaMicrobialApplied ||
                                        ""
                                      }
                                      placeholder='Enter value'
                                      type='number'
                                      onChange={(e) => {
                                        setHasChanges(true);
                                        saveAffectedArea(
                                          {
                                            totalAreaMicrobialApplied:
                                              e.target.value,
                                            id: areaAffected.id,
                                          },
                                          areaType,
                                          room.publicId
                                        );
                                      }}
                                      name='totalAreaApplied'
                                    />
                                  </div>

                                  {areaType === "wall" && (
                                    <div className='rounded-md border border-border/10 bg-muted/5 p-3'>
                                      <h3 className='mb-2 text-sm font-medium text-muted-foreground'>
                                        Cabinetry Removed
                                      </h3>
                                      <Input
                                        className='w-full'
                                        defaultValue={
                                          areaAffected.cabinetryRemoved || ""
                                        }
                                        placeholder='Enter value'
                                        type='number'
                                        onChange={(e) => {
                                          setHasChanges(true);
                                          saveAffectedArea(
                                            {
                                              cabinetryRemoved: e.target.value,
                                              id: areaAffected.id,
                                            },
                                            areaType,
                                            room.publicId
                                          );
                                        }}
                                        name='cabinetryremoved'
                                      />
                                    </div>
                                  )}
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
          ))}
        </div>
      )}

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
    </div>
  );
}
