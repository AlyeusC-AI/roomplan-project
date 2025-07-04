import { useState } from "react";
import { useId, useMemo } from "react";
import Select from "react-select";
import Modal from "@components/DesignSystem/Modal";

// import CreateAccessLink from "../CreateAccessLink";
// import DownloadAllRoomImages from "../DownloadAllRoomImages";
import ImageUploadModal from "./ImageUploadModal";
import RoomCreationModal from "../rooms/RoomCreationModal";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Switch } from "@components/ui/switch";
import { Label } from "@components/ui/label";
import { Dialog } from "@components/ui/dialog";
import ViewPicker from "./filter/ViewPicker";
import GroupByPicker from "./filter/GroupByPicker";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { ChevronDown, PlusCircle, SlidersHorizontal } from "lucide-react";
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
    <div className='flex flex-wrap justify-between items-center'>
      {/* <div>
        <h3 className='text-lg font-medium'>Upload Photos</h3>
        <p className='text-sm text-muted-foreground'>
          Upload photos of the job site. Take photos easily right from your
          phone or upload directly from your computer.
        </p>
      </div> */}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='secondary' className='flex items-center gap-2'>
            <SlidersHorizontal className='h-4 w-4' />
            Filters
            {((rooms?.length ?? 0) > 0 || onlySelected) && (
              <Badge variant='secondary' className='ml-1 px-1.5 py-0 text-xs'>
                {(rooms?.length ?? 0) + (onlySelected ? 1 : 0)}
              </Badge>
            )}
            <ChevronDown className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' className='flex flex-col min-w-64 p-4 mt-1'>
          {/* Room Filter */}
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Rooms</Label>
            <Select<RoomOption, true>
              instanceId={reactSelectId}
              options={roomsOptions}
              isMulti
              defaultValue={defaultRooms}
              onChange={(newValue) =>
                setRoomFilter(newValue.map((value) => value.value))
              }
              className='text-sm'
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: '32px',
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

          <Separator className="my-3" />

          {/* Include in Report Toggle */}
          <div className='flex items-center gap-2'>
            <Switch
              id='report-filter'
              checked={onlySelected}
              onCheckedChange={setOnlySelected}
            />
            <Label
              htmlFor='report-filter'
              className='text-sm font-medium'
            >
              Show included only in report
            </Label>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className='flex flex-row gap-4'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='secondary' className='flex items-center gap-2'>
              View
              <ChevronDown className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' className='flex flex-col min-w-48 p-4 mt-1'>
            <ViewPicker />
            <Separator className="my-3" />
            <GroupByPicker />
            <Separator className="my-3" />
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
