import React, { useState, useMemo } from "react";
import EmptyState from "@components/DesignSystem/EmptyState";
import useFilterParams from "@utils/hooks/useFilterParams";
import { format } from "date-fns";
import produce from "immer";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import PhotoGroup from "./PhotoGroup";
import RoomReassignModal from "./RoomReassignModal";
import TheaterMode from "./TheaterMode";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import TagsModal from "@components/tags/TagsModal";
import { Trash2, FolderInput, X, Loader2, Star, Tag } from "lucide-react";
import {
  Image,
  useBulkUpdateImages,
  useGetRooms,
  useBulkRemoveImages,
  useAddImageTags,
  useGetTags,
} from "@service-geek/api-client";
import { userPreferenceStore } from "@state/user-prefrence";

const PhotoList = ({
  photos,
  refetch,
}: {
  photos?: Image[];
  refetch: () => void;
}) => {
  const { id } = useParams<{ id: string }>();
  const [theaterModeIndex, setTheaterModeIndex] = useState(0);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isRoomReassignOpen, setIsRoomReassignOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAssigningRoom, setIsAssigningRoom] = useState(false);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);
  const { rooms, onlySelected } = useFilterParams();
  const [selectedPhotos, setSelectedPhotos] = useState<Image[]>([]);
  const { mutate: bulkUpdateImages } = useBulkUpdateImages();
  const { mutate: bulkRemoveImages } = useBulkRemoveImages();
  const { mutateAsync: addImageTags } = useAddImageTags();
  const savedPhotoGroupBy = userPreferenceStore(
    (state) => state.savedPhotoGroupBy
  );
  const { data: roomsData } = useGetRooms(id);

  // Extract all unique tags from photos
  const allTags = useMemo(() => {
    if (!photos) return [];

    const tagMap = new Map<string, { tag: any; count: number }>();

    photos.forEach((photo) => {
      if (photo.tags && photo.tags.length > 0) {
        photo.tags.forEach((tag) => {
          const existing = tagMap.get(tag.name);
          if (existing) {
            existing.count += 1;
          } else {
            tagMap.set(tag.name, { tag, count: 1 });
          }
        });
      }
    });

    return Array.from(tagMap.values())
      .sort((a, b) => b.count - a.count) // Sort by frequency
      .map((item) => item.tag);
  }, [photos]);

  // Filter photos based on selected tag
  const filteredPhotos = useMemo(() => {
    if (!photos) return [];
    if (selectedTagFilters.length === 0) return photos;

    // Check if "untagged" is selected
    const hasUntaggedFilter = selectedTagFilters.includes("untagged");
    const hasOtherFilters = selectedTagFilters.some(
      (tag) => tag !== "untagged"
    );

    return photos.filter((photo) => {
      const hasTags = photo.tags && photo.tags.length > 0;
      const photoTagNames = hasTags ? photo.tags.map((tag) => tag.name) : [];

      // If only "untagged" is selected
      if (hasUntaggedFilter && !hasOtherFilters) {
        return !hasTags;
      }

      // If "untagged" and other tags are selected
      if (hasUntaggedFilter && hasOtherFilters) {
        const otherSelectedTags = selectedTagFilters.filter(
          (tag) => tag !== "untagged"
        );
        return (
          !hasTags ||
          otherSelectedTags.some((tag) => photoTagNames.includes(tag))
        );
      }

      // If only other tags are selected
      return selectedTagFilters.some((tag) => photoTagNames.includes(tag));
    });
  }, [photos, selectedTagFilters]);

  const handleTagFilterToggle = (tagName: string) => {
    setSelectedTagFilters((prev) => {
      if (prev.includes(tagName)) {
        return prev.filter((tag) => tag !== tagName);
      } else {
        return [...prev, tagName];
      }
    });
  };

  const clearAllTagFilters = () => {
    setSelectedTagFilters([]);
  };

  const includeAllInReport = async () => {
    // if (!photos) return;

    try {
      setIsUpdatingAll(true);
      bulkUpdateImages({
        projectId: id,
        filters: {
          type: "ROOM",
          // ids: photos.map((img) => img.id),
        },
        updates: {
          showInReport: true,
        },
      });

      toast.success("All images included in report");
    } catch (error) {
      console.log("🚀 ~ includeAllInReport ~ error:", error);
      // toast.error("Failed to update images");
    } finally {
      setIsUpdatingAll(false);
    }
  };

  const onPhotoClick = (key: string) => {
    const photoIndex = filteredPhotos?.findIndex((p) => p.id === key);
    if (photoIndex !== undefined && photoIndex >= 0) {
      setTheaterModeIndex(photoIndex);
      setIsTheaterMode(true);
    }
  };

  if (!photos) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <LoadingPlaceholder />
      </div>
    );
  }

  if (
    filteredPhotos.length === 0 &&
    (rooms || onlySelected || selectedTagFilters.length > 0)
  ) {
    return (
      <div className='flex size-full min-h-[400px] items-center justify-center rounded-lg bg-gray-50'>
        <EmptyState
          title='No photos match your filter criteria'
          imagePath='/images/void.svg'
          description='Try removing a few options'
          height={1038}
          width={995}
        />
      </div>
    );
  }

  let grouped: Record<string, Image[]> = {};
  if (savedPhotoGroupBy === "date") {
    grouped = filteredPhotos.reduce(
      (prev, photo) => {
        const day = format(new Date(photo.createdAt), "eee, MMM d, yyyy");
        return {
          ...prev,
          [day]: [...(prev[day] || []), photo],
        };
      },
      {} as Record<string, Image[]>
    );
  } else {
    grouped =
      roomsData?.reduce((prev, room) => {
        const images = filteredPhotos.filter(
          (photo) => photo.roomId === room.id
        );

        return {
          ...prev,
          [room.name]: images,
        };
      }, {}) || {};
  }

  const onSelectPhoto = (photo: Image, selectAllFromGroup?: Image[]) => {
    // If selectAllFromGroup is provided, it means we're selecting all photos from a group
    if (selectAllFromGroup) {
      const newSelectedPhotos = [...selectedPhotos];

      selectAllFromGroup.forEach((groupPhoto) => {
        const isAlreadySelected = newSelectedPhotos.some(
          (p) => p.id === groupPhoto.id
        );
        if (!isAlreadySelected) {
          newSelectedPhotos.push(groupPhoto);
        }
      });

      setSelectedPhotos(newSelectedPhotos);
      return;
    }

    // Individual photo selection (toggle behavior)
    const photoIndex = selectedPhotos.findIndex((p) => p.id === photo.id);
    if (photoIndex === undefined || photoIndex === -1) {
      setSelectedPhotos([...selectedPhotos, photo]);
      return;
    } else if (photoIndex >= 0) {
      setSelectedPhotos((prev) =>
        produce(prev, (draft) => {
          const prevIndex = prev.findIndex((p) => p.id === photo.id);
          if (prevIndex >= 0) {
            draft.splice(prevIndex, 1);
          }
        })
      );
    }
  };

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      console.log("🚀 ~ onDelete ~ selectedPhotos:", selectedPhotos);

      await bulkRemoveImages({
        projectId: id,
        filters: {
          type: "ROOM",
          ids: selectedPhotos.map((p) => p.id),
        },
      });

      toast.success("Images deleted successfully");
      setSelectedPhotos([]);
    } catch (error) {
      console.error("Error deleting images:", error);
      // toast.error("Failed to delete images");
    } finally {
      setIsDeleting(false);
    }
  };

  const onUpdateRoom = async (roomId: string) => {
    try {
      setIsAssigningRoom(true);

      await bulkUpdateImages({
        projectId: id,
        filters: {
          type: "ROOM",
          ids: selectedPhotos.map((p) => p.id),
        },
        updates: { roomId },
      });

      toast.success("Room assigned successfully");
    } catch (error) {
      console.error("Error assigning room:", error);
      toast.error("Failed to assign room");
    } finally {
      setIsAssigningRoom(false);
      setSelectedPhotos([]);
      setIsRoomReassignOpen(false);
    }
  };

  const onAssignTags = async (tagNames: string[]) => {
    try {
      // Add tags to all selected images
      const promises = selectedPhotos.map(
        async (photo) =>
          await addImageTags({
            imageId: photo.id,
            tagNames,
          })
      );

      await Promise.all(promises);
      await refetch();
      toast.success("Tags assigned successfully");
      setSelectedPhotos([]);
    } catch (error) {
      console.error("Error assigning tags:", error);
      toast.error("Failed to assign tags");
    }
  };

  return (
    <div className='flex flex-col gap-4 '>
      {/* <div className='flex justify-end'>
        <Button
          size='sm'
          variant='outline'
          onClick={includeAllInReport}
          disabled={isUpdatingAll || !photos?.length}
          className='flex items-center gap-2'
        >
          {isUpdatingAll ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Star className='h-4 w-4' />
          )}
          Include All in Report
        </Button>
      </div> */}

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className='space-y-3'>
          {/* <div className='flex items-center justify-between'>
            <h3 className='text-sm font-medium text-gray-900'>
              Filter by Tags:
            </h3>
            {selectedTagFilters.length > 0 && (
              <Button
                variant='outline'
                size='sm'
                onClick={clearAllTagFilters}
                className='text-xs'
              >
                Clear All
              </Button>
            )}
          </div> */}
          <div className="flex justify-between">
            <div className="space-y-3">
              <div className='flex flex-wrap gap-2'>
                <Button
                  variant={selectedTagFilters.length === 0 ? "default" : "outline"}
                  size='sm'
                  onClick={clearAllTagFilters}
                  className='flex items-center gap-2'
                >
                  <Tag className='h-4 w-4' />
                  All Photos ({photos.length})
                </Button>
                <Button
                  variant={
                    selectedTagFilters.includes("untagged") ? "default" : "outline"
                  }
                  size='sm'
                  onClick={() => handleTagFilterToggle("untagged")}
                  className='flex items-center gap-2'
                >
                  Untagged (
                  {photos.filter((p) => !p.tags || p.tags.length === 0).length})
                </Button>
                {allTags.map((tag) => {
                  const count = photos.filter(
                    (p) => p.tags && p.tags.some((t) => t.name === tag.name)
                  ).length;
                  const isSelected = selectedTagFilters.includes(tag.name);
                  return (
                    <Button
                      key={tag.id}
                      variant={isSelected ? "default" : "outline"}
                      size='sm'
                      onClick={() => handleTagFilterToggle(tag.name)}
                      className='flex items-center gap-2'
                      style={
                        isSelected && tag.color
                          ? {
                            backgroundColor: tag.color,
                            borderColor: tag.color,
                            color: "white",
                          }
                          : tag.color
                            ? {
                              backgroundColor: `${tag.color}15`,
                              borderColor: tag.color,
                              color: tag.color,
                            }
                            : {}
                      }
                    >
                      {tag.name} ({count})
                    </Button>
                  );
                })}
              </div>
              {selectedTagFilters.length > 0 && (
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <span>Showing photos with:</span>
                  <div className='flex flex-wrap gap-1'>
                    {selectedTagFilters.map((tagName) => (
                      <Badge
                        key={tagName}
                        variant='secondary'
                        className='cursor-pointer'
                        onClick={() => handleTagFilterToggle(tagName)}
                      >
                        {tagName === "untagged" ? "Untagged" : tagName}
                        <span className='ml-1 text-xs'>×</span>
                      </Badge>
                    ))}
                  </div>
                  {selectedTagFilters.length > 0 && (
              <Button
                variant='outline'
                size='sm'
                onClick={clearAllTagFilters}
                className='text-xs'
              >
                Clear All
              </Button>
            )}
                </div>
              )}
            </div>
            <Button
              size='sm'
              variant='outline'
              onClick={includeAllInReport}
              disabled={isUpdatingAll || !photos?.length}
              className='flex items-center gap-2'
            >
              {isUpdatingAll ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Star className='h-4 w-4' />
              )}
              Include All in Report
            </Button>
          </div>
        </div>
      )}

      {/* Selected Photos UI */}
      <AnimatePresence>
        {selectedPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='bg-mint fixed left-[240px] right-4 top-4 z-50 rounded-lg border border-gray-200 p-4 shadow-lg'
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white/20'>
                  <span className='text-sm font-semibold text-white'>
                    {selectedPhotos.length}
                  </span>
                </div>
                <div>
                  <p className='text-sm font-medium text-white'>
                    {selectedPhotos.length} photo
                    {selectedPhotos.length > 1 ? "s" : ""} selected
                  </p>
                  <p className='text-xs text-white/80'>
                    Choose an action below
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => setIsRoomReassignOpen(true)}
                  disabled={isAssigningRoom}
                  className='flex items-center gap-2 border-white/30 bg-white/20 text-white hover:bg-white/30'
                >
                  {isAssigningRoom ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <FolderInput className='h-4 w-4' />
                  )}
                  Assign Room
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => setIsTagsModalOpen(true)}
                  className='flex items-center gap-2 border-white/30 bg-white/20 text-white hover:bg-white/30'
                >
                  <Tag className='h-4 w-4' />
                  Assign Tags
                </Button>
                <Button
                  size='sm'
                  variant='destructive'
                  onClick={onDelete}
                  disabled={isDeleting}
                  className='flex items-center gap-2'
                >
                  {isDeleting ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <Trash2 className='h-4 w-4' />
                  )}
                  Delete
                </Button>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => setSelectedPhotos([])}
                  disabled={isDeleting || isAssigningRoom}
                  className='flex items-center text-white hover:bg-white/20'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RoomReassignModal
        open={isRoomReassignOpen}
        setOpen={setIsRoomReassignOpen}
        onReassign={onUpdateRoom}
        loading={isAssigningRoom}
      />

      <TagsModal
        tagType='IMAGE'
        open={isTagsModalOpen}
        onOpenChange={setIsTagsModalOpen}
        title='Assign Tags to Images'
        description={`Select tags to assign to ${selectedPhotos.length} selected image${selectedPhotos.length > 1 ? "s" : ""}`}
        onAssignTags={onAssignTags}
        isAssignMode={true}
      />

      {isTheaterMode && (
        <TheaterMode
          open={isTheaterMode}
          setOpen={setIsTheaterMode}
          photos={filteredPhotos}
          theaterModeIndex={theaterModeIndex}
          setTheaterModeIndex={setTheaterModeIndex}
          refetch={refetch}
        />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='grid gap-8'
      >
        {Object.keys(grouped).map((day) => (
          <motion.div
            key={day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PhotoGroup
              day={day}
              photos={grouped[day]}
              onPhotoClick={onPhotoClick}
              onSelectPhoto={onSelectPhoto}
              selectedPhotos={selectedPhotos}
            // setPhotos={setPhotos}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default PhotoList;
