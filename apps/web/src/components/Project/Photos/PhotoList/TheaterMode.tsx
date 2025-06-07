import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import probe from "probe-image-size";
import Image from "next/image";

import Notes from "@components/Project/overview/DetailsInput/Notes";
import { MentionMetadata } from "@components/DesignSystem/Mentions/useMentionsMetadata";
import {
  Image as ImageType,
  useAddComment,
  useCurrentUser,
  useGetProjectById,
} from "@service-geek/api-client";
import { useParams } from "next/navigation";
import { toast } from "sonner";

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
  const [size, setSize] = useState<probe.ProbeResult | null>(null);
  const { data: user } = useCurrentUser();
  // const createPhotoNote = trpc.photos.createImageNote.useMutation();

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

  return (
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

      <DialogContent className='h-5/6 max-w-[90vw]'>
        <div className='size-full overflow-scroll rounded-lg bg-background'>
          <div className='flex size-full overflow-scroll rounded-lg bg-background'>
            <div className='relative flex size-full items-center justify-center overflow-hidden align-middle'>
              {size && photos[theaterModeIndex].url && (
                <Image
                  src={photos[theaterModeIndex].url}
                  width={size.width}
                  height={size.height}
                  alt=''
                  className=''
                />
              )}
            </div>
            <div className='w-2/4'>
              <div className=''>
                {/* Header */}
                <div className='px-4 py-6 sm:px-6'>
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
