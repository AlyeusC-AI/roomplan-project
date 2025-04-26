import { useState } from "react";
import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@components/ui/button";
import { userInfoStore } from "@atoms/user-info";
import RoomActions from "@components/Project/RoomActions";
import { roomStore } from "@atoms/room";
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

const PhotoGroup = ({
  photos,
  selectedPhotos,
  day,
  onPhotoClick,
  onSelectPhoto,
  setPhotos,
}: {
  photos: ImageQuery_Image[];
  selectedPhotos: ImageQuery_Image[];
  day: string;
  onPhotoClick: (key: string) => void;
  onSelectPhoto: (photo: ImageQuery_Image) => void;
  setPhotos: React.Dispatch<React.SetStateAction<ImageQuery_Image[]>>;
}) => {
  console.log("🚀 ~ phasdasdaotos:", photos);
  const [isOpen, setOpen] = useState(true);
  const user = userInfoStore();
  const rooms = roomStore();
  const { id } = useParams<{ id: string }>();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Check if this is a room group by looking at the first photo's room
  const isRoomGroup = user.user?.groupView === "roomView";
  const roomId = photos[0]?.Inference?.[0]?.Room?.publicId;
  const room = roomId
    ? rooms.rooms.find((r) => r.publicId === roomId)
    : rooms.rooms.find((r) => r.name === day);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = photos.findIndex((photo) => photo.key === active.id);
    const newIndex = photos.findIndex((photo) => photo.key === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newPhotos = arrayMove(photos, oldIndex, newIndex);

      // Update order in backend
      const orderUpdates = newPhotos.map((photo, idx) => ({
        publicId: photo.publicId,
        order: idx,
      }));

      try {
        const response = await fetch(`/api/v1/projects/${id}/images`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order: orderUpdates,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update image order");
        }

        const newPhotos = photos.map((photo) => {
          const updatedPhoto = orderUpdates.find(
            (update) => update.publicId === photo.publicId
          );
          return updatedPhoto ? { ...photo, order: updatedPhoto.order } : photo;
        });
        // Update local state
        setPhotos(newPhotos);
        // setPhotos((prevPhotos) =>
        //   prevPhotos.map((photo) => {
        //     const updatedPhoto = orderUpdates.find(
        //       (update) => update.publicId === photo.publicId
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

  const refetchData = async () => {
    try {
      // Refetch rooms
      const roomsRes = await fetch(`/api/v1/projects/${id}/room`);
      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        rooms.setRooms(roomsData.rooms);
      }

      // Refetch images
      const imagesRes = await fetch(`/api/v1/projects/${id}/images`);
      if (imagesRes.ok) {
        const imagesData = await imagesRes.json();
        setPhotos(imagesData.images);
      }
    } catch (error) {
      console.error("Error refetching data:", error);
    }
  };

  const renderPhotos = () => (
    <div
      className={clsx(
        "mt-4 flex",
        user.user?.photoView === "photoGridView" && "flex-wrap gap-x-3 gap-y-8",
        user.user?.photoView === "photoListView" && "flex-col"
      )}
    >
      {photos
        .sort((a, b) => a.order - b.order)
        .map((photo) => (
          <Photo
            isSelected={selectedPhotos.some((p) => p.key === photo.key)}
            key={photo.key}
            id={photo.key}
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
        <Button variant='outline' onClick={() => setOpen((o) => !o)}>
          {isOpen ? (
            <ChevronDown className='size-8' />
          ) : (
            <ChevronUp className='size-8' />
          )}
        </Button>
        <div className='ml-4 flex items-center gap-4'>
          <h2 className='text-xl font-bold'>{day}</h2>
          {isRoomGroup && room && (
            <RoomActions room={room} onSuccess={refetchData} />
          )}
        </div>
      </div>
      {isOpen &&
        (isRoomGroup ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={photos.map((photo) => photo.key)}
              strategy={rectSortingStrategy}
            >
              {renderPhotos()}
            </SortableContext>
          </DndContext>
        ) : (
          renderPhotos()
        ))}
    </div>
  );
};

export default PhotoGroup;
