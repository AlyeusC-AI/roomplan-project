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
import { createClient } from "@lib/supabase/client";

const defaultEquipmentType = [
  "Fan",
  "Dehumidifier",
  "Air Scrubber",
  "Air Mover",
  "HEPA Vacuum",
  "Drying System",
];

export default function Dimensions({ room }: { room: RoomWithReadings }) {
  const [tempRoom, setTempRoom] = useState<RoomWithReadings>(room);
  const { id } = useParams<{ id: string }>();
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newCustomEquipment, setNewCustomEquipment] = useState("");
  const [customEquipment, setCustomEquipment] = useState<string[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{isOpen: boolean, equipment: string}>({isOpen: false, equipment: ""});

  // Add new state for equipment quantities
  const [equipmentQuantities, setEquipmentQuantities] = useState<Record<string, number>>({});
  useEffect(() => {
    setEquipmentQuantities(room.equipmentUsedQuantity || {});
  }, [room?.equipmentUsedQuantity]);

  // Load custom equipment
  useEffect(() => {
    const fetchCustomEquipment = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.user_metadata?.organizationId) return;

      
      const { data, error } = await supabase
        .from("Organization")
        .select("extraEquipemnts")
        .eq("publicId", session.user.user_metadata.organizationId)
        .single();

      if (error) {
        console.error("Error fetching custom equipment:", error);
      } else {
        setCustomEquipment(data.extraEquipemnts || []);
      }
    };

    fetchCustomEquipment();
  }, []);

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
      [...defaultEquipmentType, ...customEquipment].map((e) => ({
        label: e,
        value: e,
      })) as { label: string; value: string }[],
    [customEquipment]
  );

  // Add custom equipment
  const handleAddCustomEquipment = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!newCustomEquipment.trim() || !session?.user?.user_metadata?.organizationId) return;
    
    try {
      const { error } = await supabase
        .from("Organization")
        .update({
          extraEquipemnts: [...customEquipment, newCustomEquipment.trim()]
        })
        .eq("publicId", session.user.user_metadata.organizationId);

      if (error) {
        toast.error("Failed to add custom equipment");
      } else {
        setCustomEquipment(prev => [...prev, newCustomEquipment.trim()]);
        setNewCustomEquipment("");
        setShowAddCustom(false);
        toast.success("Custom equipment added successfully");
      }
    } catch (error) {
      console.error("Error adding custom equipment:", error);
      toast.error("Failed to add custom equipment");
    }
  };

  // Delete custom equipment
  const handleDeleteCustomEquipment = (equipment: string) => {
    setShowDeleteConfirmation({isOpen: true, equipment});
  };

  const confirmDelete = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const { equipment } = showDeleteConfirmation;
    if (!session?.user?.user_metadata?.organizationId) return;

    try {
      const { error } = await supabase
        .from("Organization")
        .update({
          extraEquipemnts: customEquipment.filter(e => e !== equipment)
        })
        .eq("publicId", session.user.user_metadata.organizationId);

      if (error) {
        toast.error("Failed to delete custom equipment");
      } else {
        setCustomEquipment(prev => prev.filter(e => e !== equipment));
        // Also remove from selected equipment if it's selected
        if (tempRoom.equipmentUsed?.includes(equipment)) {
          const newEquipment = tempRoom.equipmentUsed.filter(e => e !== equipment);
          const newQuantities = { ...equipmentQuantities };
          delete newQuantities[equipment];
          setEquipmentQuantities(newQuantities);
          setTempRoom({
            ...tempRoom,
            equipmentUsed: newEquipment,
            equipmentUsedQuantity: newQuantities
          });
        }
        toast.success("Custom equipment deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting custom equipment:", error);
      toast.error("Failed to delete custom equipment");
    } finally {
      setShowDeleteConfirmation({isOpen: false, equipment: ""});
    }
  };

  // Update the equipment selection handler
  const handleEquipmentSelect = (currentValue: string) => {
    const isSelected = tempRoom.equipmentUsed?.includes(currentValue);
    const newEquipment = isSelected
      ? tempRoom.equipmentUsed?.filter((e) => e !== currentValue)
      : [...(tempRoom.equipmentUsed ?? []), currentValue];

    // Update quantities
    const newQuantities = { ...equipmentQuantities };
    if (isSelected) {
      delete newQuantities[currentValue];
    } else {
      newQuantities[currentValue] = 1; // Default quantity
    }

    setEquipmentQuantities(newQuantities);
    setTempRoom({
      ...tempRoom,
      equipmentUsed: newEquipment || [],
      equipmentUsedQuantity: newQuantities
    });
    setOpen(false);
  };

  // Add quantity change handler
  const handleQuantityChange = (equipment: string, quantity: number) => {
    const newQuantities = { ...equipmentQuantities, [equipment]: quantity };
    setEquipmentQuantities(newQuantities);
    setTempRoom({
      ...tempRoom,
      equipmentUsedQuantity: newQuantities
    });
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
            <div className="flex gap-2 w-full">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={open}
                    className='w-full justify-between'
                  >
                    {tempRoom.equipmentUsed && tempRoom.equipmentUsed?.length > 0
                      ? tempRoom.equipmentUsed.length > 2
                        ? `${tempRoom.equipmentUsed.slice(0,2).map(equipment => 
                            `${equipment} (${equipmentQuantities[equipment] || 1})`
                          ).join(", ")}...`
                        : tempRoom.equipmentUsed.map(equipment => 
                            `${equipment} (${equipmentQuantities[equipment] || 1})`
                          ).join(", ")
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
                            onSelect={() => handleEquipmentSelect(framework.value)}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <span>{framework.label}</span>
                              {tempRoom.equipmentUsed?.includes(framework.value) && (
                                <div className="ml-4 flex items-center">
                                  <span className="text-sm text-muted-foreground mr-2">Qty:</span>
                                  <Input
                                    className="w-16 h-8 text-sm"
                                    type="number"
                                    min="1"
                                    value={equipmentQuantities[framework.value]?.toString() || "1"}
                                    onChange={(e) => {
                                      const quantity = parseInt(e.target.value) || 1;
                                      handleQuantityChange(framework.value, quantity);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {customEquipment.includes(framework.value) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCustomEquipment(framework.value);
                                  }}
                                >
                                  <X className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  tempRoom.equipmentUsed?.includes(framework.value)
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
                  <Button variant="outline" size="icon" className="h-10 w-10">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Custom Equipment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="equipment">Equipment Name</Label>
                      <Input
                        id="equipment"
                        value={newCustomEquipment}
                        onChange={(e) => setNewCustomEquipment(e.target.value)}
                        placeholder="Enter equipment name"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddCustom(false)}>
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
      <Dialog open={showDeleteConfirmation.isOpen} onOpenChange={(open) => !open && setShowDeleteConfirmation({isOpen: false, equipment: ""})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Equipment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete "{showDeleteConfirmation.equipment}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirmation({isOpen: false, equipment: ""})}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
