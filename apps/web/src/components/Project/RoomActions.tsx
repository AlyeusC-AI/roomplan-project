import { useState } from "react";
import { Button } from "@components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import RoomEditModal from "./RoomEditModal";
import RoomDeleteModal from "./RoomDeleteModal";

interface RoomActionsProps {
  room: RoomWithReadings;
  onSuccess?: () => void;
}

const RoomActions = ({ room, onSuccess }: RoomActionsProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <>
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setIsEditModalOpen(true)}
          className='h-8 w-8'
        >
          <Edit2 className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setIsDeleteModalOpen(true)}
          className='h-8 w-8 text-destructive hover:text-destructive'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>

      <RoomEditModal
        isOpen={isEditModalOpen}
        setOpen={setIsEditModalOpen}
        room={room}
        onSuccess={onSuccess}
      />

      <RoomDeleteModal
        isOpen={isDeleteModalOpen}
        setOpen={setIsDeleteModalOpen}
        room={room}
        onSuccess={onSuccess}
      />
    </>
  );
};

export default RoomActions;
