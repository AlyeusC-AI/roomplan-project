import useSupabaseImage from "@utils/hooks/useSupabaseImage";
import clsx from "clsx";
import { format, formatDistance } from "date-fns";
import { useParams } from "next/navigation";

import { Check, Star } from "lucide-react";
import { Button } from "@components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";
import { Card } from "@components/ui/card";
import { userInfoStore } from "@atoms/user-info";

const Photo = ({
  photo,
  onPhotoClick,
  onSelectPhoto,
  selectedPhotos,
  setPhotos,
}: {
  photo: ImageQuery_Image;
  selectedPhotos: ImageQuery_Image[];
  onPhotoClick: (key: string) => void;
  onSelectPhoto: (photo: ImageQuery_Image) => void;
  setPhotos: React.Dispatch<React.SetStateAction<ImageQuery_Image[]>>;
}) => {
  const supabaseUrl = useSupabaseImage(photo.key);
  // const utils = trpc.useUtils();
  const user = userInfoStore();
  const { id } = useParams<{ id: string }>();

  // const setIncludeInReport = trpc.photos.setIncludeInReport.useMutation({
  //   async onMutate({ includeInReport }) {
  //     await utils.photos.getProjectPhotos.cancel();
  //     const prevData = utils.photos.getProjectPhotos.getData(queryContext);
  //     const updatedData = produce(prevData, (draft) => {
  //       if (!draft) return draft;
  //       const i = draft.images?.findIndex((p) => p.publicId === photo.publicId);
  //       if (i !== undefined && i >= 0) {
  //         draft.images[i].includeInReport = includeInReport;
  //       }
  //       return draft;
  //     });

  //     utils.photos.getProjectPhotos.setData(queryContext, updatedData);
  //     return { prevData };
  //   },
  //   onSettled() {
  //     utils.photos.getProjectPhotos.invalidate();
  //   },
  // });

  const onToggle: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.stopPropagation();
    // setIncludeInReport.mutate({
    //   projectPublicId: id,
    //   includeInReport: !photo.includeInReport,
    //   imagePublicId: photo.publicId,
    // });
    await fetch(`/api/v1/projects/${id}/images`, {
      method: "PATCH",
      body: JSON.stringify({
        id: photo.publicId,
        includeInReport: !photo.includeInReport,
      }),
    });

    setPhotos((prev) => {
      const updated = prev.map((p) => {
        if (p.key === photo.key) {
          return {
            ...p,
            includeInReport: !photo.includeInReport,
          };
        }
        return p;
      });
      return updated;
    });
  };
  const handleFlash = () => {
    const flash = document.getElementById("flash");
    if (flash) {
      flash.classList.remove("show");
      setTimeout(() => {
        flash.remove();
      }, 3000);
    }
  };

  if (!supabaseUrl) return null;
  const isPhotoSelected = selectedPhotos.find((p) => p.key === photo.key);

  return (
    <>
      {user.user?.photoView === "photoGridView" ? (
        <div className='group relative'>
          <div
            className='group relative block size-64 cursor-pointer overflow-hidden rounded-lg group-hover:bg-black'
            onClick={(e) => {
              e.stopPropagation();
              onPhotoClick(photo.key);
            }}
          >
            <div
              className={clsx(
                "absolute left-0 top-0 z-10 size-full p-2",
                !isPhotoSelected && "hidden bg-black/40 group-hover:flex",
                isPhotoSelected && "bg-black/40"
              )}
            >
              <div
                className={clsx(
                  "flex size-8 items-center justify-center rounded-full border-2 border-gray-300 shadow-lg"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPhoto(photo);
                }}
              >
                {isPhotoSelected && <Check className='size-6 text-white' />}
              </div>
            </div>

            <img src={supabaseUrl} alt='' className='w-full' />
          </div>
          <div
            className={clsx(
              "w-full text-primary",
              user.user.groupView === "roomView" && "py-2"
            )}
          >
            <div className='flex items-center justify-between'>
              <div className='flex flex-1 flex-col justify-between'>
                {user.user.groupView === "roomView" && (
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
                  {photo?.ImageNote.length > 0 && (
                    <div className='text-xs'>
                      {photo?.ImageNote.length} comments
                    </div>
                  )}
                </div>
              </div>
              {/* <div>
                <Button
                  className='group flex size-10 cursor-pointer'
                  data-tip
                  data-for={photo.key}
                  onClick={onToggle}
                >
                  <Star
                    className={clsx(
                      "size-6",
                      !photo.includeInReport && "text-gray-500",
                      photo.includeInReport && "fill-yellow-400 text-yellow-400"
                    )}
                  />
                </Button>
                <ReactTooltip id={photo.key} place='bottom' effect='solid'>
                  Toggle to show image in final Report{" "}
                </ReactTooltip>
              </div> */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className='group flex size-10 cursor-pointer'
                      data-tip
                      variant='outline'
                      data-for={photo.key}
                      onClick={onToggle}
                    >
                      <Star
                        className={clsx(
                          "size-6",
                          !photo.includeInReport && "text-gray-500",
                          photo.includeInReport &&
                            "fill-yellow-400 text-yellow-400"
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle to show image in final report.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <div
            className='flex cursor-pointer p-2'
            onClick={() => onSelectPhoto(photo)}
          >
            <div className='mr-2 flex items-center justify-center'>
              <div
                className={clsx(
                  "flex size-6 items-center justify-center rounded-full border border-gray-300 bg-white shadow-lg"
                )}
              >
                {isPhotoSelected && <Check className='size-4 text-white' />}
              </div>
            </div>
            <div
              className='group relative block size-12 cursor-pointer overflow-hidden rounded-lg'
              onClick={(e) => {
                e.stopPropagation();
                onPhotoClick(photo.key);
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className='group flex size-10 cursor-pointer'
                      data-tip
                      variant='outline'
                      data-for={photo.key}
                      onClick={onToggle}
                    >
                      <Star
                        className={clsx(
                          "size-6",
                          !photo.includeInReport && "text-gray-500",
                          photo.includeInReport &&
                            "fill-yellow-400 text-yellow-400"
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle to show image in final report.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
export default Photo;
