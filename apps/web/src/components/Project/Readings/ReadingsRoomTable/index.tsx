import { useState } from "react";
import useAmplitudeTrack from "@utils/hooks/useAmplitudeTrack";
import { event } from "nextjs-google-analytics";

import Readings from "./Readings";
import { roomStore } from "@atoms/room";
import { Pencil, Trash } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@components/ui/button";
import { LoadingSpinner } from "@components/ui/spinner";
import { Input } from "@components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@components/ui/dialog";
import { v4 } from "uuid";

const MitigationRoomTable = ({ room }: { room: RoomWithReadings }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { track } = useAmplitudeTrack();
  const [internalRoomName, setInternalRoomName] = useState(room.name);
  const [isCreating, setIsCreating] = useState(false);

  const { id } = useParams<{ id: string }>();

  const updateRoomName = async () => {
    if (internalRoomName === "" || internalRoomName.trim() === "") return;
    setIsSaving(true);
    track("Update Room Name");

    try {
      const res = await fetch(`/api/v1/projects/${id}/room`, {
        method: "PATCH",
        body: JSON.stringify({
          name: internalRoomName,
          roomId: room.publicId,
        }),
      });
      if (res.ok) {
        roomStore.getState().updateRoomName(room, internalRoomName);
        setIsEditingTitle(false);
        toast.success("Room name updated");
      } else {
        toast.error("Failed to update room name");
      }
    } catch (error) {
      toast.error("Failed to update room name");
      console.log(error);
    }

    setIsSaving(false);
  };

  const deleteRoom = async () => {
    event("delete_room", {
      category: "Estimate Page",
    });
    setIsDeleting(true);
    track("Delete Room");
    try {
      const res = await fetch(`/api/v1/projects/${id}/room`, {
        method: "DELETE",
        body: JSON.stringify({
          roomId: room.publicId,
          name: room.name,
        }),
      });
      if (res.ok) {
        roomStore.getState().removeRoom(room);
        toast.success("Room deleted");
      } else {
        toast.error("Failed to delete room");
      }
    } catch (error) {
      toast.error("Failed to delete room");
      console.log(error);
    }
    setIsDeleting(false);
    setIsConfirmingDelete(false);
  };

  const addReading = async () => {
    setIsCreating(true);
    track("Add Room Reading");
    try {
      const res = await fetch(`/api/v1/projects/${id}/readings`, {
        method: "POST",
        body: JSON.stringify({
          type: "standard",
          data: { roomId: room.id, publicId: v4(), projectId: room.projectId },
        }),
      });
      if (res.ok) {
        const body = await res.json();
        toast.success("Reading added successfully");
        roomStore.getState().addReading(room.publicId, body.reading);
      } else {
        toast.error("Failed to add reading");
      }
      setIsCreating(false);
    } catch {
      toast.error("Failed to add reading");
    }
  };

  return (
    <div className='py-8 text-sm md:text-base'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center'>
          {isEditingTitle ? (
            <>
              <Input
                value={internalRoomName}
                onChange={(e) => setInternalRoomName(e.target.value)}
                disabled={isSaving}
              />
              <Button
                onClick={() => setIsEditingTitle(false)}
                className='ml-4'
                variant='outline'
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={() => updateRoomName()}
                className='ml-4'
                disabled={isSaving}
              >
                {isSaving ? <LoadingSpinner /> : "Save"}
              </Button>
            </>
          ) : (
            <>
              <h1 className='text-2xl font-semibold'>{room.name}</h1>
              <Button
                variant='outline'
                onClick={() => setIsEditingTitle(true)}
                className='ml-4'
              >
                <Pencil className='h-4' />
              </Button>
            </>
          )}
        </div>
        <div className='flex items-center justify-center gap-4'>
          <Button disabled={isCreating} onClick={() => addReading()}>
            {isCreating ? <LoadingSpinner /> : "Add Reading"}
          </Button>
          <Button
            onClick={() => setIsConfirmingDelete(true)}
            variant='destructive'
          >
            <Trash className='h-6' />
          </Button>
        </div>
        <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
          <DialogContent>
            <DialogHeader>Delete Room</DialogHeader>
            <DialogDescription>
              Permanently delete this room and everything associated within it
            </DialogDescription>
            <div className='flex items-center justify-end space-x-4'>
              <Button
                variant='outline'
                onClick={() => setIsConfirmingDelete(false)}
              >
                Cancel
              </Button>
              <Button onClick={deleteRoom} variant='destructive'>
                {isDeleting ? <LoadingSpinner /> : "Yes, delete the room."}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Readings room={room} />
    </div>
  );
};

export default MitigationRoomTable;
