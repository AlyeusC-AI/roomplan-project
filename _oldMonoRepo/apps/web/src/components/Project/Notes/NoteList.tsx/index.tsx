"use client";

import { useState } from "react";
import useAmplitudeTrack from "@utils/hooks/useAmplitudeTrack";
import { useParams } from "next/navigation";
import { event } from "nextjs-google-analytics";
import { roomStore } from "@atoms/room";

import Notes from "./Notes";
import { Pencil, Trash } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { LoadingSpinner } from "@components/ui/spinner";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@components/ui/dialog";

const NoteList = ({ room }: { room: RoomWithReadings }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { track } = useAmplitudeTrack();
  const [internalRoomName, setInternalRoomName] = useState(room.name);

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
        toast.success("Room name updated");
        roomStore.getState().updateRoomName(room, internalRoomName);
        setIsEditingTitle(false);
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
      category: "Note Page",
    });
    setIsDeleting(true);
    track("Delete Room");
    try {
      const res = await fetch(`/api/v1/projects/${id}/room/${room.publicId}`, {
        method: "DELETE",
        body: JSON.stringify({
          roomId: room.publicId,
        }),
      });
      if (res.ok) {
        roomStore.getState().removeRoom(room);
      }
    } catch (error) {
      console.log(error);
    }
    setIsDeleting(false);
    setIsConfirmingDelete(false);
  };

  const [isCreating, setIsCreating] = useState(false);

  const addNote = async () => {
    setIsCreating(true);
    track("Add Room Note");

    try {
      const res = await fetch(`/api/v1/projects/${id}/notes`, {
        method: "POST",
        body: JSON.stringify({
          roomId: room.publicId,
          body: "",
        }),
      });
      if (res.ok) {
        const json = await res.json();
        console.log("Note created", json);
        roomStore.getState().addRoomNote(room.publicId, json.note);
      }
    } catch (error) {
      console.error(error);
    }
    setIsCreating(false);
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
                disabled={isSaving}
                variant='outline'
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
              <h1 className='text-2xl font-semibold text-foreground'>
                {room.name}
              </h1>
              <Button
                className='ml-4'
                onClick={() => setIsEditingTitle(true)}
                variant='outline'
              >
                <Pencil className='h-4' />
              </Button>
            </>
          )}
        </div>
        <div className='flex items-center justify-center gap-4'>
          <Button
            variant='outline'
            disabled={isCreating}
            onClick={() => addNote()}
          >
            {isCreating ? <LoadingSpinner /> : "Add Note"}
          </Button>
          <Button
            variant='destructive'
            onClick={() => setIsConfirmingDelete(true)}
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
            <DialogFooter>
              <Button onClick={() => setIsConfirmingDelete(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => deleteRoom()}
                disabled={isDeleting}
                variant='destructive'
              >
                Yes, delete the room.
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Notes room={room} />
    </div>
  );
};

export default NoteList;
