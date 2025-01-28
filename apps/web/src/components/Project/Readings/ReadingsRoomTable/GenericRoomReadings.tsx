import { useState } from "react";
import { RoomDataWithoutInferences } from "@servicegeek/db/queries/project/getProjectDetections";
import { RoomReadingType } from "@servicegeek/db";
import useAmplitudeTrack from "@utils/hooks/useAmplitudeTrack";
import { trpc } from "@utils/trpc";
import { RouterOutputs } from "@servicegeek/api";
import { useRouter } from "next/router";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Trash } from "lucide-react";

const GenericRoomReadings = ({
  room,
  reading,
}: {
  room: RoomDataWithoutInferences;
  reading: RouterOutputs["readings"]["getAll"][0];
}) => {
  const [isCreatingGeneric, setIsCreatingGeneric] = useState(false);
  const [isDeletingReading, setIsDeletingReading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const { track } = useAmplitudeTrack();
  const router = useRouter();
  const trpcContext = trpc.useContext();

  const removeReading = trpc.readings.deleteReading.useMutation({
    async onSettled() {
      await trpcContext.readings.getAll.invalidate();
      setIsDeletingReading(false);
    },
  });

  const addGenericReading = trpc.readings.addGenericReading.useMutation({
    async onSettled() {
      await trpcContext.readings.getAll.invalidate();
      setIsCreatingGeneric(false);
    },
  });

  const deleteGenericReading = trpc.readings.deleteGenericReading.useMutation({
    async onSettled() {
      await trpcContext.readings.getAll.invalidate();
      setDeletingId("");
    },
  });

  const updateGenericReading = trpc.readings.updateGenericReading.useMutation({
    onSettled() {
      trpcContext.readings.getAll.invalidate();
    },
  });

  const onCreateGenericReading = async () => {
    setIsCreatingGeneric(true);
    track("Add Generic Room Reading");
    await addGenericReading.mutateAsync({
      projectPublicId: router.query.id as string,
      roomPublicId: room.publicId,
      readingPublicId: reading.publicId,
      type: RoomReadingType.dehumidifer,
    });
  };

  const onSaveGeneric = async (
    genericRoomReadingId: string,
    data: { value?: string; temperature?: string; humidity?: string }
  ) => {
    track("Save Generic Room Reading");
    await updateGenericReading.mutateAsync({
      projectPublicId: router.query.id as string,
      roomPublicId: reading.room.publicId,
      readingPublicId: reading.publicId,
      genericReadingPublicId: genericRoomReadingId,
      value: data.value,
      temperature: data.temperature,
      humidity: data.humidity,
    });
  };

  const onDeleteGeneric = async (genericRoomReadingId: string) => {
    setDeletingId(genericRoomReadingId);
    track("Delete Generic Room Reading");
    await deleteGenericReading.mutateAsync({
      projectPublicId: router.query.id as string,
      roomPublicId: reading.room.publicId,
      readingPublicId: reading.publicId,
      genericReadingPublicId: genericRoomReadingId,
    });
  };

  const onDeleteReadings = async () => {
    setIsDeletingReading(true);
    await removeReading.mutateAsync({
      projectPublicId: router.query.id as string,
      roomPublicId: reading.room.publicId,
      readingPublicId: reading.publicId,
    });
  };

  return (
    <div>
      <div className='mt-4 flex flex-col gap-6'>
        {reading.genericRoomReadings.map((g) => (
          <div
            key={g.publicId}
            className='grid w-full grid-cols-2 gap-6 md:grid-cols-4'
          >
            <Input
              className='w-full'
              defaultValue={g.temperature || ""}
              // onSave={(temperature) =>
              //   onSaveGeneric(g.publicId, { temperature })
              // }
              name='Temperature'
              title='Temperature'
            />
            <div className='w-full'>
              <Input
                className='w-full'
                defaultValue={g.humidity || ""}
                // onSave={(humidity) => onSaveGeneric(g.publicId, { humidity })}
                name='Humidity'
                title='Relative Humidity'
                // units='RH'
                // ignoreInvalid
              />
            </div>
            <div className='ml-2 flex flex-col justify-end'>
              <Button
                variant='destructive'
                className='!py-2'
                onClick={() => onDeleteGeneric(g.publicId)}
                // loading={g.publicId === deletingId}
              >
                <Trash className='h-6' /> Remove Dehu Entry
              </Button>
            </div>
          </div>
        ))}
      </div>
      {reading.genericRoomReadings.length === 0 && (
        <h5 className='mt-4'>Dehumidifier Readings</h5>
      )}
      <div className='mt-4 flex items-center justify-start'>
        <Button
          loading={isCreatingGeneric}
          onClick={() => onCreateGenericReading()}
        >
          Add Dehumidifer Reading
        </Button>
        <Button
          variant='destructive'
          loading={isDeletingReading}
          onClick={() => onDeleteReadings()}
        >
          Delete All Readings
        </Button>
      </div>
    </div>
  );
};

export default GenericRoomReadings;
