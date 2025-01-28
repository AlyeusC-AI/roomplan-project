"use client";

import { useState } from "react";
import { PrimaryButton, SecondaryButton } from "@components/components";
import Modal from "@components/DesignSystem/Modal";
import { RoomDataWithoutInferences } from "@servicegeek/db/queries/project/getProjectDetections";
import useAmplitudeTrack from "@utils/hooks/useAmplitudeTrack";
import { useParams } from "next/navigation";
import { event } from "nextjs-google-analytics";
import { roomStore } from "@atoms/room";

import Notes from "./Notes";
import { Pencil, Trash } from "lucide-react";
import { Button } from "@components/ui/button";

const NoteList = ({ room }: { room: RoomDataWithoutInferences }) => {
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
      const res = await fetch(`/api/project/${id}/room-info`, {
        method: "PATCH",
        body: JSON.stringify({
          name: internalRoomName,
          roomId: room.publicId,
        }),
      });
      if (res.ok) {
        roomStore.getState().updateRoomName(room, internalRoomName);
        setIsEditingTitle(false);
      }
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
      const res = await fetch(`/api/project/${id}/room`, {
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
      const res = await fetch(`/api/project/${id}/room-note`, {
        method: "POST",
        body: JSON.stringify({
          roomId: room.publicId,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        console.log("Note created", json);
        roomStore.getState().addRoomNote(room.publicId, json.result);
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
              <input
                value={internalRoomName}
                onChange={(e) => setInternalRoomName(e.target.value)}
                className={`rounded-md border-slate-100 bg-white px-4 py-2 shadow-md ${
                  isSaving ? "bg-slate-200" : ""
                }`}
                disabled={isSaving}
              />
              <SecondaryButton
                onClick={() => setIsEditingTitle(false)}
                className='ml-4'
                disabled={isSaving}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                onClick={() => updateRoomName()}
                className='ml-4'
                disabled={isSaving}
                loading={isSaving}
              >
                Save
              </PrimaryButton>
            </>
          ) : (
            <>
              <h1 className='text-2xl font-semibold text-gray-900'>
                {room.name}
              </h1>
              <button
                onClick={() => setIsEditingTitle(true)}
                className='flex items-center justify-center px-4 py-2 text-slate-500 hover:text-primary'
              >
                <Pencil className='h-4' />
              </button>
            </>
          )}
        </div>
        <div className='flex items-center justify-center gap-4'>
          <Button disabled={isCreating} onClick={() => addNote()}>
            Add Note
          </Button>
          <button
            className='text-slate-400 hover:text-red-600'
            onClick={() => setIsConfirmingDelete(true)}
          >
            <Trash className='h-6' />
          </button>
        </div>
        <Modal open={isConfirmingDelete} setOpen={setIsConfirmingDelete}>
          {() => (
            <>
              <div className='px-4 py-5 sm:p-6'>
                <h3 className='text-lg font-medium leading-6 text-gray-900'>
                  Delete Room
                </h3>
                <div className='mt-2 max-w-xl text-sm text-gray-500'>
                  <p>
                    Permanently delete this room and everything associated
                    within it
                  </p>
                </div>
                <div className='mt-5 flex items-center space-x-4'>
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
                </div>
              </div>
            </>
          )}
        </Modal>
      </div>
      <Notes room={room} />
    </div>
  );
};

export default NoteList;
