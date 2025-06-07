import { Dispatch, SetStateAction, useState } from "react";
import Modal from "@components/DesignSystem/Modal";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Button } from "@components/ui/button";
import { Building2 } from "lucide-react";
import { useGetRooms } from "@service-geek/api-client";
import { useParams } from "next/navigation";

const RoomReassignModal = ({
  open,
  setOpen,
  onReassign,
  loading,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onReassign: (roomId: string) => void;
  loading: boolean;
}) => {
  const { id } = useParams<{ id: string }>();
  const { data: rooms } = useGetRooms(id);
  const [value, setValue] = useState("");

  return (
    <Modal open={open} setOpen={setOpen}>
      {() => (
        <div className='space-y-6 p-2'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Building2 className='h-5 w-5 text-primary' />
              <h2 className='text-xl font-semibold tracking-tight'>
                Assign to Room
              </h2>
            </div>
            <p className='text-sm text-muted-foreground'>
              Select a room to assign the selected images to.
            </p>
          </div>

          <div className='space-y-4'>
            <Select value={value} onValueChange={setValue}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select a room' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Available Rooms</SelectLabel>
                  {rooms?.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className='flex justify-end gap-3'>
              <Button
                variant='outline'
                onClick={() => {
                  setOpen(false);
                  setValue("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onReassign(value);
                  setValue("");
                }}
                disabled={!value}
                className='min-w-[100px]'
              >
                {loading ? (
                  <div className='flex items-center gap-2'>
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                    Assigning
                  </div>
                ) : (
                  "Assign"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default RoomReassignModal;
