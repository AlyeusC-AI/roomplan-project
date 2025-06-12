import clsx from "clsx";
import { format, formatDistance } from "date-fns";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { Check, Star, Loader2, GripVertical, Pencil } from "lucide-react";
import { Button } from "@components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";
import { Card } from "@components/ui/card";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Image,
  useCurrentUser,
  useBulkUpdateImages,
  useUpdateImagesOrder,
  useUpdateImage,
  uploadImage,
  uploadFile,
} from "@service-geek/api-client";
import { userPreferenceStore } from "@state/user-prefrence";
import ImageEditorModal from "./ImageEditorModal";

const Photo = ({
  photo,
  onPhotoClick,
  onSelectPhoto,
  isSelected,
  id,
  isDraggable = false,
}: {
  photo: Image;
  onPhotoClick: (id: string) => void;
  onSelectPhoto: (photo: Image) => void;
  isSelected: boolean;
  id: string;
  isDraggable?: boolean;
}) => {
  const supabaseUrl = photo.url;
  const { savedPhotoView, savedPhotoGroupBy } = userPreferenceStore();
  const { id: projectId } = useParams<{ id: string }>();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const bulkUpdateImages = useBulkUpdateImages();
  const updateImage = useUpdateImage();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const toggleIncludeInReport = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isUpdating) return;

    try {
      setIsUpdating(true);

      await bulkUpdateImages.mutateAsync({
        projectId,
        filters: {
          ids: [photo.id],
          type: "ROOM",
        },
        updates: {
          showInReport: !photo.showInReport,
        },
      });

      toast.success("Image updated successfully");
    } catch (error) {
      console.error("Error updating image:", error);
      toast.error("Failed to update image");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectPhoto(photo);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSaveEdit = async (editedImageUrl: string) => {
    try {
      setIsUpdating(true);
      await bulkUpdateImages.mutateAsync({
        projectId,
        filters: {
          ids: [photo.id],
          type: "ROOM",
        },
        updates: {
          showInReport: photo.showInReport,
          order: photo.order,
        },
      });
      toast.success("Image updated successfully");
    } catch (error) {
      console.error("Error updating image:", error);
      toast.error("Failed to update image");
    } finally {
      setIsUpdating(false);
    }
  };

  const StarButton = ({ className = "" }: { className?: string }) => (
    <Button
      size='icon'
      variant='outline'
      className={clsx("bg-white", className)}
      disabled={isUpdating}
      onClick={(e) => {
        e.stopPropagation();
        toggleIncludeInReport();
      }}
    >
      {isUpdating ? (
        <Loader2 className='h-4 w-4 animate-spin' />
      ) : (
        <Star
          className={clsx(
            "size-6",
            !photo.showInReport && "text-gray-500",
            photo.showInReport && "fill-yellow-400 text-yellow-400"
          )}
        />
      )}
    </Button>
  );

  if (!supabaseUrl) return null;

  if (savedPhotoView === "photoGridView") {
    return (
      <div ref={setNodeRef} style={style}>
        <div className='relative'>
          {isDraggable && (
            <button
              {...attributes}
              {...listeners}
              className='absolute left-2 top-2 z-20'
            >
              <GripVertical className='h-5 w-5 text-white' />
            </button>
          )}
          <div
            className='group relative block size-44 cursor-pointer overflow-hidden rounded-lg'
            onClick={(e) => {
              e.stopPropagation();
              onPhotoClick(photo.id);
            }}
          >
            <div
              className={clsx(
                "absolute inset-0 z-10 flex flex-col items-end justify-start gap-1 bg-black/40 p-2 opacity-0 transition-opacity group-hover:opacity-100",
                isSelected && "opacity-100"
              )}
            >
              <Button
                size='icon'
                variant='outline'
                className='bg-white'
                onClick={handleEdit}
              >
                <Pencil />
              </Button>
              <StarButton />
              <Button
                size='icon'
                variant='outline'
                className='bg-white'
                onClick={handleSelect}
              >
                <div
                  className={clsx(
                    "flex size-4 items-center justify-center rounded-full border",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-gray-300 bg-white"
                  )}
                >
                  {isSelected && <Check className='size-3 text-white' />}
                </div>
              </Button>
            </div>
            <img
              src={supabaseUrl}
              alt=''
              className='h-full w-full object-cover'
              // style={{ width: "100%", height: "100%" }}
            />
          </div>
          <div
            className={clsx(
              "w-full text-primary",
              savedPhotoGroupBy === "room" && "py-2"
            )}
          >
            <div className='flex items-center justify-between'>
              <div className='flex flex-1 flex-col justify-between'>
                {savedPhotoGroupBy === "room" && (
                  <div className='text-xs font-semibold'>
                    <p>
                      {format(
                        new Date(photo.createdAt),
                        "eee, MMM d, yyyy 'at' h:mm a"
                      )}
                    </p>
                  </div>
                )}
                <div className='text-xs'>
                  {formatDistance(new Date(photo.createdAt), Date.now(), {
                    addSuffix: true,
                  })}
                  {photo?.comments?.length > 0 && (
                    <div className='text-xs'>
                      {photo?.comments?.length} comments
                    </div>
                  )}
                </div>
              </div>
              {/* <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <StarButton className='group flex size-10 cursor-pointer' />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle to show image in final report.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider> */}
            </div>
          </div>
        </div>

        <ImageEditorModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          imageUrl={supabaseUrl}
          onSave={async (base64Image) => {
            const { signedUrl, publicUrl, key } = await uploadFile(
              base64Image,
              photo.id + ".png"
            );
            console.log("🚀 ~ onSave ~ signedUrl:", signedUrl);
            console.log("🚀 ~ onSave ~ publicUrl:", publicUrl);
            console.log("🚀 ~ onSave ~ key:", key);
            updateImage.mutate({
              imageId: photo.id,
              data: {
                url: publicUrl,
              },
            });
          }}
        />
      </div>
    );
  }

  // List view
  return (
    <div ref={setNodeRef} style={style}>
      <Card className='mb-2 border border-gray-200 shadow-sm transition-colors hover:border-gray-300'>
        <div className='flex cursor-pointer p-2'>
          {isDraggable && (
            <button {...attributes} {...listeners} className='mr-2'>
              <GripVertical className='h-5 w-5 text-gray-400' />
            </button>
          )}
          <div className='mr-2 flex items-center justify-center'>
            <div
              className={clsx(
                "flex size-6 items-center justify-center rounded-full border",
                isSelected
                  ? "border-primary bg-primary"
                  : "border-gray-300 bg-white"
              )}
            >
              {isSelected && <Check className='size-4 text-white' />}
            </div>
          </div>
          <div
            className='group relative block size-24 cursor-pointer overflow-hidden rounded-lg'
            onClick={(e) => {
              e.stopPropagation();
              onPhotoClick(photo.id);
            }}
          >
            <img src={supabaseUrl} alt='' className='h-full w-auto' />
          </div>
          <div className='flex w-full flex-1 items-center justify-between'>
            <div className='flex flex-col justify-start pl-8'>
              <div className='text-sm font-semibold text-foreground'>
                {format(
                  new Date(photo.createdAt),
                  "eee, MMM d, yyyy 'at' h:mm a"
                )}
              </div>
              <div className='text-sm text-muted-foreground'>
                {formatDistance(new Date(photo.createdAt), Date.now(), {
                  addSuffix: true,
                })}
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Button size='icon' variant='outline' onClick={handleEdit}>
                <Pencil className='h-4 w-4' />
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <StarButton className='group flex size-10 cursor-pointer' />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle to show image in final report.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </Card>

      <ImageEditorModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        imageUrl={supabaseUrl}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default Photo;
