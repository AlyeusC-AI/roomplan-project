import { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { useParams } from "next/navigation";
import { roomStore } from "@atoms/room";
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

interface RoomDeleteModalProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
  room: RoomWithReadings;
  onSuccess?: () => void;
}

const RoomDeleteModal = ({
  setOpen,
  isOpen,
  room,
  onSuccess,
}: RoomDeleteModalProps) => {
  const [loading, setLoading] = useState(false);
  const rooms = roomStore();
  const { id } = useParams();

  const deleteRoom = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/projects/${id}/room/${room.publicId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        toast.error("Failed to delete room");
        return;
      }

      rooms.removeRoom(room);
      setOpen(false);
      toast.success("Room deleted successfully");

      // Trigger refetch callback if provided
      onSuccess?.();
    } catch {
      toast.error("Failed to delete room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => setOpen(false)}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Delete Room</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this room? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <LoadingPlaceholder />
        ) : (
          <DialogFooter className='flex gap-2'>
            <Button variant='outline' onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={deleteRoom}>
              Delete Room
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RoomDeleteModal;
