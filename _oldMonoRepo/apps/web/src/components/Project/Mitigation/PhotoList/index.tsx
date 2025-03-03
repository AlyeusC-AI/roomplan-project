import React, { useEffect, useState } from "react";
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
import { roomStore } from "@atoms/room";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { userInfoStore } from "@atoms/user-info";
import { teamMembersStore } from "@atoms/team-members";
import { Trash2, FolderInput, X, Loader2 } from "lucide-react";

const PhotoList = ({
  photos,
  setPhotos,
}: {
  photos?: ImageQuery_Image[];
  setPhotos: React.Dispatch<React.SetStateAction<ImageQuery_Image[]>>;
}) => {
  const { id } = useParams<{ id: string }>();
  const [theaterModeIndex, setTheaterModeIndex] = useState(0);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isRoomReassignOpen, setIsRoomReassignOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAssigningRoom, setIsAssigningRoom] = useState(false);
  const { rooms, onlySelected } = useFilterParams();
  const roomList = roomStore((state) => state.rooms);
  const user = userInfoStore();

  const [selectedPhotos, setSelectedPhotos] = useState<ImageQuery_Image[]>([]);

  const fetchImages = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${id}/images`);
      const data = await response.json();
      if (response.ok) {
        setPhotos(data.images);
      } else {
        throw new Error(data.message || "Failed to fetch images");
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to refresh images");
    }
  };

  const onPhotoClick = (key: string) => {
    const photoIndex = photos?.findIndex((p) => p.key === key);
    if (photoIndex !== undefined && photoIndex >= 0) {
      setTheaterModeIndex(photoIndex);
      setIsTheaterMode(true);
    }
  };

  useEffect(() => {
    console.log("fetching team members");
    fetch("/api/v1/organization/members")
      .then((res) => res.json())
      .then((data) => {
        console.log("team members", data);
        teamMembersStore.getState().setTeamMembers(data.members);
        console.log(data);
      });
  }, []);

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

  let grouped: Record<string, ImageQuery_Image[]> = {};
  if (user.user?.groupView === "dateView") {
    grouped = photos.reduce((prev, photo) => {
      const day = format(new Date(photo.createdAt), "eee, MMM d, yyyy");
      return {
        ...prev,
        [day]: [...(prev[day] ? prev[day] : []), photo],
      };
    }, {});
  } else {
    grouped = photos.reduce((prev, photo) => {
      const room =
        photo.Inference.find((_, i) => i === 0)?.Room?.name || "Unknown room";
      return {
        ...prev,
        [room]: [...(prev[room] ? prev[room] : []), photo],
      };
    }, {});
    if (!rooms) {
      for (let i = 0; i < roomList.length; i++) {
        if (!grouped[roomList[i].name]) {
          grouped[roomList[i].name] = [];
        }
      }
    }
  }

  const onSelectPhoto = (photo: ImageQuery_Image) => {
    const photoIndex = selectedPhotos.findIndex((p) => p.key === photo.key);
    if (photoIndex === undefined || photoIndex === -1) {
      setSelectedPhotos([...selectedPhotos, photo]);
      return;
    } else if (photoIndex >= 0) {
      setSelectedPhotos((prev) =>
        produce(prev, (draft) => {
          const prevIndex = prev.findIndex((p) => p.key === photo.key);
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
      const photoIds = selectedPhotos
        .map((p) => p.publicId)
        .filter((p) => photos.some((o) => o.publicId === p));

      const response = await fetch(`/api/v1/projects/${id}/images`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ photoIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete images");
      }

      toast.success("Images deleted successfully");
      await fetchImages();
    } catch (error) {
      console.error("Error deleting images:", error);
      toast.error("Failed to delete images");
    } finally {
      setIsDeleting(false);
      setSelectedPhotos([]);
    }
  };

  const onUpdateRoom = async (roomId: string) => {
    try {
      setIsAssigningRoom(true);
      const photoKeys = selectedPhotos
        .map((p) => p.key)
        .filter((p) => photos.some((o) => o.key === p));

      const response = await fetch(`/api/v1/projects/${id}/images/room`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ photoKeys, roomId }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign room");
      }

      toast.success("Room assigned successfully");
      await fetchImages();
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
              setPhotos={setPhotos}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default PhotoList;
