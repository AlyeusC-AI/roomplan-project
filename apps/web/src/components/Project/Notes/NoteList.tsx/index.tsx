"use client";

import { useState } from "react";
import useAmplitudeTrack from "@utils/hooks/useAmplitudeTrack";
import { event } from "nextjs-google-analytics";
import Notes from "./Notes";
import { Pencil, Trash, ChevronDown, ChevronRight, PlusCircle } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(true);
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
    <div className='rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800'>
      <div className='flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900'>
        <div className='flex items-center space-x-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setIsExpanded(!isExpanded)}
            className='h-8 w-8'
          >
            {isExpanded ? (
              <ChevronDown className='h-4 w-4' />
            ) : (
              <ChevronRight className='h-4 w-4' />
            )}
          </Button>
          <div className='flex items-center'>
            {isEditingTitle ? (
              <>
                <Input
                  value={internalRoomName}
                  onChange={(e) => setInternalRoomName(e.target.value)}
                  disabled={isSaving}
                  className='h-8 w-48 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
                />
                <Button
                  onClick={() => setIsEditingTitle(false)}
                  className='ml-2 h-8'
                  variant='outline'
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => updateRoomName()}
                  className='ml-2 h-8'
                  disabled={isSaving}
                >
                  {isSaving ? <LoadingSpinner /> : "Save"}
                </Button>
              </>
            ) : (
              <>
                <h2 className='text-lg font-semibold dark:text-white'>
                  {room.name}
                </h2>
                <Button
                  variant='ghost'
                  onClick={() => setIsEditingTitle(true)}
                  className='ml-2 h-8 w-8 p-0'
                >
                  <Pencil className='h-4 w-4' />
                </Button>
              </>
            )}
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          <Button disabled={isCreating} onClick={openAddDialog} className='h-8'>
            <PlusCircle />
            {isCreating ? <LoadingSpinner /> : "Add Note"}
          </Button>
          <Button
            onClick={() => setIsConfirmingDelete(true)}
            variant='destructive'
            className='h-8 w-8 p-0'
          >
            <Trash className='h-4 w-4' />
          </Button>
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isExpanded ? "opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className='p-4 pt-0'>
          <Notes room={room} />
        </div>
      </div>
      <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <DialogContent className='dark:bg-gray-800'>
          <DialogHeader className='dark:text-white'>Delete Room</DialogHeader>
          <DialogDescription className='dark:text-gray-400'>
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
