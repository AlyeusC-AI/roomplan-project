import { useEffect, useRef, useState } from "react";
import UserAvatar from "@components/DesignSystem/UserAvatar";
import { ChevronUpIcon, CheckIcon } from "lucide-react";
import clsx from "clsx";
import { useParams } from "next/navigation";
import { teamMembersStore } from "@atoms/team-members";
import { LoadingSpinner } from "@components/ui/spinner";

interface ProjectMember {
  id: number;
  userId: string;
  projectId: number;
  User: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export default function AssignStakeholders() {
  const { teamMembers } = teamMembersStore();
  const [loadingId, setLoadingId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const { id } = useParams();
  const ref = useRef<HTMLDivElement>(null);

  const addUser = (userId: string) => {
    return fetch(`/api/v1/projects/${id}/member`, {
      method: "POST",
      body: JSON.stringify({
        userId,
      }),
    });
  };

  const removeUser = (userId: string) => {
    return fetch(`/api/v1/projects/${id}/member`, {
      method: "DELETE",
      body: JSON.stringify({
        userId: userId,
      }),
    });
  };

  const fetchProjectMembers = async () => {
    try {
      const res = await fetch(`/api/v1/projects/${id}/member`);
      const data = await res.json();
      setProjectMembers(data.users || []);
    } catch (error) {
      console.error("Failed to fetch project members:", error);
    }
  };

  const onRemove = async (userId: string) => {
    setLoadingId(userId);
    try {
      const res = await removeUser(userId);
      if (!res.ok) {
        console.error(res);
      } else {
        await fetchProjectMembers();
      }
    } catch (error) {
      console.error(error);
    }
    setLoadingId("");
  };

  const onAdd = async (userId: string) => {
    setLoadingId(userId);
    try {
      const res = await addUser(userId);
      if (!res.ok) {
        console.error(res);
      } else {
        await fetchProjectMembers();
      }
    } catch (error) {
      console.error(error);
    }
    setLoadingId("");
  };

  useEffect(() => {
    fetch("/api/v1/organization/members")
      .then((res) => res.json())
      .then((data) => {
        teamMembersStore.getState().setTeamMembers(data.members);
      });
  }, []);

  useEffect(() => {
    fetchProjectMembers();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
    <div className='flex flex-col border border-gray-300 shadow-md sm:rounded-md'>
      <div className='px-4 py-5'>
        <h3 className='text-lg font-medium leading-6 text-gray-900'>
          Project Assignees
        </h3>
        <p className='my-1 text-sm text-gray-600'>
          Assign employees within your organization to this job. Team members
          that are assigned to a project can optionally receive notifications
          about upcoming job events.
        </p>
      </div>
      <div className='grow px-4'>
        <div className='relative' ref={ref}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((p) => !p);
            }}
            className='relative flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm'
          >
            <div>Click to Assign Team Members</div>
            <ChevronUpIcon className='h-6 text-gray-500' />
          </button>
          {isOpen && (
            <div className='absolute left-0 top-full z-50 w-full rounded-md border border-gray-300 bg-white shadow-md'>
              {teamMembers.map((member) => {
                const selected = projectMembers.some(
                  (pm) => pm.userId === member.id
                );
                return (
                  <button
                    disabled={!!loadingId}
                    key={member.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selected) {
                        onRemove(member.id);
                      } else {
                        onAdd(member.id);
                      }
                    }}
                    className='grid w-full grid-cols-7 gap-2 px-4 py-3 text-sm hover:bg-blue-50 sm:text-base'
                  >
                    <div className='col-span-1 flex h-full items-center justify-center'>
                      <UserAvatar
                        userId={member.id}
                        firstName={member.firstName}
                        lastName={member.lastName}
                        email={member.email}
                      />
                    </div>
                    <div className='col-span-5 flex h-full flex-col justify-start overflow-hidden'>
                      <div
                        className={clsx(
                          "font-semibold",
                          "block truncate text-left"
                        )}
                      >
                        {member.firstName && member.lastName && (
                          <span className='mr-2'>
                            {member.firstName} {member.lastName}
                          </span>
                        )}
                      </div>
                      <span
                        className={clsx(
                          "text-gray-500",
                          "text-left font-semibold"
                        )}
                      >
                        {member.email}
                      </span>
                      <span
                        className={clsx(
                          "text-gray-500",
                          "text-left font-semibold"
                        )}
                      >
                        {member.phone}
                      </span>
                    </div>
                    <div className='col-span-1 flex h-full items-center justify-center'>
                      {loadingId === member.id ? (
                        <LoadingSpinner />
                      ) : (
                        <>{selected && <CheckIcon className='h-6' />}</>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <ul className='grow space-y-4 px-4 py-5 sm:space-y-6 sm:p-6'>
        {projectMembers.map((member) => (
          <li key={`member-${member.id}`} className='flex items-center'>
            <UserAvatar
              userId={member.userId}
              firstName={member.User.firstName}
              lastName={member.User.lastName}
              email={member.User.email}
            />
            <div className='ml-4 flex flex-col justify-start truncate'>
              <div className={clsx("font-semibold", "block truncate")}>
                {member.User.firstName && member.User.lastName && (
                  <span className='mr-2'>
                    {member.User.firstName} {member.User.lastName}
                  </span>
                )}
              </div>
              <span className={clsx("text-gray-500", "font-semibold")}>
                {member.User.email}
              </span>
              <span className={clsx("text-gray-500", "font-semibold")}>
                {member.User.phone}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
