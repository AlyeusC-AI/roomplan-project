import React, { useState } from "react";
import EmptyState from "@components/DesignSystem/EmptyState";
import useFilterParams from "@utils/hooks/useFilterParams";
import { format } from "date-fns";
import produce from "immer";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import PhotoGroup from "./PhotoGroup";
import RoomReassignModal from "./RoomReassignModal";
import TheaterMode from "./TheaterMode";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { Button } from "@components/ui/button";

import { Trash2, FolderInput, X, Loader2, Star } from "lucide-react";
import {
  Image,
  useBulkUpdateImages,
  useGetRooms,
  useBulkRemoveImages,
} from "@service-geek/api-client";
import { userPreferenceStore } from "@state/user-prefrence";

const PhotoList = ({ photos }: { photos?: Image[] }) => {
  const { id } = useParams<{ id: string }>();
  const [theaterModeIndex, setTheaterModeIndex] = useState(0);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isRoomReassignOpen, setIsRoomReassignOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAssigningRoom, setIsAssigningRoom] = useState(false);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const { rooms, onlySelected } = useFilterParams();
  const [selectedPhotos, setSelectedPhotos] = useState<Image[]>([]);
  const { mutate: bulkUpdateImages } = useBulkUpdateImages();
  const { mutate: bulkRemoveImages } = useBulkRemoveImages();
  const savedPhotoGroupBy = userPreferenceStore(
    (state) => state.savedPhotoGroupBy
  );
  const { data: roomsData } = useGetRooms(id);

  const includeAllInReport = async () => {
    // if (!photos) return;

    try {
      setIsUpdatingAll(true);
      bulkUpdateImages({
        projectId: id,
        filters: {
          // ids: photos.map((img) => img.id),
        },
        updates: {
          showInReport: true,
        },
      });

      toast.success("All images included in report");
    } catch (error) {
      console.log("🚀 ~ includeAllInReport ~ error:", error);
      // toast.error("Failed to update images");
    } finally {
      setIsUpdatingAll(false);
    }
  };

  const onPhotoClick = (key: string) => {
    const photoIndex = photos?.findIndex((p) => p.id === key);
    if (photoIndex !== undefined && photoIndex >= 0) {
      setTheaterModeIndex(photoIndex);
      setIsTheaterMode(true);
    }
  };

  if (!photos) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <LoadingPlaceholder />
      </div>
    );
  }

  if (photos.length === 0 && (rooms || onlySelected)) {
    return (
      <div className='flex size-full min-h-[400px] items-center justify-center rounded-lg bg-gray-50'>
        <EmptyState
          title='No photos match your filter criteria'
          imagePath='/images/void.svg'
          description='Try removing a few options'
          height={1038}
          width={995}
        />
      </div>
    );
  }

  let grouped: Record<string, Image[]> = {};
  if (savedPhotoGroupBy === "date") {
    grouped = photos.reduce(
      (prev, photo) => {
        const day = format(new Date(photo.createdAt), "eee, MMM d, yyyy");
        return {
          ...prev,
          [day]: [...(prev[day] || []), photo],
        };
      },
      {} as Record<string, Image[]>
    );
  } else {
    grouped =
      roomsData?.reduce((prev, room) => {
        const images = photos.filter((photo) => photo.roomId === room.id);

        return {
          ...prev,
          [room.name]: images,
        };
      }, {}) || {};
  }

  const onSelectPhoto = (photo: Image) => {
    const photoIndex = selectedPhotos.findIndex((p) => p.id === photo.id);
    if (photoIndex === undefined || photoIndex === -1) {
      setSelectedPhotos([...selectedPhotos, photo]);
      return;
    } else if (photoIndex >= 0) {
      setSelectedPhotos((prev) =>
        produce(prev, (draft) => {
          const prevIndex = prev.findIndex((p) => p.id === photo.id);
          if (prevIndex >= 0) {
            draft.splice(prevIndex, 1);
          }
        })
      );
    }
  };

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      await bulkRemoveImages({
        projectId: id,
        filters: {
          ids: selectedPhotos.map((p) => p.id),
        },
      });

      toast.success("Images deleted successfully");
      setSelectedPhotos([]);
    } catch (error) {
      console.error("Error deleting images:", error);
      // toast.error("Failed to delete images");
    } finally {
      setIsDeleting(false);
    }
  };

  const onUpdateRoom = async (roomId: string) => {
    try {
      setIsAssigningRoom(true);

      await bulkUpdateImages({
        projectId: id,
        filters: {
          ids: selectedPhotos.map((p) => p.id),
        },
        updates: { roomId },
      });

      toast.success("Room assigned successfully");
    } catch (error) {
      console.error("Error assigning room:", error);
      toast.error("Failed to assign room");
    } finally {
      setIsAssigningRoom(false);
      setSelectedPhotos([]);
      setIsRoomReassignOpen(false);
    }
  };

  return (
    <div className='mt-4 flex flex-col gap-6'>
      <div className='flex justify-end'>
        <Button
          size='sm'
          variant='outline'
          onClick={includeAllInReport}
          disabled={isUpdatingAll || !photos?.length}
          className='flex items-center gap-2'
        >
          {isUpdatingAll ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Star className='h-4 w-4' />
          )}
          Include All in Report
        </Button>
      </div>

      <AnimatePresence>
        {selectedPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='fixed right-4 top-4 z-50 rounded-lg border border-gray-200 bg-white p-4 shadow-lg'
          >
            <div className='flex items-center gap-4'>
              <span className='text-sm font-medium text-gray-700'>
                {selectedPhotos.length} photo
                {selectedPhotos.length > 1 ? "s" : ""} selected
              </span>
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => setIsRoomReassignOpen(true)}
                  disabled={isAssigningRoom}
                  className='flex items-center gap-2'
                >
                  {isAssigningRoom ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <FolderInput className='h-4 w-4' />
                  )}
                  Assign Room
                </Button>
                <Button
                  size='sm'
                  variant='destructive'
                  onClick={onDelete}
                  disabled={isDeleting}
                  className='flex items-center gap-2'
                >
                  {isDeleting ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <Trash2 className='h-4 w-4' />
                  )}
                  Delete
                </Button>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => setSelectedPhotos([])}
                  disabled={isDeleting || isAssigningRoom}
                  className='flex items-center'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RoomReassignModal
        open={isRoomReassignOpen}
        setOpen={setIsRoomReassignOpen}
        onReassign={onUpdateRoom}
        loading={isAssigningRoom}
      />

      {isTheaterMode && (
        <TheaterMode
          open={isTheaterMode}
          setOpen={setIsTheaterMode}
          photos={photos}
          theaterModeIndex={theaterModeIndex}
          setTheaterModeIndex={setTheaterModeIndex}
        />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='grid gap-8'
      >
        {Object.keys(grouped).map((day) => (
          <motion.div
            key={day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PhotoGroup
              day={day}
              photos={grouped[day]}
              onPhotoClick={onPhotoClick}
              onSelectPhoto={onSelectPhoto}
              selectedPhotos={selectedPhotos}
              // setPhotos={setPhotos}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default PhotoList;
