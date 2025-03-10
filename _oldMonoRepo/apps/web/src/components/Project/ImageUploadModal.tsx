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
import { ArrowDownToLine, Plus } from "lucide-react";
import { Button } from "@components/ui/button";
import { roomStore } from "@atoms/room";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import RoomCreationModal from "./RoomCreationModal";
import { urlMapStore } from "@atoms/url-map";
import { imagesStore } from "@atoms/images";

const ImageUploadModal = ({
  onChange,
  isUploading,
  onClick,
  onDrop,
  setOpen,
  directImageUpload = false,
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
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const { track } = useAmplitudeTrack();
  const [activeTab, setActiveTab] = useState<"direct" | "room">("direct");
  const { id } = useParams<{ id: string }>();
  const urlMap = urlMapStore();
  const { setImages } = imagesStore();

  const roomNames = useMemo(
    () => rooms.rooms.map((room) => room.name),
    [rooms.rooms]
  );

  const refreshData = async () => {
    try {
      // Fetch rooms
      const roomsRes = await fetch(`/api/v1/projects/${id}/room`);
      const roomsData = await roomsRes.json();
      rooms.setRooms(roomsData.rooms);

      // Fetch images
      const imagesRes = await fetch(`/api/v1/projects/${id}/images`);
      const imagesData = await imagesRes.json();
      setImages(imagesData.images);
      urlMap.setUrlMap(imagesData.urlMap);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const handleFileDrop = async (files: FileList) => {
    try {
      if (activeTab === "direct") {
        await onDrop(files, UNKNOWN_ROOM);

        await refreshData();
        setOpen(false);
      } else {
        if (!value) {
          toast.error("Please select a room first");
          return;
        }
        await onDrop(files, value);

        await refreshData();
        setOpen(false);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload files");
    }
  };

  return (
    <>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>
            Upload Images
          </DialogTitle>
          <DialogDescription>
            Drag and drop your images or click to browse. You can upload
            directly or organize them into rooms.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue='direct'
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "direct" | "room")}
          className='mt-4'
        >
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='direct'>Direct Upload</TabsTrigger>
            <TabsTrigger value='room'>Upload to Room</TabsTrigger>
          </TabsList>

          <TabsContent value='direct' className='mt-4'>
            <FileUploader
              handleChange={handleFileDrop}
              name='file'
              types={["jpg", "jpeg", "png"]}
              multiple
              classes={cn(
                "border-2 rounded-lg cursor-pointer border-dashed border-primary/40 hover:border-primary transition-colors",
                "!h-48 !flex !items-center !justify-center bg-muted/30"
              )}
            >
              <div className='flex flex-col items-center justify-center text-muted-foreground'>
                <ArrowDownToLine className='mb-4 size-10' />
                <p className='text-sm font-medium'>Select or drop files here</p>
                <p className='mt-1 text-xs'>(jpg, jpeg, png)</p>
              </div>
            </FileUploader>
          </TabsContent>

          <TabsContent value='room' className='mt-4 space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <h4 className='text-sm font-medium'>Select Room</h4>
                <p className='text-xs text-muted-foreground'>
                  Choose an existing room or create a new one
                </p>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsRoomModalOpen(true)}
              >
                <Plus className='mr-1 size-4' />
                New Room
              </Button>
            </div>

            <select
              id='selectRoom'
              name='selectRoom'
              className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring'
              value={internalValue}
              onChange={(e) => {
                const inference = rooms.rooms.find(
                  (i) => i.name === e.target.value
                );
                if (inference) {
                  setValue(inference?.publicId);
                  setInternalValue(e.target.value);
                }
              }}
            >
              <option value='' disabled>
                Select a room
              </option>
              {rooms.rooms.map((room) => (
                <option key={room.name} value={room.name}>
                  {room.name}
                </option>
              ))}
            </select>

            <FileUploader
              disabled={!internalValue}
              handleChange={handleFileDrop}
              name='file'
              types={["jpg", "jpeg", "png"]}
              multiple
              classes={cn(
                "border-2 rounded-lg cursor-pointer border-dashed transition-colors",
                "!h-48 !flex !items-center !justify-center",
                !internalValue
                  ? "border-muted bg-muted/10 !cursor-not-allowed"
                  : "border-primary/40 hover:border-primary bg-muted/30"
              )}
            >
              <div
                className={cn(
                  "flex flex-col items-center justify-center",
                  !internalValue ? "text-muted" : "text-muted-foreground"
                )}
              >
                <ArrowDownToLine className='mb-4 size-10' />
                <p className='text-sm font-medium'>
                  {!internalValue
                    ? "Select a room first"
                    : "Select or drop files here"}
                </p>
                <p className='mt-1 text-xs'>(jpg, jpeg, png)</p>
              </div>
            </FileUploader>
          </TabsContent>
        </Tabs>
      </DialogContent>

      <RoomCreationModal
        isOpen={isRoomModalOpen}
        setOpen={setIsRoomModalOpen}
      />
    </>
  );
};

export default ImageUploadModal;
