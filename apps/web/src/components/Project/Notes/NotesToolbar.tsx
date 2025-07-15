"use client";

import { useState } from "react";

import RoomCreationModal from "../rooms/RoomCreationModal";
import { Button } from "@components/ui/button";
import { PlusCircle } from "lucide-react";
import { Separator } from "@components/ui/separator";

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
          // variant='outline'
          onClick={() => setIsRoomCreationModalOpen(true)}
        >
          <PlusCircle />
          Add Room
        </Button>
      </div>
      <Separator className='dark:bg-gray-700' />
      <RoomCreationModal
        setOpen={setIsRoomCreationModalOpen}
        isOpen={isRoomCreationModalOpen}
      />
    </>
  );
}
