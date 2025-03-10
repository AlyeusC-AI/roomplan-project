import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import useSupabaseImage from "@utils/hooks/useSupabaseImage";
import probe from "probe-image-size";
import Image from "next/image";

import { projectStore } from "@atoms/project";
import Notes from "@components/Project/overview/DetailsInput/Notes";
import { MentionMetadata } from "@components/DesignSystem/Mentions/useMentionsMetadata";
import { teamMembersStore } from "@atoms/team-members";

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
  photos: ImageQuery_Image[];
  theaterModeIndex: number;
  setTheaterModeIndex: Dispatch<SetStateAction<number>>;
}) {
  const projectInfo = projectStore((state) => state.project);
  const supabaseUrl = useSupabaseImage(photos[theaterModeIndex].key);
  const [size, setSize] = useState<probe.ProbeResult | null>(null);
  const [photoNotes, setPhotoNotes] = useState<ImageQuery_ImageNote[]>(
    photos[theaterModeIndex].ImageNote
  );
  // const createPhotoNote = trpc.photos.createImageNote.useMutation();

  const handleAddProjectNote = async ({
    note,
    mentions,
    metadata,
  }: {
    note: string;
    mentions: string[];
    metadata: MentionMetadata[];
  }) => {
    const res = await fetch(
      `/api/v1/projects/${projectInfo?.publicId}/images`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId: photos[theaterModeIndex].id,
          body: note,
        }),
      }
    );

    const { data } = await res.json();
    console.log(data);
    setPhotoNotes([...photoNotes, data]);
  };

  useEffect(() => {
    const updateSize = async () => {
      if (supabaseUrl) {
        const size = await probe(supabaseUrl);
        setSize(size);
      }
    };
    updateSize();
  }, [supabaseUrl]);

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
  }, [photos, setTheaterModeIndex]);

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
              {size && supabaseUrl && (
                <Image
                  src={supabaseUrl}
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
                        {projectInfo?.name}
                      </DialogTitle>
                      <p className='text-sm text-gray-500'>
                        {projectInfo?.location}
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
                  notesData={photoNotes}
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
