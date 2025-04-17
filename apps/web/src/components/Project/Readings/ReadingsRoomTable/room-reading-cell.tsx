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
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="dark:text-white">Temperature</Label>
          <Input
            type="number"
            value={tempReading.temperature || ""}
            onChange={(e) =>
              setTempReading((prev) => ({
                ...prev,
                temperature: e.target.value,
              }))
            }
            className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
            placeholder="Enter temperature"
          />
        </div>
        <div>
          <Label className="dark:text-white">Humidity</Label>
          <Input
            type="number"
            value={tempReading.humidity || ""}
            onChange={(e) =>
              setTempReading((prev) => ({
                ...prev,
                humidity: e.target.value,
              }))
            }
            className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
            placeholder="Enter humidity"
          />
        </div>
        <div>
          <Label className="dark:text-white">GPP</Label>
          <Input
            type="number"
            value={tempReading.gpp || ""}
            disabled
            className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
          />
        </div>
        <div>
          <Label className="dark:text-white">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal dark:bg-gray-800 dark:text-white dark:border-gray-700",
                  !tempReading.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {tempReading.date ? format(new Date(tempReading.date), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 dark:bg-gray-800" align="start">
              <Calendar
                mode="single"
                selected={tempReading.date ? new Date(tempReading.date) : undefined}
                onSelect={(date) =>
                  setTempReading((prev) => ({
                    ...prev,
                    date: date ? date.toISOString() : prev.date,
                  }))
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium dark:text-white">
              {originalWallName || "Wall"} Moisture Content
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWallNameEdit(true)}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAddExtendedWall("wall")}
            className="h-8"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Wall
          </Button>
        </div>
        <div>
          <Input
            type="number"
            value={tempReading.moistureContentWall || ""}
            onChange={(e) =>
              setTempReading((prev) => ({
                ...prev,
                moistureContentWall: e.target.value,
              }))
            }
            className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
            placeholder="Enter moisture content"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium dark:text-white">
              {originalFloorName || "Floor"} Moisture Content
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFloorNameEdit(true)}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAddExtendedWall("floor")}
            className="h-8"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Floor
          </Button>
        </div>
        <div>
          <Input
            type="number"
            value={tempReading.moistureContentFloor || ""}
            onChange={(e) =>
              setTempReading((prev) => ({
                ...prev,
                moistureContentFloor: e.target.value,
              }))
            }
            className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
            placeholder="Enter moisture content"
          />
        </div>
      </div>

      <Dialog open={showWallNameEdit} onOpenChange={setShowWallNameEdit}>
        <DialogContent className="dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Edit Wall Name</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Change the name of the wall for this room.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right dark:text-white">
                Name
              </Label>
              <Input
                id="name"
                value={wallName}
                onChange={(e) => setWallName(e.target.value)}
                className="col-span-3 dark:bg-gray-800 dark:text-white dark:border-gray-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWallNameEdit(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateWallName} disabled={isUpdatingWallName}>
              {isUpdatingWallName ? <LoadingSpinner /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFloorNameEdit} onOpenChange={setShowFloorNameEdit}>
        <DialogContent className="dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Edit Floor Name</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Change the name of the floor for this room.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right dark:text-white">
                Name
              </Label>
              <Input
                id="name"
                value={floorName}
                onChange={(e) => setFloorName(e.target.value)}
                className="col-span-3 dark:bg-gray-800 dark:text-white dark:border-gray-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFloorNameEdit(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFloorName} disabled={isUpdatingFloorName}>
              {isUpdatingFloorName ? <LoadingSpinner /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExtendedWallEdit} onOpenChange={setShowExtendedWallEdit}>
        <DialogContent className="dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              {currentEditingWall?.id ? "Edit" : "Add"} {currentEditingWall?.type === "wall" ? "Wall" : "Floor"}
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {currentEditingWall?.id ? "Edit" : "Add"} a new {currentEditingWall?.type === "wall" ? "wall" : "floor"} measurement point.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right dark:text-white">
                Name
              </Label>
              <Input
                id="name"
                value={currentEditingWall?.name || ""}
                onChange={(e) =>
                  setCurrentEditingWall((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                className="col-span-3 dark:bg-gray-800 dark:text-white dark:border-gray-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendedWallEdit(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveExtendedWall} disabled={isUpdatingExtendedWall}>
              {isUpdatingExtendedWall ? <LoadingSpinner /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {extendedWallsStructure.length > 0 && (
        <div className="space-y-4">
          {extendedWallsStructure.map((wall) => (
            <div key={wall.id} className="flex items-center space-x-4">
              <div className="flex-1">
                <Label className="dark:text-white">{wall.name}</Label>
                <Input
                  type="number"
                  value={
                    extendedWalls.find((w) => w.id === wall.id)?.value || ""
                  }
                  onChange={(e) => {
                    const updatedWalls = extendedWalls.map((w) =>
                      w.id === wall.id ? { ...w, value: e.target.value } : w
                    );
                    if (!updatedWalls.some((w) => w.id === wall.id)) {
                      updatedWalls.push({
                        id: wall.id,
                        name: wall.name,
                        value: e.target.value,
                        type: wall.type,
                      });
                    }
                    setExtendedWalls(updatedWalls);
                    setTempReading((prev) => ({
                      ...prev,
                      extendedWalls: updatedWalls,
                    }));
                  }}
                  className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  placeholder="Enter moisture content"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentEditingWall(wall);
                  setShowExtendedWallEdit(true);
                }}
                className="h-8 w-8 p-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteExtendedWall(wall.id)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <GenericRoomReadings room={room} reading={r} />
    </div>
  );
}
