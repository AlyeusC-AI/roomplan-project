import { roomStore } from "@atoms/room";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { LoadingSpinner } from "@components/ui/spinner";
import { Pencil, Trash } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function GenericReadingCell({
  g,
  room,
  onDelete,
  deletingId,
}: {
  g: GenericRoomReading;
  room: RoomWithReadings;
  onDelete: (id: string, type: "generic") => void;
  deletingId: string;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const rooms = roomStore((state) => state);
  const [tempGenericReading, setTempGenericReading] = useState(g);
  const { id } = useParams<{ id: string }>();

  const onSaveGeneric = async () => {
    setIsUpdating(true);
    try {
      await fetch(`/api/v1/projects/${id}/readings`, {
        method: "PATCH",
        body: JSON.stringify({
          type: "generic",
          readingId: g.publicId,
          readingData: tempGenericReading,
        }),
      });

      toast.success("Dehumidifier reading updated");
      rooms.updateGenericReading(room.publicId, g.publicId, tempGenericReading);
    } catch {
      toast.error("Failed to update dehumidifier reading");
    }
    setIsUpdating(false);
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
      key={g.publicId}
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
        <Label className="dark:text-white">Temperature (F)</Label>
        <Input
          className='col-span-1 dark:bg-gray-800 dark:text-white dark:border-gray-700'
          defaultValue={g.temperature || ""}
          onChange={(e) =>
            setTempGenericReading({ ...g, temperature: e.target.value })
          }
          placeholder='Temperature'
        />
      </div>
      <div className='flex flex-col items-start space-y-2'>
        <Label className="dark:text-white">Humidity (RH)</Label>
        <Input
          className='col-span-1 dark:bg-gray-800 dark:text-white dark:border-gray-700'
          defaultValue={g.humidity || ""}
          onChange={(e) =>
            setTempGenericReading({ ...g, humidity: e.target.value })
          }
          placeholder='Relative Humidity'
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
          onClick={() => onDelete(g.publicId, "generic")}
          disabled={deletingId === g.publicId}
        >
          {deletingId === g.publicId ? (
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
