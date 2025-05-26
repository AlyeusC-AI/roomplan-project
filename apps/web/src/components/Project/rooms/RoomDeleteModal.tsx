import { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { useParams } from "next/navigation";
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
import { Room, useDeleteRoom } from "@service-geek/api-client";

interface RoomDeleteModalProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
  room: Room;
  onSuccess?: () => void;
}

const RoomDeleteModal = ({
  setOpen,
  isOpen,
  room,
  onSuccess,
}: RoomDeleteModalProps) => {
  // const rooms = roomStore();
  const deleteRoomMutation = useDeleteRoom();

  const deleteRoom = async () => {
    try {
      await deleteRoomMutation.mutateAsync(room.id);
      setOpen(false);
      toast.success("Room deleted successfully");
      onSuccess?.();
    } catch (error) {
      console.log("🚀 ~ deleteRoom ~ error:", error);
      // toast.error("Failed to delete room");
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
        {deleteRoomMutation.isPending ? (
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
