import { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { Label } from "@components/ui/label";
import { useCreateRoom } from "@service-geek/api-client";

const RoomCreationModal = ({
  setOpen,
  isOpen,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
}) => {
  const [roomName, setRoomName] = useState("");
  const { id } = useParams();
  const createRoomMutation = useCreateRoom();

  const createRoom = async () => {
    if (roomName.length < 3) {
      toast.error("Room name must be at least 3 characters");
      return;
    }

    try {
      const result = await createRoomMutation.mutateAsync({
        name: roomName,
        projectId: id as string,
      });

      setRoomName("");
      setOpen(false);
      toast.success("Room created successfully");
    } catch (error: any) {
      // if (error?.response?.data?.reason === "existing-room") {
      //   toast.error("A room with this name already exists.");
      // } else {
      //   toast.error("Failed to create room");
      // }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => setOpen(false)}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Create A Room</DialogTitle>
          <DialogDescription>
            Add a new room to your project to start recording readings.
          </DialogDescription>
        </DialogHeader>
        {createRoomMutation.isPending ? (
          <LoadingPlaceholder />
        ) : (
          <>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='name' className='text-right'>
                  Name
                </Label>
                <Input
                  id='name'
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className='col-span-3'
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createRoom}>Create Room</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RoomCreationModal;
