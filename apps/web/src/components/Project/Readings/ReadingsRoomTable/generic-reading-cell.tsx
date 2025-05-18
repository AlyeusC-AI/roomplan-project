import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { LoadingSpinner } from "@components/ui/spinner";
import {
  GenericRoomReading,
  Room,
  useDeleteGenericRoomReading,
  useUpdateGenericRoomReading,
} from "@service-geek/api-client";
import { Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function GenericReadingCell({
  g,
  room,
}: {
  g: GenericRoomReading;
  room: Room;
}) {
  const [tempGenericReading, setTempGenericReading] = useState(g);
  const { mutate: deleteGenericReading, isPending: isDeleting } =
    useDeleteGenericRoomReading();
  const { mutate: updateGenericReading, isPending: isUpdating } =
    useUpdateGenericRoomReading();

  const onSaveGeneric = async () => {
    try {
      await updateGenericReading({
        id: g.id,
        data: {
          temperature: tempGenericReading.temperature,
          humidity: tempGenericReading.humidity,
          images: tempGenericReading.images,
          value: tempGenericReading.value,
        },
      });

      toast.success("Dehumidifier reading updated");
    } catch (error) {
      console.error(error);
      // toast.error("Failed to update dehumidifier reading");
    }
    // await updateGenericReading.mutateAsync({
    //   projectPublicId: id,
    //   roomPublicId: room.publicId,
    //   readingPublicId: reading.publicId,
    //   genericReadingPublicId: genericRoomReadingId,
    //   value: data.value,
    //   temperature: data.temperature,
    //   humidity: data.humidity,
    // });
  };

  return (
    <div
      // key={g.id}
      className='grid w-full grid-cols-2 items-end gap-6 md:grid-cols-4'
    >
      {/* <Input
                className='w-full'
                defaultValue={g.temperature || ""}
                // onSave={(temperature) =>
                //   onSaveGeneric(g.publicId, { temperature })
                // }
                name='Temperature'
                placeholder='Temperature'
              /> */}
      <div className='flex flex-col items-start space-y-2'>
        <Label className='dark:text-white'>Temperature (F)</Label>
        <Input
          className='col-span-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
          defaultValue={g.temperature || ""}
          onChange={(e) =>
            setTempGenericReading((prev) => ({
              ...prev,
              temperature: parseFloat(e.target.value),
            }))
          }
          placeholder='Temperature'
          type='number'
        />
      </div>
      <div className='flex flex-col items-start space-y-2'>
        <Label className='dark:text-white'>Humidity (RH)</Label>
        <Input
          className='col-span-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
          defaultValue={g.humidity || ""}
          onChange={(e) =>
            setTempGenericReading((prev) => ({
              ...prev,
              humidity: parseFloat(e.target.value),
            }))
          }
          placeholder='Relative Humidity'
          type='number'
        />
      </div>
      {/* <div className='w-full'>
                <Input
                  className='w-full'
                  defaultValue={g.humidity || ""}
                  // onSave={(humidity) => onSaveGeneric(g.publicId, { humidity })}
                  name='Humidity'
                  placeholder='Relative Humidity'
                  // units='RH'
                  // ignoreInvalid
                />
              </div> */}
      <div className='ml-1 flex flex-row justify-start gap-3'>
        <Button onClick={onSaveGeneric} variant='outline'>
          {isUpdating ? (
            <LoadingSpinner />
          ) : (
            <>
              Edit
              <Pencil className='ml-1' />
            </>
          )}
        </Button>
        <Button
          variant='destructive'
          onClick={() => deleteGenericReading(g.id)}
        >
          {isDeleting ? (
            <LoadingSpinner />
          ) : (
            <>
              <Trash className='h-6' />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
