import { useState } from "react";
import UserAvatar from "@components/DesignSystem/UserAvatar";
import { Ellipsis } from "lucide-react";
import { teamMembersStore } from "@atoms/team-members";

import FormContainer from "./FormContainer";
import MentionsTextArea from "@components/DesignSystem/Mentions/MentionsTextArea";
import MentionsDisplay from "@components/DesignSystem/Mentions/MentionsDisplay";
import formatDistance from "date-fns/formatDistance";
import useMentionsMetadata, {
  MentionMetadata,
} from "@components/DesignSystem/Mentions/useMentionsMetadata";
import { RouterOutputs } from "@servicegeek/api";
import { User } from "@supabase/supabase-js";
import { createClient } from "@lib/supabase/server";

export default function Notes({
  notesData,
  handleAddProjectNote,
  isLoading,
  title,
  subTitle,
  user,
}: {
  user: User;
  notesData:
    | RouterOutputs["projects"]["getProjectNotes"]
    | RouterOutputs["photos"]["getProjectPhotos"]["images"][0]["ImageNote"];
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
  console.log("notesData", notesData);
  const [value, setValue] = useState("");
  const [mentions, setMentions] = useState<string[]>([]);
  const teamMembers = teamMembersStore((state) => state);
  console.log("teamMembers", teamMembers);
  const mentionsOptions = teamMembers.teamMembers.map((m) => ({
    id: m.userId,
    display: m.user.firstName
      ? m.user.firstName + " " + m.user.lastName
      : m.user.email,
  }));

  const onMentionChange = (id: string) => {
    setMentions([...mentions, id]);
  };

  const metadata = useMentionsMetadata(value, (params) => {
    return `#?userId=${params}`;
  });

  // method to get user id from type getProjectNotes or getProjectPhotos
  const getUserId = (note: any) => {
    if ("userId" in note) {
      return note.userId;
    } else if ("User" in note) {
      return note.User.userId;
    }
  };

  // method to get photo date from type getProjectNotes or getProjectPhotos
  const getPhotoDate = (note: any) => {
    if ("date" in note) {
      return note.date;
    } else if ("createdAt" in note) {
      return note.createdAt;
    }
  };

  return (
    <FormContainer className='col-span-10'>
      <div className='flex flex-col'>
        {title && (
          <div className='bg-white px-4 py-5'>
            <h3 className='text-lg font-medium leading-6 text-gray-900'>
              {title}
            </h3>
            {subTitle && (
              <p className='my-1 text-sm text-gray-600'>{subTitle}</p>
            )}
          </div>
        )}
        <div className='grow bg-white px-4'>
          <div className='relative'>
            <div className='flow-root'>
              <div role='list' className='mb-6'>
                {isLoading
                  ? "loading Notes..."
                  : notesData?.map((note, i) => (
                      <div className='flow-root'>
                        <ul role='list' className='-mb-2'>
                          <li key={getUserId(note) + i}>
                            <div className='relative pb-8'>
                              {i !== notesData?.length - 1 ? (
                                <span
                                  aria-hidden='true'
                                  className='absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200'
                                />
                              ) : null}
                              <div className='relative flex items-start space-x-3'>
                                <div className='relative'>
                                  <UserAvatar
                                    userId={
                                      teamMembers().filter(
                                        (tm) => tm.userId === getUserId(note)
                                      )[0].userId
                                    }
                                    firstName={
                                      teamMembers().filter(
                                        (tm) => tm.userId === getUserId(note)
                                      )[0].user.firstName
                                    }
                                    lastName={
                                      teamMembers().filter(
                                        (tm) => tm.userId === getUserId(note)
                                      )[0].user.lastName
                                    }
                                  />

                                  <span className='absolute -bottom-0.5 -right-1 rounded-tl bg-white px-0.5 py-px'>
                                    <Ellipsis
                                      className='size-5 text-gray-400'
                                      aria-hidden='true'
                                    />
                                  </span>
                                </div>
                                <div className='min-w-0 flex-1'>
                                  <div>
                                    <div className='text-sm'>
                                      <a
                                        href={"#"}
                                        className='font-medium text-gray-900'
                                      >
                                        {teamMembers().filter(
                                          (tm) => tm.userId === getUserId(note)
                                        )[0].user.firstName +
                                          " " +
                                          teamMembers().filter(
                                            (tm) =>
                                              tm.userId === getUserId(note)
                                          )[0].user.lastName}
                                      </a>
                                    </div>
                                    <p className='mt-0.5 text-sm text-gray-500'>
                                      Commented{" "}
                                      {formatDistance(
                                        new Date(getPhotoDate(note)),
                                        Date.now(),
                                        {
                                          addSuffix: true,
                                        }
                                      )}
                                    </p>
                                  </div>
                                  <div className='mt-2 text-sm text-gray-700'>
                                    <MentionsDisplay message={note.body} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    ))}
                {notesData?.length === 0 && !isLoading && (
                  <div className='text-center text-gray-500'>No notes yet</div>
                )}
              </div>

              <div className='flex items-start space-x-4'>
                <div className='shrink-0'>
                  {user && (
                    <UserAvatar
                      userId={user.id}
                      email={user?.email}
                      firstName={user?.user_metadata.firstName || ""}
                      lastName={user?.user_metadata.lastName || ""}
                    />
                  )}
                </div>
                <div className='min-w-0 flex-1'>
                  <form action='#'>
                    <div className='border-b border-gray-200 focus-within:border-indigo-600'>
                      <label htmlFor='comment' className='sr-only'>
                        Add your comment
                      </label>
                      {/* <MentionsTextArea
                        value={value}
                        setValue={setValue}
                        setMentions={onMentionChange}
                        mentions={mentionsOptions}
                      /> */}
                    </div>
                    <div className='flex justify-between py-3'>
                      <div className='flex items-center space-x-5'></div>
                      <div className='shrink-0'>
                        <button
                          onClick={(e) => {
                            setValue("");
                            setMentions([]);
                            handleAddProjectNote({
                              note: value,
                              mentions,
                              metadata,
                            });
                          }}
                          className='bg-primary-action inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormContainer>
  );
}

// This gets called on every request
export async function getServerSideProps() {
  // Fetch data from external API
  const supabase = await createClient();
  const user = await supabase.auth.getUser();

  // Pass data to the page via props
  return { props: { user: user.data.user } };
}
