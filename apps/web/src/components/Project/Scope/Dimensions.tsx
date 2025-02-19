import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { roomStore } from "@atoms/room";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { Button } from "@components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@components/ui/command";
import { cn } from "@lib/utils";
import { LoadingSpinner } from "@components/ui/spinner";
import { toast } from "sonner";

const defaultEquipmentType = ["Fan", "Dehumidifier", "Air Scrubber"];

export default function Dimensions({ room }: { room: RoomWithReadings }) {
  const [tempRoom, setTempRoom] = useState<RoomWithReadings>(room);
  const { id } = useParams<{ id: string }>();
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const save = async () => {
    try {
      setUpdating(true);
      const d = tempRoom;
      if (d.length) {
        d.totalSqft = (
          parseFloat(d.length || "1") * parseFloat(d.width || "1")
        ).toString();
      }
      if (d.width) {
        d.totalSqft = (
          parseFloat(d.width || "1") * parseFloat(d.length || "1")
        ).toString();
      }
      // @ts-expect-error just deleting temp before updating
      delete d.AreaAffected;
      // @ts-expect-error just deleting temp before updating
      delete d.RoomReading;
      // @ts-expect-error just deleting temp before updating
      delete d.Inference;
      // @ts-expect-error just deleting temp before updating
      delete d.Notes;
      const res = await fetch(`/api/v1/projects/${id}/room`, {
        method: "PATCH",
        body: JSON.stringify({
          roomId: room.publicId,
          ...tempRoom,
        }),
      });

      if (res.ok) {
        roomStore.getState().updateRoom(room.publicId, d);
        toast.success("Room updated successfully.");
      } else {
        toast.error("Failed to update room.");
      }
    } catch (e) {
      toast.error("Failed to update room.");
      console.error(e);
    }

    setUpdating(false);
  };

  const equipmentOptions = useMemo(
    () =>
      defaultEquipmentType.map((e) => ({
        label: e,
        value: e,
      })) as { label: string; value: string }[],
    []
  );

  return (
    <div className='mt-4 space-y-5'>
      <div>
        <h3 className='text-lg font-medium'>Dimensions & Details</h3>
        <p className='text-sm text-muted-foreground'>
          Update and manage your room dimensions and details.
        </p>
      </div>
      <h2 className='text-lg font-medium'></h2>
      <div className='grid grid-cols-3 gap-2'>
        <div className='flex flex-col items-start space-y-2'>
          <Label>Length (feet)</Label>
          <Input
            className='col-span-1'
            placeholder=''
            value={tempRoom.length || ""}
            onChange={(e) =>
              setTempRoom({ ...tempRoom, length: e.target.value })
            }
            name='roomLength'
            type='number'
            title='Length'
          />
        </div>

        <div className='flex flex-col items-start space-y-2'>
          <Label>Width (feet)</Label>
          <Input
            className='col-span-1'
            placeholder=''
            value={tempRoom.width ?? 0}
            onChange={(e) =>
              setTempRoom({ ...tempRoom, width: e.target.value })
            }
            name='roomWidth'
            type='number'
            title='Width'
          />
        </div>
        <div className='flex flex-col items-start space-y-2'>
          <Label>Height (feet)</Label>
          <Input
            className='col-span-1'
            placeholder=''
            value={tempRoom.height ?? 0}
            onChange={(e) =>
              setTempRoom({ ...tempRoom, height: e.target.value })
            }
            name='roomHeight'
            type='number'
            title='Height'
          />
        </div>

        <div className='mt-2 flex flex-col items-start space-y-2'>
          <Label>Total Sqft</Label>
          <Input
            className='col-span-1'
            placeholder='--'
            value={Number(tempRoom.height) * Number(tempRoom.width)}
            readOnly
            name='totalSqft'
            type='number'
          />
        </div>
        <div className='mt-2 flex flex-col items-start space-y-2'>
          <Label># Doors</Label>
          <Input
            className='col-span-1'
            placeholder='--'
            value={tempRoom.doors?.toString() || ""}
            onChange={(e) =>
              setTempRoom({ ...tempRoom, doors: parseInt(e.target.value) })
            }
            name='totalSqft'
            type='number'
          />
        </div>
        <div className='mt-2 flex flex-col items-start space-y-2'>
          <Label># Windows</Label>
          <Input
            className='col-span-1'
            placeholder='--'
            value={tempRoom.windows?.toString() || ""}
            onChange={(e) =>
              setTempRoom({ ...tempRoom, windows: parseInt(e.target.value) })
            }
            name='totalSqft'
            type='number'
          />
        </div>
        <div className='col-span-3 my-2 flex flex-row items-end justify-between'>
          <div className='flex w-[300px] flex-col items-start space-y-2'>
            <Label>Equipment Used</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  role='combobox'
                  aria-expanded={open}
                  className='w-full justify-between'
                >
                  {tempRoom.equipmentUsed && tempRoom.equipmentUsed?.length > 0
                    ? tempRoom.equipmentUsed.join(", ")
                    : "Select equipment..."}
                  <ChevronsUpDown className='opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-full p-0'>
                <Command>
                  <CommandInput placeholder='Search equipment...' />
                  <CommandList>
                    <CommandEmpty>No equipment found.</CommandEmpty>
                    <CommandGroup>
                      {equipmentOptions.map((framework) => (
                        <CommandItem
                          key={framework.value}
                          value={framework.value}
                          onSelect={(currentValue) => {
                            setTempRoom({
                              ...tempRoom,
                              equipmentUsed: tempRoom.equipmentUsed?.includes(
                                currentValue
                              )
                                ? tempRoom.equipmentUsed?.filter(
                                    (e) => e !== currentValue
                                  )
                                : [
                                    ...(tempRoom.equipmentUsed ?? []),
                                    currentValue,
                                  ],
                            });
                            setOpen(false);
                          }}
                        >
                          {framework.label}
                          <Check
                            className={cn(
                              "ml-auto",
                              tempRoom.equipmentUsed?.includes(framework.value)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <Button disabled={updating} onClick={save} className='mt-2'>
            {updating ? <LoadingSpinner /> : "Save"}
          </Button>{" "}
          {/* <div className={"relative mt-1 rounded-md shadow-sm"}> */}
          {/* <Select
              id='equipment-used'
              instanceId={reactSelectId}
              options={equipmentOptions}
              isMulti
              defaultValue={room.equipmentUsed?.map((e) => ({
                label: e,
                value: e,
              }))}
              onChange={(newValue) =>
                saveDimension({
                  equipmentUsed: newValue.map((v) => v.value),
                })
              }
              styles={{ menu: (base) => ({ ...base, zIndex: 9999 }) }}
            /> */}
          {/* </div> */}
        </div>
      </div>
    </div>
  );
}
