import { useState } from "react";
import clsx from "clsx";

import Photo from "./Photo";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@components/ui/button";
import { userInfoStore } from "@atoms/user-info";

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

  return (
    <div key={day} className='mt-4'>
      <div className='flex'>
        <Button variant='outline' onClick={() => setOpen((o) => !o)}>
          {isOpen ? (
            <ChevronDown className='size-8' />
          ) : (
            <ChevronUp className='size-8' />
          )}
        </Button>
        <h2 className='ml-4 text-xl font-bold'>{day}</h2>
      </div>
      {isOpen && (
        <div
          key={day}
          className={clsx(
            "mt-4 flex",
            user.user?.photoView === "photoGridView" &&
              "flex-wrap gap-x-4 gap-y-8",
            user.user?.photoView === "photoListView" && "flex-col"
          )}
        >
          {photos.map((photo) => (
            <Photo
              selectedPhotos={selectedPhotos}
              key={photo.publicId}
              photo={photo}
              onPhotoClick={onPhotoClick}
              onSelectPhoto={onSelectPhoto}
              setPhotos={setPhotos}
            />
          ))}
          {photos.length === 0 && <p>There are no photos in this room</p>}
        </div>
      )}
    </div>
  );
};

export default PhotoGroup;
