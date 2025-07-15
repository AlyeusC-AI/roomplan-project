import { useEffect, useRef, useState } from "react";
import UserAvatar from "@components/DesignSystem/UserAvatar";
import { ChevronUpIcon, CheckIcon } from "lucide-react";
import clsx from "clsx";
import { useParams } from "next/navigation";
import { LoadingSpinner } from "@components/ui/spinner";
import {
  useGetOrganizationMembers,
  useGetProjectById,
  useGetProjectMembers,
  useAddProjectMember,
  useRemoveProjectMember,
  User,
} from "@service-geek/api-client";
import { OrganizationMembership } from "@service-geek/api-client/src/types/organization";

interface ProjectMember {
  userId: string;
  User: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export default function AssignStakeholders() {
  const { data: teamMembersData } = useGetOrganizationMembers();
  const teamMembers = teamMembersData?.data || [];

  const [loadingId, setLoadingId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { id } = useParams();
  const { data: projectData } = useGetProjectById(id as string);
  const { data: projectMembersData, refetch: refetchProjectMembers } =
    useGetProjectMembers(id as string);
  const projectMembers = projectMembersData?.users || [];
  const addProjectMemberMutation = useAddProjectMember();
  const removeProjectMemberMutation = useRemoveProjectMember();
  const ref = useRef<HTMLDivElement>(null);

  const onRemove = async (userId: string) => {
    setLoadingId(userId);
    try {
      await removeProjectMemberMutation.mutateAsync({
        projectId: id as string,
        userId,
      });
      await refetchProjectMembers();
    } catch (error) {
      console.error(error);
    }
    setLoadingId("");
  };

  const onAdd = async (userId: string) => {
    setLoadingId(userId);
    try {
      await addProjectMemberMutation.mutateAsync({
        projectId: id as string,
        userId,
      });
      await refetchProjectMembers();
    } catch (error) {
      console.error(error);
    }
    setLoadingId("");
  };

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
    <div className='flex flex-col border shadow-md sm:rounded-md'>
      <div className='px-4 py-5'>
        <h3 className='text-lg font-medium leading-6'>
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
            className='relative flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-background px-3 py-2 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm'
          >
            <div>Click to Assign Team Members</div>
            <ChevronUpIcon className='h-6 text-gray-500' />
          </button>
          {isOpen && (
            <div className='absolute left-0 top-full z-50 w-full rounded-md border border-gray-300 bg-background shadow-md'>
              {teamMembers.map((member: OrganizationMembership) => {
                const selected = projectMembers.some(
                  (pm: User) => pm.id === member.user?.id
                );
                return (
                  <button
                    disabled={!!loadingId}
                    key={member.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selected) {
                        onRemove(member.user?.id || "");
                      } else {
                        onAdd(member.user?.id || "");
                      }
                    }}
                    className='grid w-full grid-cols-7 gap-2 px-4 py-3 text-sm hover:bg-accent sm:text-base'
                  >
                    <div className='col-span-1 flex h-full items-center justify-center'>
                      <UserAvatar
                        firstName={member.user?.firstName}
                        lastName={member.user?.lastName}
                        email={member.user?.email}
                      />
                    </div>
                    <div className='col-span-5 flex h-full flex-col justify-start overflow-hidden'>
                      <div
                        className={clsx(
                          "font-semibold",
                          "block truncate text-left"
                        )}
                      >
                        {member.user?.firstName && member.user?.lastName && (
                          <span className='mr-2'>
                            {member.user.firstName} {member.user.lastName}
                          </span>
                        )}
                      </div>
                      <span
                        className={clsx(
                          "text-gray-500",
                          "text-left font-semibold"
                        )}
                      >
                        {member.user?.email}
                      </span>
                      <span
                        className={clsx(
                          "text-gray-500",
                          "text-left font-semibold"
                        )}
                      >
                        {member.user?.phone}
                      </span>
                    </div>
                    <div className='col-span-1 flex h-full items-center justify-center'>
                      {loadingId === member.user?.id ? (
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
        {projectMembers.map((member: User) => (
          <li key={`member-${member.id}`} className='flex items-center'>
            <UserAvatar
              firstName={member.firstName}
              lastName={member.lastName}
              email={member.email}
            />
            <div className='ml-4 flex flex-col justify-start truncate'>
              <div className={clsx("font-semibold", "block truncate")}>
                {member.firstName && member.lastName && (
                  <span className='mr-2'>
                    {member.firstName} {member.lastName}
                  </span>
                )}
              </div>
              <span className={clsx("text-gray-500", "font-semibold")}>
                {member.email}
              </span>
              <span className={clsx("text-gray-500", "font-semibold")}>
                {member.phone}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
