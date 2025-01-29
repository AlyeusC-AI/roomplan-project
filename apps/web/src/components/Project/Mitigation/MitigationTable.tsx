import { useId, useMemo, useState } from "react";
import Select from "react-select";
import { roomStore } from "@atoms/room";
import EmptyState from "@components/DesignSystem/EmptyState";
import Pill from "@components/DesignSystem/Pills/Pill";
import { GroupByViews, PhotoViews } from "@servicegeek/db";
import useFilterParams from "@utils/hooks/useFilterParams";
import { trpc } from "@utils/trpc";
import { useParams, useRouter } from "next/navigation";
import { inferencesStore } from "@atoms/inferences";
import { uploadInProgressImagesStore } from "@atoms/upload-in-progress-image";

import OptimisticUploadUI from "../OptimisticUploadUI";

import FilterLabel from "./FilterLabel";
import GroupByPicker from "./GroupByPicker";
import PhotoList from "./PhotoList";
import ViewPicker from "./ViewPicker";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { LoadingSpinner } from "@components/ui/spinner";
import { Button } from "@components/ui/button";

export default function MitigationTable({
  initialGroupView,
  initialPhotoView,
}: {
  initialGroupView: GroupByViews;
  initialPhotoView: PhotoViews;
}) {
  const uploadInProgressImages = uploadInProgressImagesStore(
    (state) => state.images
  );
  const [isFilterOptionOpen, setIsFilterOptionOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const reactSelectId = useId();
  const [photoView, setPhotoView] = useState(initialPhotoView);
  const { rooms, onlySelected, sortDirection } = useFilterParams();

  const groupView = trpc.groupView.getGroupView.useQuery(undefined, {
    initialData: { groupView: initialGroupView },
  });

  const query = trpc.inferences.getAll.useQuery(
    {
      projectPublicId: id,
      rooms,
      onlySelected,
      sortDirection,
    },
    {
      initialData: { rooms: [] },
      onSuccess: (data: any) => {
        inferencesStore.getState().setInferences(data?.rooms || []);
      },
    }
  );

  const queryContext = {
    projectPublicId: id,
    rooms,
    onlySelected,
    sortDirection,
  };

  const getPhotos = trpc.photos.getProjectPhotos.useQuery(queryContext);

  const toggleFilterDrawer = () => {
    setIsFilterOptionOpen((prev) => !prev);
  };

  const setRoomFilter = (newRoomsFilter: string[]) => {
    const { ...rest } = router.query;
    let newQuery = {
      ...router.query,
      rooms: JSON.stringify(newRoomsFilter),
    };
    if (newRoomsFilter.length === 0) {
      newQuery = rest;
    }
    router.push({ query: newQuery }, undefined);
  };

  const setSortDirection = () => {
    router.push(
      {
        query: {
          sortDirection: sortDirection === "asc" ? "desc" : "asc",
        },
      },
      undefined
    );
  };

  const setOnlySelected = (checked: boolean) => {
    if (!checked) {
      router.push({ query: { ...rest } }, undefined);
      return;
    }
    router.push(
      {
        query: {
          onlySelected: true,
        },
      },
      undefined
    );
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

  return (
    <div className='space-y-6'>
      <div className='mt-6'>
        <div className='flex justify-between'>
          <div className='flex space-x-4'>
            <div>
              <FilterLabel>Filters</FilterLabel>
              <Button onClick={() => toggleFilterDrawer()}>
                <SlidersHorizontal className='mr-2 h-5' />
                Filter{" "}
                {(rooms || onlySelected) && (
                  <Pill className='ml-2' color='green' size='xs'>
                    {onlySelected && rooms ? 2 : 1}
                  </Pill>
                )}
              </Button>
            </div>
            <div>
              <FilterLabel>Sort</FilterLabel>
              <Button onClick={() => setSortDirection()}>
                {sortDirection === "desc" || !sortDirection ? (
                  <ChevronDown className='mr-2 h-5' />
                ) : (
                  <ChevronUp className='mr-2 h-5' />
                )}
                Sort
              </Button>
            </div>
            <ViewPicker photoView={photoView} setPhotoView={setPhotoView} />
            <GroupByPicker />
          </div>
          {query.isFetching && <LoadingSpinner />}
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
        <PhotoList
          photos={getPhotos.data ? getPhotos.data.images : []}
          queryContext={queryContext}
          groupBy={groupView.data?.groupView || GroupByViews.dateView}
          photoView={photoView}
        />
        {getPhotos.data &&
          getPhotos.data.images.length === 0 &&
          !rooms &&
          !onlySelected &&
          !uploadInProgressImages?.length && (
            <EmptyState
              imagePath={"/images/no-uploads.svg"}
              title={"Get started by uploading photos"}
              description={
                "Once uploaded, we will sort your photos by room as well as identify items within each picture."
              }
            />
          )}
      </div>
    </div>
  );
}
