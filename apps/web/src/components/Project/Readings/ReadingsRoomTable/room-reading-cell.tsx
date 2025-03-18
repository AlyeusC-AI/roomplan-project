import { Button } from "@components/ui/button";
import { Calendar } from "@components/ui/calendar";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { cn } from "@lib/utils";
import { CalendarIcon, Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect, useCallback } from "react";
import { roomStore } from "@atoms/room";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import GenericRoomReadings from "./GenericRoomReadings";
import { LoadingSpinner } from "@components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@components/ui/dialog";
import { v4 } from "uuid";
import debounce from "lodash/debounce";

interface ExtendedWall {
  id: string;
  name: string;
  value: string | null;
  type: "wall" | "floor";
  [key: string]: Json | undefined;
}

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export default function RoomReadingCell({
  r,
  room,
}: {
  r: ReadingsWithGenericReadings;
  room: RoomWithReadings;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [tempReading, setTempReading] = useState(r);
  const [showWallNameEdit, setShowWallNameEdit] = useState(false);
  const [showFloorNameEdit, setShowFloorNameEdit] = useState(false);
  const [wallName, setWallName] = useState(room.wallName || "");
  const [floorName, setFloorName] = useState(room.floorName || "");
  const [originalWallName, setOriginalWallName] = useState(room.wallName || "");
  const [originalFloorName, setOriginalFloorName] = useState(room.floorName || "");
  const [isUpdatingWallName, setIsUpdatingWallName] = useState(false);
  const [isUpdatingFloorName, setIsUpdatingFloorName] = useState(false);
  const [extendedWalls, setExtendedWalls] = useState<ExtendedWall[]>(
    (r.extendedWalls as unknown as ExtendedWall[]) || []
  );
  const [extendedWallsStructure, setExtendedWallsStructure] = useState<ExtendedWallItem[]>(
    room.extendedWalls as unknown as ExtendedWall[] || []
  );
  const [showExtendedWallEdit, setShowExtendedWallEdit] = useState(false);
  const [currentEditingWall, setCurrentEditingWall] = useState<ExtendedWall | null>(null);
  const [isUpdatingExtendedWall, setIsUpdatingExtendedWall] = useState(false);
  const rooms = roomStore();
  const { id } = useParams<{ id: string }>();

  const calculateGPP = (temperature: number, humidity: number) => {
    if (!temperature || !humidity) return null;
    return (
      (humidity / 100) * 7000 * (1 / 7000 + (2 / 7000) * (temperature - 32))
    );
  };

  const saveReading = useCallback(async (readingData: any) => {
    try {
      setIsUpdating(true);
      const isolatedTemp = { ...readingData } as any;

      // @ts-ignore
      delete isolatedTemp.GenericRoomReading;
      //@ts-ignore
      delete isolatedTemp.RoomReadingImage;

      await fetch(`/api/v1/projects/${id}/readings`, {
        method: "PATCH",
        body: JSON.stringify({
          type: "standard",
          readingData: {
            ...isolatedTemp,
            moistureContentWall: readingData.moistureContentWall || null,
            moistureContentFloor: readingData.moistureContentFloor || null,
            extendedWalls: readingData.extendedWalls,
          },
          readingId: r.publicId,
        }),
      });

      rooms.updateReading(room.publicId, r.publicId, readingData);
    } catch (error) {
      toast.error("Failed to update reading");
    } finally {
      setIsUpdating(false);
    }
  }, [id, r.publicId, room.publicId, rooms]);

  const debouncedSave = useCallback(
    debounce((readingData: any) => {
      saveReading(readingData);
    }, 1000),
    [saveReading]
  );

  useEffect(() => {
    setTempReading((prev) => ({
      ...prev,
      gpp: calculateGPP(Number(prev.temperature), Number(prev.humidity))?.toString() || null,
    }));
  }, []);

  // Auto-save when tempReading changes
  useEffect(() => {
    if (tempReading) {
      debouncedSave(tempReading);
    }
  }, [tempReading, debouncedSave]);

  const handleUpdateWallName = async () => {
    try {
      setIsUpdatingWallName(true);
      const res = await fetch(`/api/v1/projects/${id}/room`, {
        method: "PATCH",
        body: JSON.stringify({
          wallName,
          roomId: room.publicId,
        }),
      });
      if (res.ok) {
        roomStore.getState().updateRoom(room.publicId, { wallName });
        setShowWallNameEdit(false);
        setOriginalWallName(wallName);
        toast.success("Wall name updated");
      } else {
        toast.error("Failed to update wall name");
      }
    } catch (error) {
      toast.error("Failed to update wall name");
    } finally {
      setIsUpdatingWallName(false);
    }
  };

  const handleUpdateFloorName = async () => {
    try {
      setIsUpdatingFloorName(true);
      const res = await fetch(`/api/v1/projects/${id}/room`, {
        method: "PATCH",
        body: JSON.stringify({
          floorName,
          roomId: room.publicId,
        }),
      });
      if (res.ok) {
        roomStore.getState().updateRoom(room.publicId, { floorName });
        setShowFloorNameEdit(false);
        setOriginalFloorName(floorName);
        toast.success("Floor name updated");
      } else {
        toast.error("Failed to update floor name");
      }
    } catch (error) {
      toast.error("Failed to update floor name");
    } finally {
      setIsUpdatingFloorName(false);
    }
  };

  const handleAddExtendedWall = (type: "wall" | "floor") => {
    const newWall: ExtendedWall = {
      id: v4(),
      name: type === "wall" 
        ? `Wall ${extendedWallsStructure.filter(w => w.type === "wall").length + 1}`
        : `Floor ${extendedWallsStructure.filter(w => w.type === "floor").length + 1}`,
      value: null,
      type,
    };
    setCurrentEditingWall(newWall);
    setShowExtendedWallEdit(true);
  };

  const handleSaveExtendedWall = async () => {
    if (!currentEditingWall) return;

    try {
      setIsUpdatingExtendedWall(true);
      const updatedWalls = currentEditingWall.id && extendedWallsStructure.some(w => w.id === currentEditingWall.id)
        ? extendedWallsStructure.map(w => w.id === currentEditingWall.id ? currentEditingWall : w)
        : [...extendedWallsStructure, currentEditingWall];

      const extendedWallsJson = updatedWalls.map(w => ({
        id: w.id,
        name: w.name,
        value: w.value,
        type: w.type
      })) as Json;

      const res = await fetch(`/api/v1/projects/${id}/room`, {
        method: "PATCH",
        body: JSON.stringify({
          extendedWalls: extendedWallsJson,
          roomId: room.publicId,
        }),
      });

      if (res.ok) {
        roomStore.getState().updateRoom(room.publicId, { extendedWalls: updatedWalls });
        setExtendedWallsStructure(updatedWalls);
        setShowExtendedWallEdit(false);
        setCurrentEditingWall(null);
        toast.success("Wall updated successfully");
      } else {
        toast.error("Failed to update wall");
      }
    } catch (error) {
      toast.error("Failed to update wall");
    } finally {
      setIsUpdatingExtendedWall(false);
    }
  };

  const handleDeleteExtendedWall = async (wallId: string) => {
    try {
      const updatedWalls = extendedWallsStructure.filter(w => w.id !== wallId);
      const extendedWallsJson = updatedWalls.map(w => ({
        id: w.id,
        name: w.name,
        value: w.value,
        type: w.type
      })) as Json;

      const res = await fetch(`/api/v1/projects/${id}/room`, {
        method: "PATCH",
        body: JSON.stringify({
          extendedWalls: extendedWallsJson,
          roomId: room.publicId,
        }),
      });

      if (res.ok) {
        roomStore.getState().updateRoom(room.publicId, { extendedWalls: updatedWalls });
        setExtendedWallsStructure(updatedWalls);
        toast.success("Wall deleted successfully");
      } else {
        toast.error("Failed to delete wall");
      }
    } catch (error) {
      toast.error("Failed to delete wall");
    }
  };

  return (
    <div key={r.publicId} className='mt-6 border-l-2 border-gray-500 pl-4'>
      <div className='flex flex-col items-start space-y-2'>
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !tempReading.date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className='mr-2 size-4' />
              {tempReading.date ? (
                format(new Date(tempReading.date), "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0'>
            <Calendar
              mode='single'
              selected={
                tempReading.date ? new Date(tempReading.date) : new Date()
              }
              onSelect={(date) =>
                setTempReading({ ...tempReading, date: date!.toISOString() })
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className='mt-3 grid grid-cols-2 gap-6'>
        <div className='flex flex-col items-start space-y-2'>
          <Label>Temperature (F)</Label>
          <Input
            className='col-span-1'
            defaultValue={tempReading.temperature || ""}
            placeholder='Temperature'
            onChange={(e) => {
              const newTemp = e.target.value;
              setTempReading({
                ...tempReading,
                temperature: newTemp,
                gpp: calculateGPP(
                  Number(newTemp),
                  Number(tempReading.humidity)
                )?.toString() || null,
              });
            }}
            name='temperature'
            title='Temperature'
          />
        </div>
        <div className='flex flex-col items-start space-y-2'>
          <Label>Relative Humidity (RH)</Label>
          <Input
            className='col-span-1'
            defaultValue={tempReading.humidity || ""}
            placeholder='Humidity'
            onChange={(e) => {
              const newHumidity = e.target.value;
              setTempReading({
                ...tempReading,
                humidity: newHumidity,
                gpp: calculateGPP(
                  Number(tempReading.temperature),
                  Number(newHumidity)
                )?.toString() || null,
              });
            }}
            name='relative-humidity'
            title='Relative Humidity'
          />
        </div>
        <div className='flex flex-col items-start space-y-2'>
          <Label>Grains Per Pound (gpp)</Label>
          <Input
            className='col-span-1'
            value={tempReading.gpp ? Number(tempReading.gpp).toFixed(2) : "--"}
            disabled
            placeholder='Grains Per Pound'
          />
        </div>

        {/* Wall Moisture Content Section */}
        <div className='col-span-2'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center gap-2'>
              {showWallNameEdit ? (
                <div className='flex items-center gap-2'>
                  <Input
                    value={wallName}
                    onChange={(e) => setWallName(e.target.value)}
                    className='w-48'
                  />
                  <Button
                    onClick={handleUpdateWallName}
                    disabled={isUpdatingWallName}
                  >
                    {isUpdatingWallName ? <LoadingSpinner /> : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setWallName(originalWallName);
                      setShowWallNameEdit(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <Label className='text-base'>{wallName || "Moisture Content (Wall)"}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowWallNameEdit(true)}
                  >
                    <Pencil className='h-4 w-4' />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddExtendedWall("wall")}
              >
                <Plus className='h-4 w-4' />
              </Button>
            </div>
          </div>
          <Input
            className='col-span-1'
            defaultValue={r.moistureContentWall || ""}
            onChange={(e) =>
              setTempReading({
                ...tempReading,
                moistureContentWall: e.target.value,
              })
            }
            name='moisture-wall'
            title='Moisture Content (Wall)'
            placeholder='Moisture Content Percentage'
          />
          {/* Extended Walls */}
          {extendedWallsStructure
            .filter(w => w.type === "wall")
            .map((wall) => {
              const wallReading = extendedWalls.find(w => w.id === wall.id);
              if(!wallReading) {
                setExtendedWalls(extendedWalls.concat({id: wall.id, name: wall.name, value: wall.value, type: wall.type}))
              }
              return (
                <div key={wall.id} className='mt-2 flex items-center gap-2'>
                  <div className='flex flex-col items-start space-y-2'>
                    <div className='mt-2 flex items-center gap-0'>
                      <Label className='text-base'>{wall.name}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentEditingWall(wall);
                          setShowExtendedWallEdit(true);
                        }}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExtendedWall(wall.id)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                    <Input
                      className='col-span-1'
                      value={wallReading?.value || ""}
                      onChange={(e) => {
                        const updatedWalls = extendedWalls.map(w =>
                          w.id === wall.id ? { ...w, value: e.target.value } : w
                        );
                        setExtendedWalls(updatedWalls);
                        setTempReading(prev => ({
                          ...prev,
                          extendedWalls: updatedWalls
                        }));
                      }}
                      placeholder={`${wall.name} Moisture Content`}
                    />
                  </div>
                </div>
              );
            })}
        </div>

        {/* Floor Moisture Content Section */}
        <div className='col-span-2'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center gap-2'>
              {showFloorNameEdit ? (
                <div className='flex items-center gap-2'>
                  <Input
                    value={floorName}
                    onChange={(e) => setFloorName(e.target.value)}
                    className='w-48'
                  />
                  <Button
                    onClick={handleUpdateFloorName}
                    disabled={isUpdatingFloorName}
                  >
                    {isUpdatingFloorName ? <LoadingSpinner /> : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFloorName(originalFloorName);
                      setShowFloorNameEdit(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <Label className='text-base'>{floorName || "Moisture Content (Floor)"}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFloorNameEdit(true)}
                  >
                    <Pencil className='h-4 w-4' />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddExtendedWall("floor")}
              >
                <Plus className='h-4 w-4' />
              </Button>
            </div>
          </div>
          <Input
            className='col-span-1'
            defaultValue={r.moistureContentFloor || ""}
            onChange={(e) =>
              setTempReading({
                ...tempReading,
                moistureContentFloor: e.target.value,
              })
            }
            name='moisture-floor'
            title='Moisture Content (Floor)'
            placeholder='Moisture Content Percentage'
          />
          {/* Extended Floors */}
          {extendedWallsStructure
            .filter(w => w.type === "floor")
            .map((floor) => {
              const floorReading = extendedWalls.find(w => w.id === floor.id);
              if(!floorReading) {
                setExtendedWalls(extendedWalls.concat({id: floor.id, name: floor.name, value: floor.value, type: floor.type}))
              }
              return (
                <div key={floor.id} className='mt-2 flex items-center gap-2'>
                  <div className='flex flex-col items-start space-y-2'>
                    <div className='mt-2 flex items-center gap-0'>
                      <Label className='text-base'>{floor.name}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentEditingWall(floor);
                          setShowExtendedWallEdit(true);
                        }}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExtendedWall(floor.id)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                    <Input
                      className='col-span-1'
                      value={floorReading?.value || ""}
                      onChange={(e) => {
                        const updatedWalls = extendedWalls.map(w =>
                          w.id === floor.id ? { ...w, value: e.target.value } : w
                        );
                        setExtendedWalls(updatedWalls);
                        setTempReading(prev => ({
                          ...prev,
                          extendedWalls: updatedWalls
                        }));
                      }}
                      placeholder={`${floor.name} Moisture Content`}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Extended Wall Edit Dialog */}
      <Dialog open={showExtendedWallEdit} onOpenChange={setShowExtendedWallEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentEditingWall?.type === "wall" ? "Edit Wall" : "Edit Floor"}
            </DialogTitle>
            <DialogDescription>
              Enter the name and moisture content for this {currentEditingWall?.type}.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='name' className='text-right'>
                Name
              </Label>
              <Input
                id='name'
                value={currentEditingWall?.name || ""}
                onChange={(e) =>
                  setCurrentEditingWall((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                className='col-span-3'
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowExtendedWallEdit(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveExtendedWall}>
              {isUpdatingExtendedWall ? <LoadingSpinner /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GenericRoomReadings room={room} reading={r} />
    </div>
  );
}
