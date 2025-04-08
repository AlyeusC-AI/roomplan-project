import { useEffect, useId, useMemo, useState } from "react";
import Select from "react-select";
import { roomStore } from "@atoms/room";
import { imagesStore } from "@atoms/images";
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
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { urlMapStore } from "@atoms/url-map";
import { ScaleLoader } from "react-spinners";
import { Card } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { Switch } from "@components/ui/switch";
import { Label } from "@components/ui/label";

export default function MitigationTable() {
  const [isFilterOptionOpen, setIsFilterOptionOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const reactSelectId = useId();
  const { rooms, onlySelected, sortDirection } = useFilterParams();
  const [loading, setLoading] = useState(false);
  const urlMap = urlMapStore();
  const { images, setImages } = imagesStore();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/projects/${id}/images`)
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        setImages(data.images);
        urlMap.setUrlMap(data.urlMap);
      });
  }, []);

  const toggleFilterDrawer = () => {
    setIsFilterOptionOpen((prev) => !prev);
  };

  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const setOnlySelected = (checked: boolean) => {
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
        value: room.publicId,
      })),
    [roomList]
  );

  const defaultRooms = useMemo(
    () =>
      rooms
        ? rooms.map((room) => ({
            label: roomList.find((r) => r.publicId === room)?.name || room,
            value: room,
          }))
        : [],
    [rooms, roomList]
  );

  // Get filtered images
  const filteredImages = useMemo(() => {
    if (!images) return [];

    let filtered = [...images];

    // Apply room filter
    if (rooms && rooms.length > 0) {
      console.log("Filtering by rooms:", rooms);
      filtered = filtered.filter((img) => {
        if (!img) return false;
        // Get the room ID from the Inference data
        const roomId = img?.Inference?.[0]?.Room?.publicId;
        const matches = roomId && rooms.includes(roomId);
        if (!matches) {
          console.log("No match for image:", {
            imageId: img.id,
            roomId,
            availableRooms: rooms,
          });
        }
        return matches;
      });
    }

    // Apply selected filter
    if (onlySelected) {
      filtered = filtered.filter((img) => {
        if (!img) return false;
        return img.includeInReport === true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (!a || !b) return 0;
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }, [images, rooms, onlySelected, sortDirection]);

  // Debug logging for room selection
  useEffect(() => {
    if (rooms && rooms.length > 0) {
      console.log("Selected rooms:", rooms);
      console.log("Room options:", roomsOptions);
    }
  }, [rooms, roomsOptions]);

  return (
    <div className='space-y-4'>
      <div className='p-4'>
        <div className='relative'>
          {/* Top Controls Bar */}
          <div className='flex items-end gap-4'>
            <div className='flex flex-wrap items-center gap-2'>
              <div>
                <FilterLabel>Filters</FilterLabel>

                <Button
                  variant={isFilterOptionOpen ? "default" : "outline"}
                  size='sm'
                  onClick={() => toggleFilterDrawer()}
                  className='flex items-center gap-1.5'
                >
                  <SlidersHorizontal className='h-3.5 w-3.5' />
                  Filters
                  {((rooms?.length ?? 0) > 0 || onlySelected) && (
                    <Badge
                      variant='secondary'
                      className='ml-1 px-1.5 py-0 text-xs'
                    >
                      {(rooms?.length ?? 0) + (onlySelected ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </div>
              <div>
                <FilterLabel>Sort</FilterLabel>

                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setSortDirection()}
                  className='flex items-center gap-1.5'
                >
                  {sortDirection === "desc" || !sortDirection ? (
                    <ChevronDown className='h-3.5 w-3.5' />
                  ) : (
                    <ChevronUp className='h-3.5 w-3.5' />
                  )}
                  Sort
                </Button>
              </div>
              <Separator orientation='vertical' className='h-6' />

              <ViewPicker />
              <GroupByPicker />
            </div>

            {/* Filter Options Panel */}
            {isFilterOptionOpen && (
              <div className='flex-1 rounded border bg-card p-2 text-sm shadow-sm'>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-3'>
                    <h3 className='whitespace-nowrap text-sm font-medium'>
                      Filters:
                    </h3>

                    <div className='min-w-[200px] flex-1'>
                      <Select
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

                    <div className='flex items-center gap-2 whitespace-nowrap'>
                      <Switch
                        id='report-filter'
                        checked={onlySelected}
                        onCheckedChange={setOnlySelected}
                      />
                      <Label
                        htmlFor='report-filter'
                        className='text-sm font-normal'
                      >
                        Show included only in report
                      </Label>
                    </div>
                  </div>

                  <Button
                    variant='ghost'
                    size='sm'
                    className='ml-auto h-6 w-6 p-0'
                    onClick={() => setIsFilterOptionOpen(false)}
                  >
                    <X className='h-3.5 w-3.5' />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <OptimisticUploadUI />
        {!loading && filteredImages.length === 0 ? (
          <EmptyState
            imagePath={"/images/no-uploads.svg"}
            title={"Get started by uploading photos"}
            description={
              "Once uploaded, we will sort your photos by room as well as identify items within each picture."
            }
          />
        ) : (
          <PhotoList photos={filteredImages} setPhotos={setImages} />
        )}
      </div>
    </div>
  );
}
