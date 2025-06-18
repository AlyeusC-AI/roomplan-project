import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import probe from "probe-image-size";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Save,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

import Notes from "@components/Project/overview/DetailsInput/Notes";
import { MentionMetadata } from "@components/DesignSystem/Mentions/useMentionsMetadata";
import {
  Image as ImageType,
  uploadFile,
  useAddComment,
  useCurrentUser,
  useGetProjectById,
  useRemoveImage,
  useUpdateImage,
} from "@service-geek/api-client";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import ImageEditorModal from "./ImageEditorModal";

// const TheaterModeSlideImage = ({
//   photo,
//   index,
//   theaterModeIndex,
//   onClick,
// }: {
//   photo: RouterOutputs["photos"]["getProjectPhotos"]["images"][0];
//   theaterModeIndex: number;
//   index: number;
//   onClick: (i: number) => void;
// }) => {
//   const supabaseUrl = useSupabaseImage(photo.key);
//   const ref = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     if (!ref.current) return;
//     if (index === theaterModeIndex) {
//       ref.current.scrollIntoView();
//     }
//   }, [index, ref, theaterModeIndex]);

//   return (
//     <div
//       key={`${photo.key}-slide`}
//       onClick={() => onClick(index)}
//       ref={ref}
//       className={clsx(
//         index === theaterModeIndex ? "border-green-500" : "border-white",
//         "group relative block size-[125px] cursor-pointer overflow-hidden rounded-lg border-4 bg-gray-100"
//       )}
//     >
//       {supabaseUrl && <BlurImage sizes='125px' src={supabaseUrl} alt='' />}
//     </div>
//   );
// };

