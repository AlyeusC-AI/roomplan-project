import { useState } from "react";
import { useId, useMemo } from "react";
import Select from "react-select";
import Modal from "@components/DesignSystem/Modal";

// import CreateAccessLink from "../CreateAccessLink";
// import DownloadAllRoomImages from "../DownloadAllRoomImages";
import ImageUploadModal from "./ImageUploadModal";
import RoomCreationModal from "../rooms/RoomCreationModal";
import { Button } from "@components/ui/button";
import { Switch } from "@components/ui/switch";
import { Label } from "@components/ui/label";
import { Dialog } from "@components/ui/dialog";
import ViewPicker from "./filter/ViewPicker";
import GroupByPicker from "./filter/GroupByPicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { ChevronDown, PlusCircle, CalendarIcon, X } from "lucide-react";
import SortDirection from "./filter/SortDirection";
import { Separator } from "@components/ui/separator";
import { useGetRooms } from "@service-geek/api-client";
import useFilterParams from "@utils/hooks/useFilterParams";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { Calendar } from "@components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@lib/utils";

interface RoomOption {
  label: string;
  value: string;
}

export default function MitigationToolbar() {
  const [isRoomCreationModalOpen, setIsRoomCreationModalOpen] = useState(false);
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);

  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const reactSelectId = useId();
  const { rooms, onlySelected } = useFilterParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Date filter state (from URL or default to empty)
  const startDate = searchParams.get("createdAfter") || "";
  const endDate = searchParams.get("createdBefore") || "";
  const [startPopoverOpen, setStartPopoverOpen] = useState(false);
  const [endPopoverOpen, setEndPopoverOpen] = useState(false);

  // React Query hooks
  const { data: roomList = [] } = useGetRooms(id);

  const onPrimaryClick = () => {
    setIsImageUploadModalOpen(true);
  };

  const setRoomFilter = (newRoomsFilter: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newRoomsFilter.length === 0) {
      params.delete("rooms");
    } else {
      params.set("rooms", JSON.stringify(newRoomsFilter));
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const setDateFilter = (type: "startDate" | "endDate", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete(type);
    } else {
      params.set(type, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const setOnlySelected = (checked: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (!checked) {
      params.delete("onlySelected");
    } else {
      params.set("onlySelected", "true");
    }
    router.push(`?${params.toString()}`);
  };

  const roomsOptions: RoomOption[] = useMemo(
    () =>
      roomList.map((room) => ({
        label: room.name,
        value: room.id,
      })),
    [roomList]
  );

  const defaultRooms = useMemo(
    () =>
      rooms
        ? rooms.map((roomId) => ({
            label: roomList.find((r) => r.id === roomId)?.name || roomId,
            value: roomId,
          }))
        : [],
    [rooms, roomList]
  );

  return (
    <div className='flex flex-wrap items-center gap-4'>
      {/* Inline Filters: Start Date, End Date, Rooms */}
      <div className='flex items-end gap-2'>
        {/* Start Date */}
        <div className='flex flex-col'>
          <div className='relative shadow'>
            <Popover open={startPopoverOpen} onOpenChange={setStartPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className={cn(
                    "w-full !border-border pr-8 text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  {/* <CalendarIcon className='mr-2 h-4 w-4' /> */}
                  {startDate ? (
                    format(new Date(startDate), "PPP")
                  ) : (
                    <span>Start Date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0'>
                <Calendar
                  mode='single'
                  selected={startDate ? new Date(startDate) : undefined}
                  onSelect={(date) => {
                    setDateFilter(
                      "createdAfter",
                      date ? date.toISOString() : ""
                    );
                    setStartPopoverOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {startDate && (
              <Button
                variant='ghost'
                size='sm'
                className='absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-muted'
                onClick={() => setDateFilter("createdAfter", "")}
              >
                <X className='h-3 w-3' />
              </Button>
            )}
          </div>
        </div>
        {/* End Date */}
        <div className='flex flex-col'>
          <div className='relative shadow'>
            <Popover open={endPopoverOpen} onOpenChange={setEndPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className={cn(
                    "w-full !border-border pr-8 text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  {/* <CalendarIcon className='mr-2 h-4 w-4' /> */}
                  {endDate ? (
                    format(new Date(endDate), "PPP")
                  ) : (
                    <span>End Date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0'>
                <Calendar
                  mode='single'
                  selected={endDate ? new Date(endDate) : undefined}
                  onSelect={(date) => {
                    setDateFilter(
                      "createdBefore",
                      date ? date.toISOString() : ""
                    );
                    setEndPopoverOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {endDate && (
              <Button
                variant='ghost'
                size='sm'
                className='absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-muted'
                onClick={() => setDateFilter("createdBefore", "")}
              >
                <X className='h-3 w-3' />
              </Button>
            )}
          </div>
        </div>
        {/* Rooms Multi-select */}
        <div className='flex min-w-[200px] flex-col'>
          <Select<RoomOption, true>
            instanceId={reactSelectId}
            options={roomsOptions}
            isMulti
            value={defaultRooms}
            onChange={(newValue) =>
              setRoomFilter(newValue.map((value) => value.value))
            }
            className='text-sm'
            styles={{
              control: (base) => ({
                ...base,
                minHeight: "32px",
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
              input: (base) => ({
                ...base,
                margin: 0,
                padding: 0,
              }),
            }}
            placeholder='Select rooms...'
          />
        </div>
      </div>

      {/* Rest of the toolbar (View, Upload, Add Room, etc.) */}
      <div className='ml-auto flex flex-row gap-4'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='secondary' className='flex items-center gap-2'>
              View
              <ChevronDown className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='start'
            className='mt-1 flex min-w-48 flex-col p-4'
          >
            <ViewPicker />
            <Separator className='my-3' />
            <GroupByPicker />
            <Separator className='my-3' />
            <SortDirection />
          </DropdownMenuContent>
        </DropdownMenu>
        <div className='inline-flex rounded-md shadow-sm'>
          <Button onClick={onPrimaryClick} variant='default' type='button'>
            <PlusCircle />
            Upload Photos
          </Button>
        </div>
        <Dialog
          open={isImageUploadModalOpen}
          onOpenChange={setIsImageUploadModalOpen}
        >
          <ImageUploadModal setOpen={setIsImageUploadModalOpen} />
        </Dialog>
        <Button
          variant='default'
          onClick={() => setIsRoomCreationModalOpen(true)}
        >
          <PlusCircle />
          Add Room
        </Button>
        <Modal
          open={isRoomCreationModalOpen}
          setOpen={setIsRoomCreationModalOpen}
        >
          {(setOpen) => (
            <RoomCreationModal
              setOpen={setOpen}
              isOpen={isRoomCreationModalOpen}
            />
          )}
        </Modal>
        {/* <CreateAccessLink />
        <DownloadAllRoomImages /> */}
      </div>
    </div>
  );
}
