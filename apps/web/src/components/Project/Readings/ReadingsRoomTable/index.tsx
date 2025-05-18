import { useState } from "react";
import useAmplitudeTrack from "@utils/hooks/useAmplitudeTrack";
import { event } from "nextjs-google-analytics";
import { ChevronDown, ChevronRight, Pencil, Trash } from "lucide-react";
import {
  Room,
  useCreateRoomReading,
  useDeleteRoom,
  useUpdateRoom,
} from "@service-geek/api-client";
import Readings from "./Readings";
import { useParams } from "next/navigation";
import { Button } from "@components/ui/button";
import { LoadingSpinner } from "@components/ui/spinner";
import { Input } from "@components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@components/ui/dialog";
import { v4 } from "uuid";

const MitigationRoomTable = ({ room }: { room: Room }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const { track } = useAmplitudeTrack();
  const [internalRoomName, setInternalRoomName] = useState(room.name);
  const [isCreating, setIsCreating] = useState(false);
  const { mutate: updateRoom } = useUpdateRoom();
  const { mutate: deleteRoomMutation } = useDeleteRoom();
  const { mutate: createRoomReading } = useCreateRoomReading();
  const { id } = useParams<{ id: string }>();

  const updateRoomName = async () => {
    if (internalRoomName === "" || internalRoomName.trim() === "") return;
    setIsSaving(true);
    track("Update Room Name");

    try {
      await updateRoom({
        id: room.id,
        data: {
          name: internalRoomName,
        },
      });

      setIsSaving(false);
      setIsEditingTitle(false);

      toast.success("Room name updated");
    } catch (error) {
      // toast.error("Failed to update room name");
      console.log(error);
    }

    setIsSaving(false);
  };

  const deleteRoom = async () => {
    event("delete_room", {
      category: "Estimate Page",
    });
    setIsDeleting(true);
    track("Delete Room");
    try {
      await deleteRoomMutation(room.id);
      toast.success("Room deleted");
    } catch (error) {
      // toast.error("Failed to delete room");
      console.log(error);
    }
    setIsDeleting(false);
    setIsConfirmingDelete(false);
  };

  const addReading = async () => {
    setIsCreating(true);
    track("Add Room Reading");
    try {
      await createRoomReading({
        roomId: room.id,
        date: new Date(),
        humidity: 0,
        temperature: 0,
        equipmentUsed: [],
      });
      toast.success("Reading added successfully");

      // setIsCreating(false);
    } catch (error) {
      console.log("🚀 ~ addReading ~ error:", error);
      // toast.error("Failed to add reading");
    }
    setIsCreating(false);
  };

  return (
    <div className='rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800'>
      <div className='flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900'>
        <div className='flex items-center space-x-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setIsExpanded(!isExpanded)}
            className='h-8 w-8'
          >
            {isExpanded ? (
              <ChevronDown className='h-4 w-4' />
            ) : (
              <ChevronRight className='h-4 w-4' />
            )}
          </Button>
          <div className='flex items-center'>
            {isEditingTitle ? (
              <>
                <Input
                  value={internalRoomName}
                  onChange={(e) => setInternalRoomName(e.target.value)}
                  disabled={isSaving}
                  className='h-8 w-48 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
                />
                <Button
                  onClick={() => setIsEditingTitle(false)}
                  className='ml-2 h-8'
                  variant='outline'
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => updateRoomName()}
                  className='ml-2 h-8'
                  disabled={isSaving}
                >
                  {isSaving ? <LoadingSpinner /> : "Save"}
                </Button>
              </>
            ) : (
              <>
                <h1 className='text-lg font-semibold dark:text-white'>
                  {room.name}
                </h1>
                <Button
                  variant='ghost'
                  onClick={() => setIsEditingTitle(true)}
                  className='ml-2 h-8 w-8 p-0'
                >
                  <Pencil className='h-4 w-4' />
                </Button>
              </>
            )}
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            disabled={isCreating}
            onClick={() => addReading()}
            className='h-8'
          >
            {isCreating ? <LoadingSpinner /> : "Add Reading"}
          </Button>
          <Button
            onClick={() => setIsConfirmingDelete(true)}
            variant='destructive'
            className='h-8 w-8 p-0'
          >
            <Trash className='h-4 w-4' />
          </Button>
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isExpanded ? "opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className='p-4'>
          <Readings room={room} />
        </div>
      </div>
      <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <DialogContent className='dark:bg-gray-800'>
          <DialogHeader className='dark:text-white'>Delete Room</DialogHeader>
          <DialogDescription className='dark:text-gray-400'>
            Permanently delete this room and everything associated within it
          </DialogDescription>
          <div className='flex items-center justify-end space-x-4'>
            <Button
              variant='outline'
              onClick={() => setIsConfirmingDelete(false)}
            >
              Cancel
            </Button>
            <Button onClick={deleteRoom} variant='destructive'>
              {isDeleting ? <LoadingSpinner /> : "Yes, delete the room."}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MitigationRoomTable;
