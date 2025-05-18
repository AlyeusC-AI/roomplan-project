import { useState } from "react";
import useAmplitudeTrack from "@utils/hooks/useAmplitudeTrack";
import { Button } from "@components/ui/button";
import { LoadingSpinner } from "@components/ui/spinner";
import { toast } from "sonner";
import GenericReadingCell from "./generic-reading-cell";
import {
  RoomReading,
  Room,
  useCreateGenericRoomReading,
  useUpdateGenericRoomReading,
  useDeleteGenericRoomReading,
} from "@service-geek/api-client";

const GenericRoomReadings = ({
  room,
  reading,
  onUpdate,
}: {
  room: Room;
  reading: RoomReading;
  onUpdate: (reading: RoomReading) => void;
}) => {
  console.log("🚀 ~ readasasasing:", reading);
  const [isCreatingGeneric, setIsCreatingGeneric] = useState(false);
  const { track } = useAmplitudeTrack();
  const { mutate: createGenericReading } = useCreateGenericRoomReading();
  const { mutate: deleteGenericReading } = useDeleteGenericRoomReading();
  const { mutate: updateGenericReading } = useUpdateGenericRoomReading();

  const onCreateGenericReading = async () => {
    setIsCreatingGeneric(true);
    track("Add Generic Room Reading");
    try {
      await createGenericReading({
        humidity: 0,
        temperature: 0,
        roomReadingId: reading.id,
        value: "",
        images: [],
      });

      toast.success("Dehumidifier reading added");
    } catch (error) {
      console.error(error);
      // toast.error("Failed to add dehumidifier reading");
    }
    setIsCreatingGeneric(false);
    // await addGenericReading.mutateAsync({
    //   projectPublicId: id,
    //   roomPublicId: room.publicId,
    //   readingPublicId: reading.publicId,
    //   type: RoomReadingType.dehumidifer,
    // });
  };

  // const onDelete = async (
  //   genericRoomReadingId: string,
  //   type: "generic" | "standard"
  // ) => {
  //   setDeletingId(genericRoomReadingId);
  //   track("Delete Generic Room Reading");
  //   try {
  //     await fetch(`/api/v1/projects/${id}/readings`, {
  //       method: "DELETE",
  //       body: JSON.stringify({
  //         type,
  //         readingId: genericRoomReadingId,
  //       }),
  //     });

  //     toast.success("Dehumidifier reading removed");
  //   } catch {
  //     toast.error("Failed to remove dehumidifier reading");
  //   }
  // };

  return (
    <div>
      <div className='mt-4 flex flex-col gap-6'>
        <div className='mt-4 flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-medium dark:text-white'>
              Dehumidier Readings
            </h3>
            <p className='text-sm text-muted-foreground dark:text-gray-400'>
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
            {/* <Button
              variant='destructive'
              disabled={deletingId == room.id}
              onClick={() => onDelete(reading.id, "standard")}
            >
              {deletingId == room.id ? (
                <LoadingSpinner />
              ) : (
                "Delete All Readings"
              )}
            </Button> */}
          </div>
        </div>
        {reading.genericRoomReading?.map((g) => (
          <GenericReadingCell key={g.id} g={g} room={room} />
        ))}
      </div>
    </div>
  );
};

export default GenericRoomReadings;
