import { useState } from "react";
import Typeography from "@components/DesignSystem/Typeography";
import { RoomData } from "@servicegeek/db/queries/project/getProjectDetections";

import MobileImage from "./MobileImage";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@components/ui/button";

const MobileRoomImageList = ({ room }: { room: RoomData }) => {
  const [isOpen, setIsOpen] = useState(true);
  const toggleRow = () => {
    setIsOpen((o) => !o);
  };
  return (
    <div key={room.publicId}>
      <div className='mt-8 flex items-center'>
        <Button onClick={toggleRow} className='mr-2'>
          {isOpen ? (
            <ChevronDown className='size-6 text-gray-800' />
          ) : (
            <ChevronUp className='size-6 text-gray-800' />
          )}
        </Button>
        <h2 className='text-xl font-bold'>{room.name}</h2>
      </div>
      {isOpen && (
        <div className='mt-2 flex flex-wrap'>
          {room.inferences.length === 0 && (
            <Typeography.Base className='ml-12 mt-2'>
              There are no photos of this room
            </Typeography.Base>
          )}
          {room.inferences.map((inference) => {
            if (!inference.imageKey) return null;
            return (
              <div key={inference.publicId} className='m-2'>
                <MobileImage
                  imageURL={inference.imageKey}
                  createdAt={inference.createdAt}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MobileRoomImageList;
