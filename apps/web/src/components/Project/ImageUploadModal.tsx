import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useMemo,
  useState,
} from "react";
import { FileUploader } from "react-drag-drop-files";
import { UNKNOWN_ROOM } from "@lib/image-processing/constants";
import useAmplitudeTrack from "@utils/hooks/useAmplitudeTrack";
import { useParams } from "next/navigation";
import { event } from "nextjs-google-analytics";
import { ArrowDownToLine, ArrowRight } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { roomStore } from "@atoms/room";
import { DialogContent, DialogHeader } from "@components/ui/dialog";

const ImageUploadModal = ({
  onChange,
  isUploading,
  onClick,
  onDrop,
  setOpen,
  directImageUpload = true,
}: {
  onChange: (e: ChangeEvent<HTMLInputElement>, roomId: string) => void;
  onDrop: (files: FileList, roomId: string) => void;
  isUploading: boolean;
  onClick: () => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
  directImageUpload?: boolean;
}) => {
  const rooms = roomStore();
  const [internalValue, setInternalValue] = useState("");
  const [value, setValue] = useState("");
  const [isCreatingNewRoom, setIsCreatingNewRoom] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState("");
  const { track } = useAmplitudeTrack();

  const roomNames = useMemo(
    () => rooms.rooms.map((room) => room.name),
    [rooms.rooms]
  );
  const errorWithInput = !!roomNames.find((v) => v === title);
  const disabled = !title || errorWithInput;

  const createRoom = async () => {
    if (title.toLowerCase().trim() === "automatic") return;
    if (title.toLowerCase().trim() === "") return;
    event("attempt_create_room", {
      category: "Estimate Page",
    });
    setLoading(true);
    try {
      const res = await fetch(`/api/project/${id}/room`, {
        method: "POST",
        body: JSON.stringify({
          room: title,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        track("Created Room", { roomId: json.publicId });
        inferencesStore.getState().addInference({
          publicId: json.publicId,
          detections: [],
          inferences: [],
          name: title,
        });
        event("create_room", {
          category: "Estimate Page",
          publicId: json.publicId,
        });
        setTitle("");
        setIsCreatingNewRoom(false);
        setValue(json.publicId);
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
    <DialogContent>
      <div>
        <div className='mb-4 flex items-center justify-between'>
          <DialogHeader className='text-xl font-medium'>
            Upload Images
          </DialogHeader>
          {!directImageUpload && (
            <>
              {roomNames.length > 0 && (
                <>
                  {isCreatingNewRoom ? (
                    <Button
                      disabled={loading}
                      onClick={() => {
                        setTitle("");
                        setIsCreatingNewRoom(false);
                      }}
                    >
                      Upload to existing room
                    </Button>
                  ) : (
                    <Button onClick={() => setIsCreatingNewRoom(true)}>
                      Create a new room <ArrowRight className='ml-2 w-4' />
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>
        {!directImageUpload && (
          <div className='mb-4'>
            <div>
              {isCreatingNewRoom || roomNames.length === 0 ? (
                <label
                  htmlFor='createRoom'
                  className='block text-sm font-medium text-gray-700'
                >
                  Create New Room
                </label>
              ) : (
                <label
                  htmlFor='selectRoom'
                  className='block text-sm font-medium text-gray-700'
                >
                  Select Room
                </label>
              )}
            </div>
            <div className='mt-2 flex gap-3'>
              {isCreatingNewRoom || roomNames.length === 0 ? (
                <div className='w-full flex-col'>
                  <div className='flex gap-3'>
                    <Input
                      name='room-name'
                      placeholder='Room Name'
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (disabled) return;
                          createRoom();
                        }
                      }}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required={true}
                    />
                    <Button
                      disabled={loading || errorWithInput || title === ""}
                      className='!w-40'
                      onClick={() => createRoom()}
                    >
                      Add Room
                    </Button>
                  </div>
                  {errorWithInput && (
                    <p className='mt-2 text-sm text-red-600'>
                      A room with name already exists
                    </p>
                  )}
                </div>
              ) : (
                <div className='flex w-full flex-col items-center gap-4'>
                  <select
                    id='selectRoom'
                    name='selectRoom'
                    className='block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
                    value={internalValue}
                    onChange={(e) => {
                      const inference = inferences.find(
                        (i) => i.name === e.target.value
                      );
                      if (inference) {
                        setValue(inference?.publicId);
                        setInternalValue(e.target.value);
                      }
                    }}
                  >
                    <option value='' disabled selected>
                      Select a room
                    </option>
                    {inferences.map((room) => (
                      <option key={room.name} value={room.name}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {((roomNames.length > 0 && !isCreatingNewRoom) ||
          directImageUpload) && (
          <FileUploader
            disabled={directImageUpload ? false : !internalValue}
            handleChange={(files: FileList) => {
              onDrop(files, directImageUpload ? UNKNOWN_ROOM : value);
              setOpen(false);
            }}
            name='file'
            types={["jpg", "jpeg", "png"]}
            multiple
            classes='border-2 rounded-md cursor-pointer border-dashed border-primary-action !h-36 !flex !items-center !justify-center'
          >
            <div className='flex flex-col items-center justify-center'>
              <ArrowDownToLine className='mb-4 size-10' />
              Select or drop files here
              <div className='mt-4 text-xs'>(jpg, jpeg, png)</div>
            </div>
          </FileUploader>
        )}
      </div>
    </DialogContent>
  );
};

export default ImageUploadModal;
