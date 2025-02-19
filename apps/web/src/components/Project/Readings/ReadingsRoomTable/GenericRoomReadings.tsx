import { useState } from "react";
import useAmplitudeTrack from "@utils/hooks/useAmplitudeTrack";
import { Button } from "@components/ui/button";
import { useParams } from "next/navigation";
import { LoadingSpinner } from "@components/ui/spinner";
import { toast } from "sonner";
import { roomStore } from "@atoms/room";
import { v4 } from "uuid";
import { Database } from "@/types/database";
import GenericReadingCell from "./generic-reading-cell";

const GenericRoomReadings = ({
  room,
  reading,
}: {
  room: RoomWithReadings;
  reading: ReadingsWithGenericReadings;
}) => {
  const [isCreatingGeneric, setIsCreatingGeneric] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const { track } = useAmplitudeTrack();
  const { id } = useParams<{ id: string }>();
  const rooms = roomStore((state) => state);

  // const removeReading = trpc.readings.deleteReading.useMutation({
  //   async onSettled() {
  //     await trpcContext.readings.getAll.invalidate();
  //     setIsDeletingReading(false);
  //   },
  // });

  // const addGenericReading = trpc.readings.addGenericReading.useMutation({
  //   async onSettled() {
  //     await trpcContext.readings.getAll.invalidate();
  //     setIsCreatingGeneric(false);
  //   },
  // });

  // const deleteGenericReading = trpc.readings.deleteGenericReading.useMutation({
  //   async onSettled() {
  //     await trpcContext.readings.getAll.invalidate();
  //     setDeletingId("");
  //   },
  // });

  // const updateGenericReading = trpc.readings.updateGenericReading.useMutation({
  //   onSettled() {
  //     trpcContext.readings.getAll.invalidate();
  //   },
  // });

  const onCreateGenericReading = async () => {
    setIsCreatingGeneric(true);
    track("Add Generic Room Reading");
    try {
      const res = await fetch(`/api/v1/projects/${id}/readings`, {
        method: "POST",
        body: JSON.stringify({
          type: "generic",
          data: {
            publicId: v4(),
            roomReadingId: reading.id,
            type: "dehumidifer",
            value: "",
          } satisfies Database["public"]["Tables"]["GenericRoomReading"]["Insert"],
        }),
      });

      const json = await res.json();

      rooms.addGenericReading(room.publicId, json.reading);
      toast.success("Dehumidifier reading added");
    } catch {
      toast.error("Failed to add dehumidifier reading");
    }
    setIsCreatingGeneric(false);
    // await addGenericReading.mutateAsync({
    //   projectPublicId: id,
    //   roomPublicId: room.publicId,
    //   readingPublicId: reading.publicId,
    //   type: RoomReadingType.dehumidifer,
    // });
  };

  const onDelete = async (
    genericRoomReadingId: string,
    type: "generic" | "standard"
  ) => {
    setDeletingId(genericRoomReadingId);
    track("Delete Generic Room Reading");
    try {
      await fetch(`/api/v1/projects/${id}/readings`, {
        method: "DELETE",
        body: JSON.stringify({
          type,
          readingId: genericRoomReadingId,
        }),
      });

      rooms.removeGenericReading(room.publicId, genericRoomReadingId);
      toast.success("Dehumidifier reading removed");
    } catch {
      toast.error("Failed to remove dehumidifier reading");
    }
  };

  return (
    <div>
      <div className='mt-4 flex flex-col gap-6'>
        <div className='mt-4 flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-medium'>Dehumidier Readings</h3>
            <p className='text-sm text-muted-foreground'>
              Add and manage your dehumidifier readings.
            </p>
          </div>
          <div className='mt-4 flex items-center justify-end gap-4'>
            <Button
              variant='outline'
              disabled={isCreatingGeneric}
              onClick={() => onCreateGenericReading()}
            >
              {isCreatingGeneric ? (
                <LoadingSpinner />
              ) : (
                "Add Dehumidifer Reading"
              )}
            </Button>
            <Button
              variant='destructive'
              disabled={deletingId == room.publicId}
              onClick={() => onDelete(reading.publicId, "standard")}
            >
              {deletingId == room.publicId ? (
                <LoadingSpinner />
              ) : (
                "Delete All Readings"
              )}
            </Button>
          </div>
        </div>
        {reading.GenericRoomReading.map((g) => (
          <GenericReadingCell
            g={g}
            room={room}
            onDelete={onDelete}
            deletingId={deletingId}
          />
        ))}
      </div>
    </div>
  );
};

export default GenericRoomReadings;
