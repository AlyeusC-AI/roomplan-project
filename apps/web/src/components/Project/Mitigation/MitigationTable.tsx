import { useEffect, useId, useMemo, useState } from "react";
import Select from "react-select";
import { roomStore } from "@atoms/room";
import EmptyState from "@components/DesignSystem/EmptyState";
import useFilterParams from "@utils/hooks/useFilterParams";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import OptimisticUploadUI from "../OptimisticUploadUI";

import FilterLabel from "./FilterLabel";
import GroupByPicker from "./GroupByPicker";
import PhotoList from "./PhotoList";
import ViewPicker from "./ViewPicker";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { urlMapStore } from "@atoms/url-map";

export default function MitigationTable() {
  const [isFilterOptionOpen, setIsFilterOptionOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const reactSelectId = useId();
  const { rooms, onlySelected, sortDirection } = useFilterParams();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ImageQuery_Image[]>([]);
  const urlMap = urlMapStore();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/projects/${id}/images`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setLoading(false);
        setImages(data.images);
        urlMap.setUrlMap(data.urlMap);
      });
  }, []);

  const toggleFilterDrawer = () => {
    setIsFilterOptionOpen((prev) => !prev);
  };

  const pathname = usePathname();

  const setRoomFilter = (newRoomsFilter: string[]) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newRoomsFilter.length === 0) {
      params.delete("rooms");
    } else {
      params.set("rooms", JSON.stringify(newRoomsFilter));
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const setSortDirection = () => {
    const params = new URLSearchParams(searchParams.toString());

    const currentSortDirection = params.get("sortDirection") || "asc";
    const newSortDirection = currentSortDirection === "asc" ? "desc" : "asc";

    params.set("sortDirection", newSortDirection);

    router.push(`${pathname}?${params.toString()}`);
  };

  const searchParams = useSearchParams();

  const setOnlySelected = (checked: boolean) => {
    const router = useRouter();
    const params = new URLSearchParams(searchParams);

    if (!checked) {
      params.delete("onlySelected");
    } else {
      params.set("onlySelected", "true");
    }

    router.push(`?${params.toString()}`);
  };

  const roomList = roomStore((state) => state.rooms);

  const roomsOptions = useMemo(
    () =>
      roomList.map((room) => ({
        label: room.name,
        value: room.name,
      })),
    [roomList]
  );

  const defaultRooms = useMemo(
    () =>
      rooms
        ? rooms.map((room) => ({
            label: room,
            value: room,
          }))
        : [],
    [rooms]
  );

  if (!loading && images.length === 0) {
    return (
      <EmptyState
        imagePath={"/images/no-uploads.svg"}
        title={"Get started by uploading photos"}
        description={
          "Once uploaded, we will sort your photos by room as well as identify items within each picture."
        }
      />
    );
  }

  return (
    <div className='space-y-6'>
      <div className='mt-6'>
        <div className='flex justify-between'>
          <div className='flex space-x-4'>
            <div>
              <FilterLabel>Filters</FilterLabel>
              <Button variant='outline' onClick={() => toggleFilterDrawer()}>
                <SlidersHorizontal className='mr-2 h-5' />
                Filter{" "}
                {(rooms || onlySelected) && (
                  <Badge className='ml-2' color='green'>
                    {onlySelected && rooms ? 2 : 1}
                  </Badge>
                )}
              </Button>
            </div>
            <div>
              <FilterLabel>Sort</FilterLabel>
              <Button variant='outline' onClick={() => setSortDirection()}>
                {sortDirection === "desc" || !sortDirection ? (
                  <ChevronDown className='mr-2 h-5' />
                ) : (
                  <ChevronUp className='mr-2 h-5' />
                )}
                Sort
              </Button>
            </div>
            <ViewPicker />
            <GroupByPicker />
          </div>
        </div>
        {isFilterOptionOpen && (
          <div className='mt-6'>
            <div className='max-w-lg'>
              <label className='mb-2'>Filter by rooms</label>
              <Select
                instanceId={reactSelectId}
                options={roomsOptions}
                isMulti
                defaultValue={defaultRooms}
                onChange={(newValue) =>
                  setRoomFilter(newValue.map((value) => value.value))
                }
                styles={{ menu: (base) => ({ ...base, zIndex: 9999 }) }}
              />
            </div>
            <div className='mt-4 max-w-lg'>
              <label>Only show photos included in report</label>
              <input
                id='comments'
                aria-describedby='comments-description'
                name='comments'
                type='checkbox'
                className='ml-4 size-4 rounded border-gray-300 text-primary focus:ring-blue-500'
                onChange={(e) => setOnlySelected(e.target.checked)}
                {...(onlySelected && { checked: true })}
              />
            </div>
          </div>
        )}
      </div>
      <div className='my-6'>
        <OptimisticUploadUI />
        <PhotoList photos={images} setPhotos={setImages} />
      </div>
    </div>
  );
}
