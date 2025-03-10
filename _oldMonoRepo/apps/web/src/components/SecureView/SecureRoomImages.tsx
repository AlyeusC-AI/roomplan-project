"use client";

import { useState } from "react";
import Typeography from "@components/DesignSystem/Typeography";

import SecureImage from "./SecureImage";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Button } from "@components/ui/button";

const SecureRoomImages = ({ roomData }: { roomData: RoomWithReadings }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div>
        <div className='flex flex-row items-center'>
          <Button onClick={() => setIsOpen(!isOpen)} className='mr-2'>
            {isOpen ? (
              <ChevronDownIcon className='size-6 text-gray-800' />
            ) : (
              <ChevronUpIcon className='size-6 text-gray-800' />
            )}
          </Button>
          <h3 className='py-4 text-2xl font-semibold'>{roomData.name}</h3>
        </div>
        {isOpen && (
          <div className='flex flex-wrap gap-4'>
            {roomData.Inference.length === 0 && (
              <div className='flex w-full items-center justify-center p-6'>
                <Typeography.H6>
                  There are no images of this room.
                </Typeography.H6>
              </div>
            )}
            {roomData.Inference.map((inference) => (
              <SecureImage path={inference.imageKey} key={inference.imageKey} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecureRoomImages;
