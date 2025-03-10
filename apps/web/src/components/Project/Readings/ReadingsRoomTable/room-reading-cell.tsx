import { Button } from "@components/ui/button";
import { Calendar } from "@components/ui/calendar";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { cn } from "@lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { roomStore } from "@atoms/room";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import GenericRoomReadings from "./GenericRoomReadings";
import { LoadingSpinner } from "@components/ui/spinner";

export default function RoomReadingCell({
  r,
  room,
}: {
  r: ReadingsWithGenericReadings;
  room: RoomWithReadings;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [tempReading, setTempReading] = useState(r);
  const rooms = roomStore();
  const { id } = useParams<{ id: string }>();

  const calculateGPP = (temperature: number, humidity: number) => {
    if (!temperature || !humidity) return null;
    return (
      (humidity / 100) * 7000 * (1 / 7000 + (2 / 7000) * (temperature - 32))
    );
  };

  useEffect(() => {
    setTempReading((prev) => ({
      ...prev,
      gpp: calculateGPP(Number(prev.temperature), Number(prev.humidity)),
    }));
  }, []);

  const onSave = async () => {
    try {
      setIsUpdating(true);
      const isolatedTemp = tempReading;
      // @ts-expect-error just deleting before updating
      delete isolatedTemp.GenericRoomReading;
      await fetch(`/api/v1/projects/${id}/readings`, {
        method: "PATCH",
        body: JSON.stringify({
          type: "standard",
          readingData: tempReading,
          readingId: r.publicId,
        }),
      });

      toast.success("Reading updated");
      rooms.updateReading(room.publicId, r.publicId, tempReading);
    } catch {
      toast.error("Failed to update reading");
    }
    setIsUpdating(false);
    // updateReading.mutate({
    //   projectPublicId: id,
    //   roomPublicId: room.publicId,
    //   readingPublicId: readingId,
    //   temperature: data.temperature,
    //   humidity: data.humidity,
    //   moistureContentWall: data.moistureContentWall,
    //   moistureContentFloor: data.moistureContentFloor,
    //   date: data.date,
    // });
  };
  return (
    <div key={r.publicId} className='mt-6 border-l-2 border-gray-500 pl-4'>
      <div className='flex flex-col items-start space-y-2'>
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !tempReading.date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className='mr-2 size-4' />
              {tempReading.date ? (
                format(new Date(tempReading.date), "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0'>
            <Calendar
              mode='single'
              selected={
                tempReading.date ? new Date(tempReading.date) : new Date()
              }
              onSelect={(date) =>
                setTempReading({ ...tempReading, date: date!.toISOString() })
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className='mt-3 grid grid-cols-2 gap-6'>
        <div className='flex flex-col items-start space-y-2'>
          <Label>Temperature (F)</Label>
          <Input
            className='col-span-1'
            defaultValue={tempReading.temperature || ""}
            placeholder='Temperature'
            onChange={(e) => {
              const newTemp = e.target.value;
              setTempReading({
                ...tempReading,
                temperature: newTemp,
                gpp: calculateGPP(
                  Number(newTemp),
                  Number(tempReading.humidity)
                ),
              });
            }}
            name='temperature'
            title='Temperature'
          />
        </div>
        <div className='flex flex-col items-start space-y-2'>
          <Label>Relative Humidity (RH)</Label>
          <Input
            className='col-span-1'
            defaultValue={tempReading.humidity || ""}
            placeholder='Humidity'
            onChange={(e) => {
              const newHumidity = e.target.value;
              setTempReading({
                ...tempReading,
                humidity: newHumidity,
                gpp: calculateGPP(
                  Number(tempReading.temperature),
                  Number(newHumidity)
                ),
              });
            }}
            name='relative-humidity'
            title='Relative Humidity'
          />
        </div>
        {/* <div>
              <label
                htmlFor='gpp'
                className='block text-sm font-medium text-gray-700'
              >
                Grains Per Pound
              </label>
              <div className={"relative mt-1 rounded-md shadow-sm"}>
                <div
                  id='gpp'
                  className='block w-full rounded-md border-gray-300 bg-gray-300 p-2 pr-12 text-sm text-black focus:border-blue-500 focus:ring-blue-500'
                  aria-describedby={`total-sqft-units`}
                >
                  {r.gpp || "--"}
                </div>
                <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
                  <span
                    className={"text-black sm:text-sm"}
                    id={`total-sqft-units`}
                  >
                    gpp
                  </span>
                </div>
              </div>
            </div> */}
        <div className='flex flex-col items-start space-y-2'>
          <Label>Grains Per Pound (gpp)</Label>
          <Input
            className='col-span-1'
            value={tempReading.gpp ? Number(tempReading.gpp).toFixed(2) : "--"}
            disabled
            placeholder='Grains Per Pound'
          />
        </div>
        <div className='flex flex-col items-start space-y-2'>
          <Label>Moisture Content (Wall) (%)</Label>
          <Input
            className='col-span-1'
            defaultValue={r.moistureContentWall || ""}
            onChange={(e) =>
              setTempReading({
                ...tempReading,
                moistureContentWall: e.target.value,
              })
            }
            name='moisture-wall'
            title='Moisture Content (Wall)'
            placeholder='Moisture Content Percentage'
          />
        </div>
        <div className='flex flex-col items-start space-y-2'>
          <Label>Moisture Content (Floor) (%)</Label>
          <Input
            className='col-span-1'
            defaultValue={r.moistureContentFloor || ""}
            onChange={(e) =>
              setTempReading({
                ...tempReading,
                moistureContentFloor: e.target.value,
              })
            }
            name='moisture-wall'
            title='Moisture Content (Floor)'
            placeholder='Moisture Content Percentage'
          />
        </div>
        <div className='flex items-center justify-end'>
          <Button disabled={isUpdating} onClick={onSave} className='mt-5 w-32'>
            {isUpdating ? <LoadingSpinner /> : "Save Changes"}
          </Button>
        </div>
      </div>
      <GenericRoomReadings room={room} reading={r} />
    </div>
  );
}
