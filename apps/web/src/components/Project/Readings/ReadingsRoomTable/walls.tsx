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
import {
  Room,
  RoomReading,
  WallReading as WallReadingType,
  useCreateWall,
  useUpdateWall,
  useDeleteWall,
  Wall,
} from "@service-geek/api-client";

export default function WallReading({
  wallReading,
  onUpdate,
  wall,
}: {
  wallReading: WallReadingType | undefined;
  onUpdate: (wallReading: Partial<WallReadingType>) => void;
  wall: Wall;
}) {
  console.log("🚀 ~ wallReajjjjjjding:", wallReading);
  const [wallName, setWallName] = useState(wall.name || "");
  const [originalWallName, setOriginalWallName] = useState(wall.name || "");
  const [showWallNameEdit, setShowWallNameEdit] = useState(false);
  const [showAddWall, setShowAddWall] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdatingWallName, setIsUpdatingWallName] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutate: createWall, data } = useCreateWall();
  const { mutate: updateWall } = useUpdateWall();
  const { mutate: deleteWall } = useDeleteWall();
  useEffect(() => {
    console.log("🚀 ~ useEffect ~ data:", data);

    if (typeof wallReading == "undefined") {
      onUpdate({
        wallId: wall?.id,
        reading: 0,
      });
    }
  }, [wallReading]);
  useEffect(() => {
    setWallName(wall.name || "");
    setOriginalWallName(wall.name || "");
  }, [wall]);

  const handleUpdateWallName = async () => {
    try {
      setIsUpdatingWallName(true);
      if (showAddWall) {
        const newWall = await createWall({
          name: wallName,
          type: wall.type,
          roomId: wall.roomId,
        });
        // console.log("🚀 ~ handleUpdateWallName ~ newWall:", newWall);
        // onUpdate({
        //   wallId: newWall.id,
        //   reading: 0,
        // });
      } else {
        await updateWall({
          id: wall.id,
          data: {
            name: wallName,
          },
        });
      }
    } catch (error) {
      console.log("🚀 ~ handleUpdateWallName ~ error:", error);
      //   toast.error("Failed to update wall name");
    } finally {
      setIsUpdatingWallName(false);
      setShowWallNameEdit(false);
      setShowAddWall(false);
    }
  };

  const handleDeleteWall = async () => {
    try {
      setIsDeleting(true);
      await deleteWall(wall.id);
      toast.success("Wall deleted successfully");
    } catch (error) {
      console.error("Failed to delete wall:", error);
      toast.error("Failed to delete wall");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const type = wall.type == "WALL" ? "wall" : "floor";
  return (
    <div>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <h3 className='text-lg font-medium dark:text-white'>
              {originalWallName || `${type} Moisture Content`}
            </h3>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowWallNameEdit(true)}
              className='h-8 w-8 p-0'
            >
              <Pencil className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowDeleteConfirm(true)}
              className='h-8 w-8 p-0 text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setShowAddWall(true)}
            className='h-8'
          >
            <Plus className='mr-2 h-4 w-4' />
            Add {type}
          </Button>
        </div>
        <div>
          <Input
            type='number'
            value={wallReading?.reading || ""}
            onChange={(e) => {
              console.log("🚀 ~ oaaanChange ~ e:", Number(e.target.value));
              onUpdate({
                ...(wallReading || {}),
                reading: Number(e.target.value),
              });
            }}
            className='dark:border-gray-700 dark:bg-gray-800 dark:text-white'
            placeholder='Enter moisture content'
          />
        </div>
      </div>

      <Dialog
        open={showWallNameEdit || showAddWall}
        onOpenChange={(open) => {
          if (!open) {
            setShowWallNameEdit(false);
            setShowAddWall(false);
          }
        }}
      >
        <DialogContent className='dark:bg-gray-800'>
          <DialogHeader>
            <DialogTitle className='dark:text-white'>
              {showAddWall ? "Add " + type : `Edit ${type} Name`}
            </DialogTitle>
            <DialogDescription className='dark:text-gray-400'>
              {showAddWall
                ? "Add a new " + type
                : "Edit the name of the " + type}
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='name' className='text-right dark:text-white'>
                Name
              </Label>
              <Input
                id='name'
                value={wallName}
                onChange={(e) => setWallName(e.target.value)}
                className='col-span-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                if (showAddWall) {
                  setShowAddWall(false);
                } else {
                  setShowWallNameEdit(false);
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateWallName}
              disabled={isUpdatingWallName}
            >
              {isUpdatingWallName ? <LoadingSpinner /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDeleteConfirm}
        onOpenChange={(open) => {
          if (!open) {
            setShowDeleteConfirm(false);
          }
        }}
      >
        <DialogContent className='dark:bg-gray-800'>
          <DialogHeader>
            <DialogTitle className='dark:text-white'>Delete {type}</DialogTitle>
            <DialogDescription className='dark:text-gray-400'>
              Are you sure you want to delete this {type}? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteWall}
              disabled={isDeleting}
            >
              {isDeleting ? <LoadingSpinner /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
