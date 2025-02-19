"use client";

import { useState } from "react";

import RoomCreationModal from "../RoomCreationModal";
import { Button } from "@components/ui/button";

export default function NotesToolbar() {
  const [isRoomCreationModalOpen, setIsRoomCreationModalOpen] = useState(false);

  return (
    <>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-medium'>Notes</h3>
          <p className='text-sm text-muted-foreground'>
            Record notes for each room.
          </p>
        </div>
        <Button
          variant='outline'
          onClick={() => setIsRoomCreationModalOpen(true)}
        >
          Add Room
        </Button>
      </div>

      <RoomCreationModal
        setOpen={setIsRoomCreationModalOpen}
        isOpen={isRoomCreationModalOpen}
      />
    </>
  );
}
