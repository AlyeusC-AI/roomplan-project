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
import { useParams } from "next/navigation";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { useGetRooms, useCreateRoom } from "@service-geek/api-client";

const Readings = () => {
  const [roomName, setRoomName] = useState("");
  const { id } = useParams<{ id: string }>();
  const { mutate: createRoomMutation, isPending: isCreatingRoom } =
    useCreateRoom();
  const [showModal, setShowModal] = useState(false);

  const createRoom = async () => {
    try {
      if (roomName.length < 3) {
        toast.error("Room name must be at least 3 characters");
        return;
      }

      await createRoomMutation({ name: roomName, projectId: id });

      setRoomName("");
      setShowModal(false);
      // inferences.addInference({
      //   publicId: body.room.publicId,
      //   detections: [],
      //   inferences: [],
      //   name: body.room.name,
      // });
    } catch {
      return;
    }
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
        <Separator className='dark:bg-gray-700' />
        {isCreatingRoom ? <LoadingPlaceholder /> : <ReadingsTable />}
      </div>
      <DialogContent className='dark:bg-gray-900 sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='dark:text-white'>Create A Room</DialogTitle>
          <DialogDescription className='dark:text-gray-400'>
            Add a new room to your project to start recording readings.
          </DialogDescription>
        </DialogHeader>
        {isCreatingRoom ? (
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
                  className='col-span-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
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
