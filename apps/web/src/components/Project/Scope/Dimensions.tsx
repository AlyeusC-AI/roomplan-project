import { useMemo, useState, useEffect } from "react";
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
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import {
  Equipment,
  Room,
  useCreateEquipment,
  useDeleteEquipment,
  useGetEquipment,
  useUpdateEquipment,
  useUpdateRoom,
} from "@service-geek/api-client";

const defaultEquipmentType = [
  "Fan",
  "Dehumidifier",
  "Air Scrubber",
  "Air Mover",
  "HEPA Vacuum",
  "Drying System",
];

export default function Dimensions({ room }: { room: Room }) {
  const [tempRoom, setTempRoom] = useState<Partial<Room>>(room);
  console.log("🚀 ~ Dimensions ~ tempRoom:", tempRoom);
  const { id } = useParams<{ id: string }>();
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newCustomEquipment, setNewCustomEquipment] = useState("");
  const [equipmentUsed, setEquipmentUsed] = useState<
    {
      id: string;
      name: string;
      quantity: number;
    }[]
  >([]);
  console.log("🚀 ~ Dimensions ~ equipmentUsed:", equipmentUsed);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    isOpen: boolean;
    equipment: string;
  }>({ isOpen: false, equipment: "" });
  const { data: equipments } = useGetEquipment();
  console.log("🚀 ~ Dimensions ~ equipments:", equipments);
  const { mutate: createEquipment } = useCreateEquipment();
  const { mutate: updateEquipment } = useUpdateEquipment();
  const { mutate: deleteEquipment } = useDeleteEquipment();
  const { mutate: updateRoom } = useUpdateRoom();
  console.log("🚀 ~ Dimeaaaasadts:", equipments, room.equipmentsUsed);

  useEffect(() => {
    if (equipments && room.equipmentUsed) {
      const equipmentUsedData =
        room.equipmentsUsed?.map((e) => ({
          id: e.equipmentId,
          name: equipments.find((eq) => eq.id === e.equipmentId)?.name || "",
          quantity: e.quantity,
        })) || [];
      console.log("🚀 ~ useEffect ~ equipmentUsedData:", equipmentUsedData);

      setEquipmentUsed(equipmentUsedData);
    }
  }, [room.equipmentsUsed, equipments]);
  const save = async () => {
    try {
      setUpdating(true);
      const d = tempRoom;
      if (d.length) {
        d.totalSqft = Number(d.length) * Number(d.width);
      }
      if (d.width) {
        d.totalSqft = Number(d.width) * Number(d.length);
      }

      await updateRoom({
        id: room.id,
        data: {
          name: d.name,
          length: d.length,
          width: d.width,
          height: d.height,
          totalSqft: d.totalSqft,
          windows: d.windows,
          doors: d.doors,
          equipmentUsed: equipmentUsed,
          humidity: d.humidity,
          dehuReading: d.dehuReading,
          temperature: d.temperature,
          roomPlanSVG: d.roomPlanSVG,
          scannedFileKey: d.scannedFileKey,
          cubiTicketId: d.cubiTicketId,
          cubiModelId: d.cubiModelId,
          cubiRoomPlan: d.cubiRoomPlan,
        },
      });

      toast.success("Room updated successfully.");
    } catch (e) {
      toast.error("Failed to update room.");
      console.error(e);
    }

    setUpdating(false);
  };

  const equipmentOptions = useMemo(
    () =>
      equipments?.map((e) => ({
        label: e.name,
        value: e.id,
      })) || ([] as { label: string; value: string }[]),
    [equipments]
  );

  // Add custom equipment
  const handleAddCustomEquipment = async () => {
    if (!newCustomEquipment.trim()) return;

    try {
      createEquipment({
        quantity: 1,
        name: newCustomEquipment.trim(),
      });
      setNewCustomEquipment("");
      setShowAddCustom(false);
      toast.success("Custom equipment added successfully");
    } catch (error) {
      console.error("Error adding custom equipment:", error);
      toast.error("Failed to add custom equipment");
    }
  };

  // Delete custom equipment
  const handleDeleteCustomEquipment = (equipment: string) => {
    setShowDeleteConfirmation({ isOpen: true, equipment });
  };

  const confirmDelete = async () => {
    const { equipment } = showDeleteConfirmation;

    try {
      deleteEquipment(equipment);
      // Also remove from selected equipment if it's selected
      if (equipmentUsed?.some((e) => e.id === equipment)) {
        const newEquipment = equipmentUsed.filter((e) => e.id !== equipment);

        setEquipmentUsed(newEquipment);
      }
      toast.success("Custom equipment deleted successfully");
    } catch (error) {
      console.error("Error deleting custom equipment:", error);
      // toast.error("Failed to delete custom equipment");
    } finally {
      setShowDeleteConfirmation({ isOpen: false, equipment: "" });
    }
  };

  // Update the equipment selection handler
  const handleEquipmentSelect = (currentValue: string) => {
    const isSelected = equipmentUsed?.some((e) => e.id === currentValue);
    const newEquipment = isSelected
      ? equipmentUsed?.filter((e) => e.id !== currentValue)
      : [
          ...(equipmentUsed ?? []),
          {
            id: currentValue,
            name: equipments?.find((e) => e.id === currentValue)?.name || "",
            quantity: 1,
          },
        ];

    setEquipmentUsed(newEquipment);
    // setOpen(false);
  };

  // Add quantity change handler
  const handleQuantityChange = (equipment: string, quantity: number) => {
    setEquipmentUsed(
      equipmentUsed?.map((e) =>
        e.id === equipment ? { ...e, quantity } : e
      ) || []
    );
  };

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
              setTempRoom({ ...tempRoom, length: parseFloat(e.target.value) })
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
              setTempRoom({ ...tempRoom, width: parseFloat(e.target.value) })
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
              setTempRoom({ ...tempRoom, height: parseFloat(e.target.value) })
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
            value={Number(tempRoom.length) * Number(tempRoom.width)}
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
            <div className='flex w-full gap-2'>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={open}
                    className='w-full justify-between'
                  >
                    {equipmentUsed && equipmentUsed?.length > 0
                      ? equipmentUsed.length > 2
                        ? `${equipmentUsed
                            .slice(0, 2)
                            .map(
                              (equipment) =>
                                `${equipment.name} (${equipment.quantity || 1})`
                            )
                            .join(", ")}...`
                        : equipmentUsed
                            .map(
                              (equipment) =>
                                `${equipment.name} (${equipment.quantity || 1})`
                            )
                            .join(", ")
                      : "Select equipment..."}
                    <ChevronsUpDown className='opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-full p-0'>
                  <Command>
                    {/* <CommandInput
                      // value={search}
                      placeholder='Search equipment...'
                    
                    /> */}
                    <CommandList>
                      <CommandEmpty>No equipment found.</CommandEmpty>
                      <CommandGroup>
                        {equipmentOptions.map((framework) => (
                          <CommandItem
                            key={framework.value}
                            value={framework.value}
                            onSelect={() =>
                              handleEquipmentSelect(framework.value)
                            }
                            className='flex items-center justify-between'
                          >
                            <div className='flex items-center'>
                              <span>{framework.label}</span>
                              {equipmentUsed?.some(
                                (e) => e.id === framework.value
                              ) && (
                                <div className='ml-4 flex items-center'>
                                  <span className='mr-2 text-sm text-muted-foreground'>
                                    Qty:
                                  </span>
                                  <Input
                                    className='h-8 w-16 text-sm'
                                    type='number'
                                    min='1'
                                    value={
                                      equipmentUsed
                                        ?.find((e) => e.id === framework.value)
                                        ?.quantity?.toString() || "1"
                                    }
                                    onChange={(e) => {
                                      const quantity =
                                        parseInt(e.target.value) || 1;
                                      handleQuantityChange(
                                        framework.value,
                                        quantity
                                      );
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              )}
                            </div>
                            <div className='flex items-center gap-2'>
                              {equipmentUsed?.some(
                                (e) => e.id === framework.value
                              ) && (
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='h-8 w-8 p-0'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCustomEquipment(
                                      framework.value
                                    );
                                  }}
                                >
                                  <X className='h-4 w-4 text-red-500' />
                                </Button>
                              )}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  equipmentUsed?.some(
                                    (e) => e.id === framework.value
                                  )
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Dialog open={showAddCustom} onOpenChange={setShowAddCustom}>
                <DialogTrigger asChild>
                  <Button variant='outline' size='icon' className='h-10 w-10'>
                    <Plus className='h-4 w-4' />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Custom Equipment</DialogTitle>
                  </DialogHeader>
                  <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='equipment'>Equipment Name</Label>
                      <Input
                        id='equipment'
                        value={newCustomEquipment}
                        onChange={(e) => setNewCustomEquipment(e.target.value)}
                        placeholder='Enter equipment name'
                      />
                    </div>
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='outline'
                        onClick={() => setShowAddCustom(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddCustomEquipment}>
                        Add Equipment
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <Button disabled={updating} onClick={save} className='mt-2'>
            {updating ? <LoadingSpinner /> : "Save"}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirmation.isOpen}
        onOpenChange={(open) =>
          !open && setShowDeleteConfirmation({ isOpen: false, equipment: "" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Equipment</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <p className='text-sm text-muted-foreground'>
              Are you sure you want to delete "
              {showDeleteConfirmation.equipment}"? This action cannot be undone.
            </p>
            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() =>
                  setShowDeleteConfirmation({ isOpen: false, equipment: "" })
                }
              >
                Cancel
              </Button>
              <Button variant='destructive' onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
