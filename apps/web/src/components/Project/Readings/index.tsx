import { Separator } from "@components/ui/separator";
import ReadingsTable from "./ReadingsTable";
import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { roomStore } from "@atoms/room";
import { useParams } from "next/navigation";
import { LoadingPlaceholder } from "@components/ui/spinner";

const Readings = () => {
  const [roomName, setRoomName] = useState("");
  const rooms = roomStore();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { id } = useParams<{ id: string }>();

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
      setShowModal(false);
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
    <Dialog open={showModal} onOpenChange={() => setShowModal(false)}>
      <div className='space-y-6'>
        <div className='flex justify-between'>
          <div>
            <h3 className='text-lg font-medium dark:text-white'>Readings</h3>
            <p className='text-sm text-muted-foreground dark:text-gray-400'>
              Record humidity, gpp, and temperature readings from each room
              within the job site.
            </p>
          </div>
          <Button onClick={() => setShowModal(true)}>Add Room</Button>
        </div>
        <Separator className="dark:bg-gray-700" />
        {loading ? <LoadingPlaceholder /> : <ReadingsTable />}
      </div>
      <DialogContent className='sm:max-w-[425px] dark:bg-gray-900'>
        <DialogHeader>
          <DialogTitle className="dark:text-white">Create A Room</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Add a new room to your project to start recording readings.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <LoadingPlaceholder />
        ) : (
          <>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='name' className='text-right dark:text-white'>
                  Name
                </Label>
                <Input
                  id='name'
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className='col-span-3 dark:bg-gray-800 dark:text-white dark:border-gray-700'
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

export default Readings;
