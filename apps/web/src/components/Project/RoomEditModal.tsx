import { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { useParams } from "next/navigation";
import { roomStore } from "@atoms/room";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { Label } from "@components/ui/label";

interface RoomEditModalProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
  room: RoomWithReadings;
  onSuccess?: () => void;
}

const RoomEditModal = ({
  setOpen,
  isOpen,
  room,
  onSuccess,
}: RoomEditModalProps) => {
  const [roomName, setRoomName] = useState(room.name);
  const [loading, setLoading] = useState(false);
  const rooms = roomStore();

  const { id } = useParams();

  const updateRoom = async () => {
    try {
      setLoading(true);
      if (roomName.length < 3) {
        toast.error("Room name must be at least 3 characters");
        return;
      }

      const res = await fetch(`/api/v1/projects/${id}/room`, {
        method: "PATCH",
        body: JSON.stringify({ roomId: room.publicId, name: roomName }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        toast.error("Failed to update room");
        return;
      }

      rooms.updateRoom(room.publicId, { name: roomName });
      setOpen(false);
      toast.success("Room updated successfully");

      // Trigger refetch callback if provided
      onSuccess?.();
    } catch {
      toast.error("Failed to update room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => setOpen(false)}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Edit Room</DialogTitle>
          <DialogDescription>
            Update the room name for your project.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <LoadingPlaceholder />
        ) : (
          <>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='name' className='text-right'>
                  Name
                </Label>
                <Input
                  id='name'
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className='col-span-3'
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={updateRoom}>Update Room</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RoomEditModal;
