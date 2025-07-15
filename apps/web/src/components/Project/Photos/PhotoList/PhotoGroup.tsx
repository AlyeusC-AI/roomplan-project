import { useEffect, useState } from "react";
import clsx from "clsx";
import { Check } from "lucide-react";
import { Button } from "@components/ui/button";
import RoomActionsModal from "@components/Project/rooms/RoomActionsModal";
import { useParams } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";

import Photo from "./Photo";
import { userPreferenceStore } from "@state/user-prefrence";
import {
  Image,
  useBulkUpdateImages,
  useGetRooms,
  useUpdateImagesOrder,
} from "@service-geek/api-client";

const PhotoGroup = ({
  photos,
  selectedPhotos,
  day,
  onPhotoClick,
  onSelectPhoto,
}: {
  photos: Image[];
  selectedPhotos: Image[];
  day: string;
  onPhotoClick: (key: string) => void;
  onSelectPhoto: (photo: Image, selectAllFromGroup?: Image[]) => void;
}) => {
  console.log("🚀 ~ phasdasdaotos:", photos);
  const { savedPhotoGroupBy, savedPhotoView } = userPreferenceStore();
  const { id } = useParams<{ id: string }>();
  const { data: rooms } = useGetRooms(id);
  const { mutate: updateImagesOrder } = useUpdateImagesOrder();
  const [images, setImages] = useState<Image[]>(photos);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);

  useEffect(() => {
    setImages(photos);
  }, [photos]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const room = rooms?.find((room) => room.name === day);
  // Check if this is a room group by looking at the first photo's room
  const isRoomGroup = savedPhotoGroupBy === "room";

  // Check if all photos in this group are selected
  const allPhotosSelected =
    photos.length > 0 &&
    photos.every((photo) =>
      selectedPhotos.some((selected) => selected.id === photo.id)
    );

  // Check if some photos in this group are selected
  const somePhotosSelected = photos.some((photo) =>
    selectedPhotos.some((selected) => selected.id === photo.id)
  );

  const handleSelectAll = () => {
    if (allPhotosSelected) {
      // Unselect all photos in this group
      photos.forEach((photo) => {
        const isSelected = selectedPhotos.some(
          (selected) => selected.id === photo.id
        );
        if (isSelected) {
          onSelectPhoto(photo);
        }
      });
    } else {
      // Select all photos in this group
      onSelectPhoto(photos[0], photos);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = photos.findIndex((photo) => photo.id === active.id);
    const newIndex = photos.findIndex((photo) => photo.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newPhotos = arrayMove(photos, oldIndex, newIndex);

      // Update order in backend
      const orderUpdates = newPhotos.map((photo, idx) => ({
        id: photo.id,
        order: idx,
      }));

      const newPhotosLocal = photos.map((photo) => {
        const updatedPhoto = orderUpdates.find(
          (update) => update.id === photo.id
        );
        return updatedPhoto ? { ...photo, order: updatedPhoto.order } : photo;
      });
      setImages(newPhotosLocal);

      try {
        updateImagesOrder(
          orderUpdates.map((update) => ({
            id: update.id,
            order: update.order,
          }))
        );

        // setPhotos((prevPhotos) =>
        //   prevPhotos.map((photo) => {
        //     const updatedPhoto = orderUpdates.find(
        //       (update) => update.id === photo.id
        //     );
        //     if (updatedPhoto) {
        //       return { ...photo, order: updatedPhoto.order };
        //     }
        //     return photo;
        //   })
        // );
      } catch (error) {
        console.error("Error updating image order:", error);
      }
    }
  };

  const renderPhotos = () => (
    <div
      className={clsx(
        "mt-4 flex",
        savedPhotoView === "photoGridView" && "flex-wrap gap-x-3 gap-y-8",
        savedPhotoView === "photoListView" && "flex-col"
      )}
    >
      {images
        .sort((a, b) => a.order - b.order)
        .map((photo) => (
          <Photo
            isSelected={selectedPhotos.some((p) => p.id === photo.id)}
            key={photo.id}
            id={photo.id}
            photo={photo}
            onPhotoClick={onPhotoClick}
            onSelectPhoto={onSelectPhoto}
            isDraggable={isRoomGroup}
          />
        ))}
      {photos.length === 0 && <p>There are no photos in this room</p>}
    </div>
  );

  return (
    <div key={day} className='mt-4'>
      <div className='flex items-center'>
        <Button
          variant='outline'
          onClick={handleSelectAll}
          className={clsx(
            "h-8 w-8 p-0",
            allPhotosSelected && "bg-primary text-primary-foreground",
            somePhotosSelected &&
              !allPhotosSelected &&
              "bg-primary/50 text-primary-foreground"
          )}
        >
          {allPhotosSelected && <Check className='size-4' />}
          {somePhotosSelected && !allPhotosSelected && (
            <div className='size-2 rounded-sm bg-primary-foreground' />
          )}
        </Button>
        <div className='ml-4 flex items-center gap-4'>
          <h2
            className={clsx(
              "text-xl font-bold",
              isRoomGroup &&
                room &&
                "cursor-pointer transition-colors hover:text-primary"
            )}
            onClick={() => {
              if (isRoomGroup && room) {
                setIsRoomModalOpen(true);
              }
            }}
          >
            {day}
          </h2>
        </div>
      </div>
      {isRoomGroup ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={photos.map((photo) => photo.id)}
            strategy={rectSortingStrategy}
          >
            {renderPhotos()}
          </SortableContext>
        </DndContext>
      ) : (
        renderPhotos()
      )}

      {isRoomGroup && room && (
        <RoomActionsModal
          isOpen={isRoomModalOpen}
          setOpen={setIsRoomModalOpen}
          room={room}
        />
      )}
    </div>
  );
};

export default PhotoGroup;
