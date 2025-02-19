import { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { useParams } from "next/navigation";
import { roomStore } from "@atoms/room";
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

const RoomCreationModal = ({
  setOpen,
  isOpen,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
}) => {
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const rooms = roomStore();

  const { id } = useParams();

  const createRoom = async () => {
    try {
      setLoading(true);
      if (roomName.length < 3) {
        toast.error("Room name must be at least 3 characters");
        return;
      }

      const res = await fetch(`/api/v1/projects/${id}/room`, {
        method: "POST",
        body: JSON.stringify({ name: roomName }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const body = await res.json();

      if (!res.ok && body.reason === "existing-room") {
        toast.error("A room with this name already exists.");
        return;
      } else if (!res.ok) {
        toast.error("Failed to create room");
        return;
      }

      setRoomName("");
      setOpen(false);
      rooms.addRoom(body.room);
      // inferences.addInference({
      //   publicId: body.room.publicId,
      //   detections: [],
      //   inferences: [],
      //   name: body.room.name,
      // });
    } catch {
      toast.error("Failed to create room");
      return;
    }

    setLoading(false);
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
        {loading ? (
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