export default function TheaterMode({
  open,
  setOpen,
  photos,
  theaterModeIndex,
  setTheaterModeIndex,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  photos: ImageType[];
  theaterModeIndex: number;
  setTheaterModeIndex: Dispatch<SetStateAction<number>>;
}) {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useGetProjectById(id);
  const { mutate: createImageNote } = useAddComment();
  const { mutate: deleteImage } = useRemoveImage();
  const { mutate: updateImage, isPending: isUpdating } = useUpdateImage();
  const [size, setSize] = useState<probe.ProbeResult | null>(null);
  const { data: user } = useCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState("");
  const [localDescription, setLocalDescription] = useState("");
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullWidth, setIsFullWidth] = useState(false);

  const ZOOM_STEP = 0.25;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3;
  const ZOOM_DURATION = 200;

  useEffect(() => {
    setDescription(photos[theaterModeIndex]?.description || "");
    setLocalDescription(photos[theaterModeIndex]?.description || "");
  }, [theaterModeIndex, photos]);

  const handleSaveDescription = () => {
    if (localDescription === description) {
      setIsEditingDescription(false);
      return;
    }

    updateImage(
      {
        imageId: photos[theaterModeIndex].id,
        data: { description: localDescription },
      },
      {
        onSuccess: () => {
          setDescription(localDescription);
          toast.success("Description updated successfully");
          setIsEditingDescription(false);
        },
        onError: () => {
          toast.error("Failed to update description");
          setLocalDescription(description);
        },
      }
    );
  };

  const handleCancel = () => {
    setLocalDescription(description);
    setIsEditingDescription(false);
  };

  const handleAddProjectNote = async ({
    note,
    // mentions,
    // metadata,
  }: {
    note: string;
    // mentions: string[];
    // metadata: MentionMetadata[];
  }) => {
    await createImageNote({
      imageId: photos[theaterModeIndex].id,
      data: {
        content: note,
        userId: user?.id!,
        // mentions,
        // metadata,
      },
    });
    toast.success("Note added successfully");
  };

  useEffect(() => {
    const updateSize = async () => {
      if (photos[theaterModeIndex].url) {
        const size = await probe(photos[theaterModeIndex].url);
        setSize(size);
      }
    };
    updateSize();
  }, [photos[theaterModeIndex].url]);

  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }) => {
      if (keyCode === 37) {
        setTheaterModeIndex((prev) => (prev - 1 < 0 ? 0 : prev - 1));
      } else if (keyCode === 39) {
        setTheaterModeIndex((prev) =>
          prev + 1 > photos.length - 1 ? photos.length - 1 : prev + 1
        );
      }
    };
    window.addEventListener("keydown", keyHandler);

    return () => {
      window.removeEventListener("keydown", keyHandler);
    };
  }, [photos]);

  const calculateContainerSize = () => {
    if (containerRef.current) {
      setContainerSize({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    }
  };

  useEffect(() => {
    calculateContainerSize();
    window.addEventListener("resize", calculateContainerSize);
    return () => window.removeEventListener("resize", calculateContainerSize);
  }, []);

  const handleZoom = (newScale: number, center?: { x: number; y: number }) => {
    const boundedScale = Math.min(Math.max(newScale, MIN_ZOOM), MAX_ZOOM);
    setScale(boundedScale);

    if (center && containerRef.current) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      // Calculate the center point relative to the container
      const centerX = center.x - rect.left;
      const centerY = center.y - rect.top;

      // Calculate the current position of the center point
      const currentCenterX = centerX - position.x;
      const currentCenterY = centerY - position.y;

      // Calculate the new position to keep the center point fixed
      const newX = centerX - (currentCenterX * boundedScale) / scale;
      const newY = centerY - (currentCenterY * boundedScale) / scale;

      setPosition({ x: newX, y: newY });
    }
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newScale = scale + delta;

    if (imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect();
      const center = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      handleZoom(newScale, center);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    handleZoom(scale + ZOOM_STEP);
  };

  const handleZoomOut = () => {
    handleZoom(scale - ZOOM_STEP);
  };

  const handleFullWidth = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleDownload = async () => {
    if (photos[theaterModeIndex].url) {
      try {
        // Fetch the image
        const response = await fetch(photos[theaterModeIndex].url);
        const blob = await response.blob();

        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);

        // Create a temporary link element
        const link = document.createElement("a");
        link.href = url;

        // Set the download attribute with a proper filename
        const timestamp = new Date().toISOString().split("T")[0];
        const filename = `image-${theaterModeIndex + 1}-${timestamp}.jpg`;
        link.download = filename;

        // Append to body, click, and cleanup
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup the blob URL
        window.URL.revokeObjectURL(url);

        toast.success("Image downloaded successfully");
      } catch (error) {
        console.error("Download failed:", error);
        toast.error("Failed to download image");
      }
    }
  };
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleting(true);
    deleteImage(photos[theaterModeIndex].id, {
      onSuccess: () => {
        toast.success("Image deleted successfully");
        setOpen(false);
        setShowDeleteConfirm(false);
      },
      onError: () => {
        toast.error("Failed to delete image");
        setIsDeleting(false);
      },
    });
  };

  useEffect(() => {
    const container = imageContainerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, [scale, position]);

  // Reset position and scale when changing images
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [theaterModeIndex]);

  const handleEdit = () => {
    setIsEditing(true);
    // setOpen(false);
  };

  const handleSaveEdit = async (editedImageUrl: string) => {
    const supabaseUrl = await uploadFile(editedImageUrl, "image.jpeg");
    try {
      await updateImage({
        imageId: photos[theaterModeIndex].id,
        data: {
          url: supabaseUrl.publicUrl,
        },
      });
      toast.success("Image updated successfully");
    } catch (error) {
      console.error("Error updating image:", error);
      toast.error("Failed to update image");
    }
  };

  if (isEditing)
    return (
      <ImageEditorModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        imageUrl={photos[theaterModeIndex].url}
        onSave={handleSaveEdit}
      />
    );

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {/* <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-gray-500/75 transition-opacity' />
        </Transition.Child> */}

        <DialogContent
          className={cn(
            "h-screen w-screen max-w-none p-0",
            isFullWidth && "max-w-none"
          )}
        >
          <div className='size-full overflow-y-auto rounded-lg bg-background'>
            <div
              className={cn(
                "flex size-full overflow-y-auto rounded-lg bg-background",
                isFullWidth && "flex-col"
              )}
            >
              <div
                className={cn(
                  "relative flex size-full items-center justify-center overflow-y-auto align-middle"
                )}
              >
                {size && photos[theaterModeIndex].url && (
                  <div className='group relative size-full'>
                    <div
                      ref={containerRef}
                      className='relative size-full overflow-y-auto bg-black'
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      style={{
                        cursor:
                          scale > 1
                            ? isDragging
                              ? "grabbing"
                              : "grab"
                            : "default",
                      }}
                    >
                      <div
                        className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 ease-in-out'
                        style={{
                          transform: `translate(-50%, -50%) scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                        }}
                      >
                        <Image
                          src={photos[theaterModeIndex].url}
                          width={size.width}
                          height={size.height}
                          alt=''
                          className='h-full w-full object-contain'
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                          }}
                        />
                      </div>
                    </div>

                    {/* Navigation Arrows */}
                    <div className='absolute inset-0 flex items-center justify-between px-16 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 rounded-full bg-white/90 text-black backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white disabled:opacity-0 disabled:hover:scale-100 disabled:hover:bg-white/90'
                        onClick={() =>
                          setTheaterModeIndex((prev) =>
                            prev - 1 < 0 ? 0 : prev - 1
                          )
                        }
                        disabled={theaterModeIndex === 0}
                      >
                        <ChevronLeft className='h-5 w-5 text-black transition-transform duration-300 group-hover:translate-x-[-2px]' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 rounded-full bg-white/90 text-black backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white disabled:opacity-0 disabled:hover:scale-100 disabled:hover:bg-white/90'
                        onClick={() =>
                          setTheaterModeIndex((prev) =>
                            prev + 1 > photos.length - 1
                              ? photos.length - 1
                              : prev + 1
                          )
                        }
                        disabled={theaterModeIndex === photos.length - 1}
                      >
                        <ChevronRight className='h-5 w-5 text-black transition-transform duration-300 group-hover:translate-x-[2px]' />
                      </Button>
                    </div>

                    {/* Utility Controls */}
                    <div className='absolute left-4 top-4 flex flex-row gap-1 opacity-0 transition-all duration-300 group-hover:opacity-100'>
                      <div className='flex flex-row gap-1.5 rounded-lg bg-white/90 p-1.5 backdrop-blur-sm'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 rounded-full bg-white/10 text-black transition-all duration-300 hover:scale-110 hover:bg-white/20'
                          onClick={handleZoomIn}
                          title='Zoom In'
                          disabled={scale >= MAX_ZOOM}
                        >
                          <ZoomIn className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 rounded-full bg-white/10 text-black transition-all duration-300 hover:scale-110 hover:bg-white/20'
                          onClick={handleZoomOut}
                          title='Zoom Out'
                          disabled={scale <= MIN_ZOOM}
                        >
                          <ZoomOut className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 rounded-full bg-white/10 text-black transition-all duration-300 hover:scale-110 hover:bg-white/20'
                          onClick={handleFullWidth}
                          title='Reset Zoom'
                          disabled={scale === 1}
                        >
                          <Maximize2 className='h-3.5 w-3.5' />
                        </Button>
                      </div>
                      <div className='flex flex-row gap-1.5 rounded-lg bg-white/90 p-1.5 backdrop-blur-sm'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 rounded-full bg-white/10 text-black transition-all duration-300 hover:scale-110 hover:bg-white/20'
                          onClick={() => setIsFullWidth(!isFullWidth)}
                          title={
                            isFullWidth ? "Exit Full Width" : "Enter Full Width"
                          }
                        >
                          <Maximize2
                            className={cn(
                              "h-3.5 w-3.5 transition-transform duration-300",
                              isFullWidth && "rotate-180"
                            )}
                          />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 rounded-full bg-white/10 text-black transition-all duration-300 hover:scale-110 hover:bg-white/20'
                          onClick={handleEdit}
                          title='Edit Image'
                        >
                          <Pencil className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 rounded-full bg-white/10 text-black transition-all duration-300 hover:scale-110 hover:bg-white/20'
                          onClick={handleDownload}
                          title='Download'
                        >
                          <Download className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 rounded-full bg-white/10 text-black transition-all duration-300 hover:scale-110 hover:bg-red-500/20'
                          onClick={handleDelete}
                          title='Delete'
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </Button>
                      </div>
                    </div>

                    {/* Zoom Level Indicator */}
                    {scale !== 1 && (
                      <div className='absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/20 px-3 py-1.5 text-sm text-white backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100'>
                        {Math.round(scale * 100)}%
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Side Panel */}
              {!isFullWidth && (
                <div className='w-full max-w-[350px] overflow-y-auto'>
                  <div className=''>
                    {/* Header */}
                    <div className='sticky top-0 bg-background px-4 py-6 sm:px-6'>
                      <div className='flex items-start justify-between space-x-3'>
                        <div className='space-y-1'>
                          <DialogTitle className='text-base font-semibold leading-6 text-foreground'>
                            {project?.data.name}
                          </DialogTitle>
                          <p className='text-sm text-gray-500'>
                            {project?.data.location}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Description Section */}
                    <div className='px-4 py-4'>
                      <div className='mb-2 flex items-center justify-between'>
                        <h3 className='text-sm font-medium text-foreground'>
                          Description
                        </h3>
                        <div className='flex items-center gap-2'>
                          {!isEditingDescription ? (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => setIsEditingDescription(true)}
                              className='h-8 w-8 p-0 hover:bg-muted/50'
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={handleCancel}
                                className='h-8 w-8 p-0 hover:bg-muted/50'
                                disabled={isUpdating}
                              >
                                <X className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={handleSaveDescription}
                                className='h-8 w-8 p-0 hover:bg-muted/50'
                                disabled={
                                  isUpdating || localDescription === description
                                }
                              >
                                {isUpdating ? (
                                  <Loader2 className='h-4 w-4 animate-spin' />
                                ) : (
                                  <Save className='h-4 w-4' />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "transition-all duration-200",
                          isEditingDescription
                            ? "rounded-md ring-1 ring-muted"
                            : ""
                        )}
                      >
                        {isEditingDescription ? (
                          <Textarea
                            value={localDescription}
                            onChange={(e) =>
                              setLocalDescription(e.target.value)
                            }
                            placeholder='Add a description...'
                            className='min-h-[100px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                            disabled={isUpdating}
                          />
                        ) : (
                          <p
                            className={cn(
                              "whitespace-pre-wrap rounded-md p-2 text-sm text-muted-foreground",
                              !description && "italic"
                            )}
                          >
                            {description || "No description added"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Divider container */}
                    <div className='space-y-6 py-6 sm:space-y-0 sm:divide-y sm:divide-gray-200 sm:py-0'></div>
                  </div>

                  {/* Action buttons */}
                  <div className='shrink-0 border-t px-4 py-5 sm:px-6'>
                    <Notes
                      image={photos[theaterModeIndex]}
                      isLoading={false}
                      handleAddProjectNote={handleAddProjectNote}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-destructive'>
              <AlertTriangle className='h-5 w-5' />
              Delete Image
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <div className='flex items-center gap-4 rounded-lg border bg-background p-4'>
              {photos[theaterModeIndex].url && (
                <div className='relative h-16 w-16 overflow-hidden rounded-md'>
                  <Image
                    src={photos[theaterModeIndex].url}
                    alt=''
                    fill
                    className='object-cover'
                  />
                </div>
              )}
              <div className='flex-1'>
                <p className='text-sm font-medium'>
                  Image {theaterModeIndex + 1}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {size ? `${size.width} × ${size.height}` : "Loading..."}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className='gap-2'
            >
              {isDeleting ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className='h-4 w-4' />
                  Delete Image
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
