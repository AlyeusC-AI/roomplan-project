"use client";

import { useState } from "react";
import useAmplitudeTrack from "@utils/hooks/useAmplitudeTrack";
import { useParams } from "next/navigation";
import { event } from "nextjs-google-analytics";

import Notes from "./Notes";
import { Pencil, Trash, ChevronDown } from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@components/ui/collapsible";
import {
  Room,
  useCreateNote,
  useUpdateRoom,
  useDeleteRoom,
} from "@service-geek/api-client";
import { Textarea } from "@components/ui/textarea";
const NoteList = ({ room }: { room: Room }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { track } = useAmplitudeTrack();
  const [internalRoomName, setInternalRoomName] = useState(room.name);

  const { mutate: createNote } = useCreateNote();
  const { mutate: updateRoom } = useUpdateRoom();
  const { mutate: deleteRoomMutation } = useDeleteRoom();
  const updateRoomName = async () => {
    if (internalRoomName === "" || internalRoomName.trim() === "") return;
    setIsSaving(true);
    track("Update Room Name");

    try {
      updateRoom({
        id: room.id,
        data: {
          name: internalRoomName,
        },
      });
      toast.success("Room name updated");

      setIsEditingTitle(false);
    } catch (error) {
      // toast.error("Failed to update room name");
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
      deleteRoomMutation(room.id);
      toast.success("Room deleted");
    } catch (error) {
      console.log(error);
    }
    setIsDeleting(false);
    setIsConfirmingDelete(false);
  };

  const [isCreating, setIsCreating] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newNoteBody, setNewNoteBody] = useState("");

  const openAddDialog = () => {
    setNewNoteBody("");
    setAddDialogOpen(true);
  };

  const handleAddNote = async () => {
    if (!newNoteBody.trim()) return;
    setIsCreating(true);
    track("Add Room Note");
    try {
      createNote({
        roomId: room.id,
        body: newNoteBody,
      });
      toast.success("Note created");
      setAddDialogOpen(false);
      setNewNoteBody("");
    } catch (error) {
      console.error(error);
    }
    setIsCreating(false);
  };

  return (
    <div className='py-8 text-sm md:text-base'>
      <Collapsible open={isCollapsed} onOpenChange={setIsCollapsed}>



        <div className='flex items-center justify-between'>
          <CollapsibleTrigger asChild>
            <div className='flex items-center'>

              <Button variant='ghost' className='h-auto p-0 me-2' onClick={() => setIsCollapsed(true)}>
                <ChevronDown
                  className={`!size-6 transition-transform ${isCollapsed ? "" : "rotate-180"}`}
                />

              </Button>
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
          </CollapsibleTrigger>
          <div className='flex items-center justify-center gap-4'>
            <Button
              // variant='outline'
              disabled={isCreating}
              onClick={openAddDialog}
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

        <CollapsibleContent>
          <Notes room={room} />
        </CollapsibleContent>
      </Collapsible>
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>Add Note</DialogHeader>
          <DialogDescription>
            Enter the note body below and click Save to add a new note.
          </DialogDescription>
          <Textarea
            value={newNoteBody}
            onChange={(e) => setNewNoteBody(e.target.value)}
            className='mt-2'
            rows={6}
            autoFocus
          />
          <DialogFooter>
            <Button
              onClick={handleAddNote}
              disabled={isCreating || !newNoteBody.trim()}
            >
              {isCreating ? <LoadingSpinner /> : "Save"}
            </Button>
            <Button
              variant='outline'
              type='button'
              onClick={() => setAddDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NoteList;
