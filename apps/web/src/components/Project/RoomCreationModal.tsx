import { Dispatch, SetStateAction, useMemo } from "react";
import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { useParams } from "next/navigation";
import { event } from "nextjs-google-analytics";
import { inferencesStore } from "@atoms/inferences";
import { roomStore } from "@atoms/room";
import { Home, X } from "lucide-react";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";

const RoomCreationModal = ({
  setOpen,
  isOpen,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
}) => {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inferences = inferencesStore((state) => state.inferences);

  const roomNames = useMemo(
    () => inferences.map((room) => room.name),
    [inferences]
  );

  const errorWithInput = !!roomNames.find((v) => v === title) && isOpen;
  const disabled = !title || errorWithInput;
  const { id } = useParams();

  const createRoom = async (room: string) => {
    event("attempt_create_room", {
      category: "Estimate Page",
    });
    if (room.toLowerCase().trim() === "automatic") return;
    try {
      setLoading(true);
      const res = await fetch(`/api/project/${id}/room`, {
        method: "POST",
        body: JSON.stringify({
          room,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        inferencesStore.getState().addInference({
          publicId: json.publicId,
          detections: [],
          inferences: [],
          name: room,
        });
        roomStore.getState().addRoom({
          publicId: json.publicId,
          name: room,
          areasAffected: [],
        });
        event("create_room", {
          category: "Estimate Page",
          publicId: json.publicId,
        });
        setOpen(false);
      } else {
        setError("Could not create room");
      }
    } catch (error) {
      console.error(error);
      setError("Could not create room");
    }
    setLoading(false);
  };

  return (
    <>
      <div className='absolute right-0 top-0 hidden pr-4 pt-4 sm:block'>
        <button
          type='button'
          className='rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2'
          onClick={() => setOpen(false)}
        >
          <span className='sr-only'>Close</span>
          <X className='size-6' aria-hidden='true' />
        </button>
      </div>
      <div className='sm:flex sm:items-start'>
        <div className='mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-gray-100 sm:mx-0 sm:size-10'>
          <Home className='size-6' aria-hidden='true' />
        </div>
        <div className='mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left'>
          <Dialog.Title
            as='h3'
            className='text-lg font-medium leading-6 text-gray-900'
          >
            Add a new room
          </Dialog.Title>
          {error && (
            <Dialog.Description className='font-medium leading-6 text-red-900'>
              {error}
            </Dialog.Description>
          )}
          <div className='mt-2'>
            <Input
              name='room-name'
              placeholder='Room Name'
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (disabled) return;
                  createRoom(title);
                }
              }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required={true}
            />
          </div>
        </div>
      </div>
      <div className='mt-5 flex justify-end space-x-2'>
        <Button
          variant='destructive'
          type='button'
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
        <Button
          type='button'
          onClick={() => {
            if (disabled) return;
            createRoom(title);
          }}
          disabled={disabled || loading}
        >
          Add Room
        </Button>
      </div>
    </>
  );
};

export default RoomCreationModal;
