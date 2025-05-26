import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { UNKNOWN_ROOM } from "@lib/image-processing/constants";
import { useParams } from "next/navigation";
import { ArrowDownToLine, Plus, Loader2 } from "lucide-react";
import { Button } from "@components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import RoomCreationModal from "../rooms/RoomCreationModal";
import {
  useGetRooms,
  useAddImage,
  useSearchImages,
} from "@service-geek/api-client";
import { uploadImage } from "@service-geek/api-client";

interface ImageUploadModalProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const ImageUploadModal = ({ setOpen }: ImageUploadModalProps) => {
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"direct" | "room">("direct");
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  // React Query hooks
  const { data: rooms = [] } = useGetRooms(id);
  const addImageMutation = useAddImage();
  const { refetch: refetchImages } = useSearchImages(
    id,
    {
      type: "ROOM",
    },
    { field: "createdAt", direction: "desc" },
    { page: 1, limit: 20 }
  );

  const roomNames = useMemo(() => rooms.map((room) => room.name), [rooms]);

  const handleFileDrop = async (files: FileList) => {
    setLoading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Upload to ImageKit
        const imageKitResponse = await uploadImage(file, {
          folder: `projects/${id}`,
          useUniqueFileName: true,
        });

        // Add image to room
        await addImageMutation.mutateAsync({
          data: {
            url: imageKitResponse.url,
            projectId: id,
            showInReport: false,
            order: 0,
            roomId: activeTab === "direct" ? undefined : selectedRoomId,
          },
        });
      });

      await Promise.all(uploadPromises);
      await refetchImages();
      toast.success("Images uploaded successfully");
      setOpen(false);
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload files");
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (roomName: string) => {
    const room = rooms.find((r) => r.name === roomName);
    if (room) {
      setSelectedRoomId(room.id);
      setSelectedRoom(roomName);
    }
  };

  const FileUploaderComponent = ({
    disabled = false,
  }: {
    disabled?: boolean;
  }) => (
    <FileUploader
      disabled={disabled || loading}
      handleChange={handleFileDrop}
      name='file'
      types={["jpg", "jpeg", "png"]}
      multiple
      classes={cn(
        "border-2 rounded-lg cursor-pointer border-dashed transition-colors",
        "!h-48 !flex !items-center !justify-center",
        disabled || loading
          ? "border-muted bg-muted/10 !cursor-not-allowed"
          : "border-primary/40 hover:border-primary bg-muted/30"
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center justify-center",
          disabled || loading ? "text-muted" : "text-muted-foreground"
        )}
      >
        {loading ? (
          <>
            <Loader2 className='mb-4 size-10 animate-spin' />
            <p className='text-sm font-medium'>Uploading images...</p>
          </>
        ) : (
          <>
            <ArrowDownToLine className='mb-4 size-10' />
            <p className='text-sm font-medium'>
              {disabled ? "Select a room first" : "Select or drop files here"}
            </p>
            <p className='mt-1 text-xs'>(jpg, jpeg, png)</p>
          </>
        )}
      </div>
    </FileUploader>
  );

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
            <TabsTrigger value='direct' disabled={loading}>
              Direct Upload
            </TabsTrigger>
            <TabsTrigger value='room' disabled={loading}>
              Upload to Room
            </TabsTrigger>
          </TabsList>

          <TabsContent value='direct' className='mt-4'>
            <FileUploaderComponent />
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
                disabled={loading}
              >
                <Plus className='mr-1 size-4' />
                New Room
              </Button>
            </div>

            <select
              id='selectRoom'
              name='selectRoom'
              className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring'
              value={selectedRoom}
              onChange={(e) => handleRoomSelect(e.target.value)}
              disabled={loading}
            >
              <option value='' disabled>
                Select a room
              </option>
              {rooms.map((room) => (
                <option key={room.name} value={room.name}>
                  {room.name}
                </option>
              ))}
            </select>

            <FileUploaderComponent disabled={!selectedRoom} />
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
