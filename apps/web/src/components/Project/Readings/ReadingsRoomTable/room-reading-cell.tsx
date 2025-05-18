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
import { CalendarIcon, Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import GenericRoomReadings from "./GenericRoomReadings";
import debounce from "lodash/debounce";
import {
  calculateGPP,
  Room,
  RoomReading,
  useUpdateRoomReading,
  useCreateWall,
  Wall,
  WallReading as WallReadingType,
} from "@service-geek/api-client";
import WallReading from "./walls";

export default function RoomReadingCell({
  r,
  room,
}: {
  r: RoomReading;
  room: Room;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [tempReading, setTempReading] = useState(r);

  const { id } = useParams<{ id: string }>();
  const { mutate: updateReading } = useUpdateRoomReading();
  const { mutate: createWall } = useCreateWall();

  const saveReading = useCallback(
    async (readingData: any) => {
      try {
        setIsUpdating(true);

        await updateReading({
          id: r.id,
          data: {
            date: new Date(readingData.date),
            humidity: Number(readingData.humidity),
            temperature: Number(readingData.temperature),

            equipmentUsed: readingData.equipmentUsed,
            wallReadings: readingData.wallReadings,
          },
        });
      } catch (error) {
        toast.error("Failed to update reading");
      } finally {
        setIsUpdating(false);
      }
    },
    [id, room.id]
  );

  const debouncedSave = useCallback(
    debounce((readingData: any) => {
      saveReading(readingData);
    }, 1000),
    []
  );

  // Auto-save when tempReading changes
  useEffect(() => {
    if (tempReading) {
      debouncedSave(tempReading);
    }
  }, [tempReading]);

  const walls = room.walls?.filter((w) => w.type === "WALL");
  const floors = room.walls?.filter((w) => w.type === "FLOOR");

  const onWallReadingUpdate = (
    wallReading: Partial<WallReadingType>,
    wall: Wall
  ) => {
    console.log("🚀 ~ onWallReadingUpdate ~ wallReading:", wallReading);
    console.log("🚀 ~ onWallReadingUpdate ~ wall:", wall);
    const isWallReading = r.wallReadings?.find((w) => w.wallId === wall.id);

    setTempReading((prev) => ({
      ...prev,
      wallReadings: isWallReading
        ? prev.wallReadings?.map((w: any) =>
            w.wallId == wall.id ? wallReading : w
          )
        : [
            ...(prev.wallReadings || []),
            {
              ...wallReading,
              wallId: wall.id,
            },
          ],
    }));
  };
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <Label className='dark:text-white'>Temperature</Label>
          <Input
            type='number'
            value={tempReading.temperature || ""}
            onChange={(e) =>
              setTempReading((prev) => ({
                ...prev,
                temperature: Number(e.target.value),
              }))
            }
            className='dark:border-gray-700 dark:bg-gray-800 dark:text-white'
            placeholder='Enter temperature'
          />
        </div>
        <div>
          <Label className='dark:text-white'>Humidity</Label>
          <Input
            type='number'
            value={tempReading.humidity || ""}
            onChange={(e) =>
              setTempReading((prev) => ({
                ...prev,
                humidity: Number(e.target.value),
              }))
            }
            className='dark:border-gray-700 dark:bg-gray-800 dark:text-white'
            placeholder='Enter humidity'
          />
        </div>
        <div>
          <Label className='dark:text-white'>GPP</Label>
          <Input
            type='number'
            value={
              calculateGPP(
                Number(tempReading.temperature),
                Number(tempReading.humidity)
              )?.toFixed(2) || ""
            }
            disabled
            className='dark:border-gray-700 dark:bg-gray-800 dark:text-white'
          />
        </div>
        <div>
          <Label className='dark:text-white'>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal dark:border-gray-700 dark:bg-gray-800 dark:text-white",
                  !tempReading.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {tempReading.date ? (
                  format(new Date(tempReading.date), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className='w-auto p-0 dark:bg-gray-800'
              align='start'
            >
              <Calendar
                mode='single'
                selected={
                  tempReading.date ? new Date(tempReading.date) : undefined
                }
                onSelect={(date) =>
                  setTempReading((prev) => ({
                    ...prev,
                    date: date ? new Date(date) : prev.date,
                  }))
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className='space-y-4'>
        {walls?.length === 0 && (
          <div className='flex items-center justify-between'>
            <div className='text-lg font-medium dark:text-white'>
              Wall Moisture Content
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() =>
                createWall({
                  type: "WALL",
                  roomId: room.id,
                  name: "Wall Moisture Content",
                })
              }
            >
              <Plus className='mr-2 h-4 w-4' />
              Add wall
            </Button>
          </div>
        )}
        {walls?.map((wall) => (
          <WallReading
            key={wall.id}
            onUpdate={(wallReading: any) => {
              onWallReadingUpdate(wallReading, wall);
            }}
            wallReading={tempReading.wallReadings?.find(
              (w) => w.wallId === wall.id
            )}
            wall={wall}
          />
        ))}
      </div>
      <div className='space-y-4'>
        {floors?.length === 0 && (
          <div className='flex items-center justify-between'>
            <div className='text-lg font-medium dark:text-white'>
              Floor Moisture Content
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() =>
                createWall({
                  type: "FLOOR",
                  roomId: room.id,
                  name: "Floor Moisture Content",
                })
              }
              className='h-8'
            >
              <Plus className='mr-2 h-4 w-4' />
              Add floor
            </Button>
          </div>
        )}
        {floors?.map((wall) => (
          <WallReading
            key={wall.id}
            onUpdate={(wallReading: any) => {
              onWallReadingUpdate(wallReading, wall);
            }}
            wallReading={tempReading.wallReadings?.find(
              (w) => w.wallId === wall.id
            )}
            wall={wall}
          />
        ))}
      </div>
      <GenericRoomReadings
        room={room}
        reading={r}
        onUpdate={(reading) => {
          setTempReading(reading);
        }}
      />
    </div>
  );
}
