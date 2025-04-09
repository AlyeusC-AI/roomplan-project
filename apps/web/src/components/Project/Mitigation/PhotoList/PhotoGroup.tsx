import { useState } from "react";
import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@components/ui/button";
import { userInfoStore } from "@atoms/user-info";
import RoomActions from "@components/Project/RoomActions";
import { roomStore } from "@atoms/room";
import { useParams } from "next/navigation";

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
  const [isOpen, setOpen] = useState(true);
  const user = userInfoStore();
  const rooms = roomStore();
  const { id } = useParams<{ id: string }>();

  // Check if this is a room group by looking at the first photo's room
  const isRoomGroup = user.user?.groupView === "roomView";
  const roomId = photos[0]?.Inference?.[0]?.Room?.publicId;
  const room = roomId
    ? rooms.rooms.find((r) => r.publicId === roomId)
    : rooms.rooms.find((r) => r.name === day);

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
      {isOpen && (
        <div
          key={day}
          className={clsx(
            "mt-4 flex",
            user.user?.photoView === "photoGridView" &&
              "flex-wrap gap-x-3 gap-y-8",
            user.user?.photoView === "photoListView" && "flex-col"
          )}
        >
          {photos.map((photo) => (
            <Photo
              isSelected={selectedPhotos.some((p) => p.key === photo.key)}
              key={photo.publicId}
              photo={photo}
              onPhotoClick={onPhotoClick}
              onSelectPhoto={onSelectPhoto}
            />
          ))}
          {photos.length === 0 && <p>There are no photos in this room</p>}
        </div>
      )}
    </div>
  );
};

export default PhotoGroup;
