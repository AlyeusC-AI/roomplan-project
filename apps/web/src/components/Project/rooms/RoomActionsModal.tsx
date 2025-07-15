import { Dispatch, SetStateAction, useState } from "react";
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
import { Edit2, Trash2 } from "lucide-react";
import { Room, useUpdateRoom, useDeleteRoom } from "@service-geek/api-client";

interface RoomActionsModalProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
  room: Room;
  onSuccess?: () => void;
}

const RoomActionsModal = ({
  setOpen,
  isOpen,
  room,
  onSuccess,
}: RoomActionsModalProps) => {
  const [roomName, setRoomName] = useState(room.name);
  const [isDeleting, setIsDeleting] = useState(false);
  const updateRoomMutation = useUpdateRoom();
  const deleteRoomMutation = useDeleteRoom();

  const handleEdit = async () => {
    if (roomName.length < 3) {
      toast.error("Room name must be at least 3 characters");
      return;
    }

    try {
      await updateRoomMutation.mutateAsync({
        id: room.id,
        data: { name: roomName },
      });

      setOpen(false);
      toast.success("Room updated successfully");
      onSuccess?.();
    } catch (error) {
      console.log("🚀 ~ updateRoom ~ error:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRoomMutation.mutateAsync(room.id);
      setOpen(false);
      toast.success("Room deleted successfully");
      onSuccess?.();
    } catch (error) {
      console.log("🚀 ~ deleteRoom ~ error:", error);
    }
  };

  const resetState = () => {
    setIsDeleting(false);
    setRoomName(room.name);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetState();
        }
        setOpen(open);
      }}
    >
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Edit2 className='h-5 w-5' />
            Edit Room
          </DialogTitle>
          <DialogDescription>
            Update the room name or delete the room.
          </DialogDescription>
        </DialogHeader>

        {updateRoomMutation.isPending || deleteRoomMutation.isPending ? (
          <LoadingPlaceholder />
        ) : (
          <>
            {!isDeleting && (
              <div className='space-y-4 py-4'>
                <div className='grid gap-4'>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='name' className='text-right'>
                      Name
                    </Label>
                    <Input
                      id='name'
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      className='col-span-3'
                      autoFocus
                    />
                  </div>
                </div>
                <DialogFooter className='flex gap-2'>
                  <Button
                    variant='destructive'
                    onClick={() => setIsDeleting(true)}
                    className='flex items-center gap-2'
                  >
                    <Trash2 className='h-4 w-4' />
                    Delete Room
                  </Button>
                  <Button onClick={handleEdit}>Update Room</Button>
                </DialogFooter>
              </div>
            )}

            {isDeleting && (
              <div className='space-y-4 py-4'>
                <div className='rounded-lg border border-destructive/20 bg-destructive/5 p-4'>
                  <h3 className='mb-2 font-medium text-destructive'>
                    Delete Room
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Are you sure you want to delete "{room.name}"? This action
                    cannot be undone.
                  </p>
                </div>
                <DialogFooter className='flex gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setIsDeleting(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant='destructive' onClick={handleDelete}>
                    Delete Room
                  </Button>
                </DialogFooter>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RoomActionsModal;
