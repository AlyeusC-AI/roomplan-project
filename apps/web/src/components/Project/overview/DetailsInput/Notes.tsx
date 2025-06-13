import { useState } from "react";
import { Ellipsis } from "lucide-react";
import MentionsDisplay from "@components/DesignSystem/Mentions/MentionsDisplay";
import useMentionsMetadata, {
  MentionMetadata,
} from "@components/DesignSystem/Mentions/useMentionsMetadata";

import { Button } from "@components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Textarea } from "@components/ui/textarea";
import { formatDistance } from "date-fns";
import { Note } from "@react-pdf/renderer";
import {
  Comment,
  useCurrentUser,
  useGetOrganizationMembers,
  useGetComments,
} from "@service-geek/api-client";
import { Image as ImageType } from "@service-geek/api-client";
export default function Notes({
  image,
  handleAddProjectNote,
  isLoading,
  title,
  subTitle,
}: {
  image: ImageType;
  handleAddProjectNote: ({
    note,
    mentions,
    metadata,
  }: {
    note: string;
    mentions: string[];
    metadata: MentionMetadata[];
  }) => void;
  isLoading: boolean;
  title?: string;
  subTitle?: string;
}) {
  const [value, setValue] = useState("");
  const [mentions, setMentions] = useState<string[]>([]);
  const { data: notesData } = useGetComments(image.id);

  const { data: user } = useCurrentUser();
  const { data: members } = useGetOrganizationMembers();

  // const metadata = useMentionsMetadata(value, (params) => {
  //   return `#?userId=${params}`;
  // });

  // method to get photo date from type getProjectNotes or getProjectPhotos
  const getPhotoDate = (note: Note | ImageQuery_ImageNote) => {
    if ("date" in note) {
      return note.date;
    } else if ("createdAt" in note) {
      return note.createdAt;
    } else {
      return new Date().toISOString();
    }
  };

  return (
    <div className='max-h-[500px] overflow-y-auto pb-20'>
      {title && (
        <div className='mt-2 bg-background px-4 py-5'>
          <h3 className='text-lg font-medium leading-6 text-foreground'>
            {title}
          </h3>
          {subTitle && <p className='my-1 text-sm text-gray-600'>{subTitle}</p>}
        </div>
      )}
      <div className='relative'>
        <div className='flow-root'>
          <div role='list' className='mb-6'>
            {isLoading
              ? "loading Notes..."
              : notesData?.map((note, i) => {
                  const user = members?.data.find(
                    (tm) => tm.user?.id === note.userId
                  )?.user;
                  console.log("🚀 ~ :notesData?.map ~ members:", members);
                  console.log("🚀 ~ :notesData?.map ~ user:", note);
                  return (
                    <div className='flow-root' key={i}>
                      <ul role='list' className='-mb-2'>
                        <li key={note.id + i}>
                          <div className='relative pb-8'>
                            {i !== notesData?.length - 1 ? (
                              <span
                                aria-hidden='true'
                                className='absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200'
                              />
                            ) : null}
                            <div className='relative flex items-start space-x-3'>
                              <div className='relative'>
                                <Avatar className='size-8 rounded-lg'>
                                  <AvatarImage
                                    src={user?.avatar || ""}
                                    alt={`${user?.firstName} ${user?.lastName}`}
                                  />
                                  <AvatarFallback className='rounded-lg'>
                                    {`${user?.firstName} ${user?.lastName}`
                                      .split(" ")
                                      .map((word) => word[0]?.toUpperCase())
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>

                                {/* <span className='absolute -bottom-0.5 -right-1 rounded-tl bg-background px-0.5 py-px'>
                                  <Ellipsis
                                    className='size-5 text-gray-400'
                                    aria-hidden='true'
                                  />
                                </span> */}
                              </div>
                              <div className='min-w-0 flex-1'>
                                <div>
                                  <div className='text-sm'>
                                    <a
                                      href={"#"}
                                      className='font-medium text-foreground'
                                    >
                                      {user?.firstName + " " + user?.lastName}
                                    </a>
                                  </div>
                                  <p className='mt-0.5 text-sm text-gray-500'>
                                    Commented{" "}
                                    {formatDistance(
                                      new Date(note.createdAt),
                                      Date.now(),
                                      {
                                        addSuffix: true,
                                      }
                                    )}
                                  </p>
                                </div>
                                <div className='mt-2 text-sm text-gray-700'>
                                  <MentionsDisplay message={note.content} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  );
                })}
            {notesData?.length === 0 && !isLoading && (
              <div className='mb-4 text-center text-gray-500'>No notes yet</div>
            )}

            <div className='flex gap-2'>
              {user && (
                <Avatar className='size-8 rounded-lg'>
                  <AvatarImage
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pictures/${user.id}/avatar.png`}
                    alt={`${user?.firstName} ${user?.lastName}`}
                  />
                  <AvatarFallback className='rounded-lg'>
                    {`${user.firstName} ${user.lastName}`
                      .split(" ")
                      .map((word) => word[0]?.toUpperCase())
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              )}
              <Textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder='Create a new note'
              />
            </div>
          </div>

          <div className='ml-auto flex items-center space-x-4'>
            <div className='min-w-0 flex-1'>
              <form action='#'>
                <div className='focus-within:border-indigo-600'>
                  {/* <MentionsTextArea
                        value={value}
                        setValue={setValue}
                        setMentions={onMentionChange}
                        mentions={mentionsOptions}
                      /> */}
                </div>
                <div className='flex justify-between'>
                  <div className='flex items-center space-x-5'></div>
                  <div className='shrink-0'>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        setMentions([]);
                        handleAddProjectNote({
                          note: value,
                          mentions: [],
                          metadata: [],
                        });
                        setValue("");
                      }}
                      // variant='secondary'
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
