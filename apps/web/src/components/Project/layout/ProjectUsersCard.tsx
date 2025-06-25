import { useEffect, useRef, useState } from "react";
import { Button } from "@components/ui/button";
import {
  Users,
  User,
  UserPlus,
  UserMinus,
  ChevronUp,
  Check,
} from "lucide-react";
import UserAvatar from "@components/DesignSystem/UserAvatar";
import { LoadingSpinner } from "@components/ui/spinner";
import {
  useGetOrganizationMembers,
  useGetProjectMembers,
  useAddProjectMember,
  useRemoveProjectMember,
  User as UserType,
} from "@service-geek/api-client";
import { OrganizationMembership } from "@service-geek/api-client/src/types/organization";
import clsx from "clsx";

export default function ProjectUsersCard({
  projectData,
}: {
  projectData: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingId, setLoadingId] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const { data: teamMembersData } = useGetOrganizationMembers();
  const teamMembers = teamMembersData?.data || [];

  const { data: projectMembersData, refetch: refetchProjectMembers } =
    useGetProjectMembers(projectData?.id || "");
  const projectMembers = projectMembersData?.users || [];

  const addProjectMemberMutation = useAddProjectMember();
  const removeProjectMemberMutation = useRemoveProjectMember();

  const onRemove = async (userId: string) => {
    setLoadingId(userId);
    try {
      await removeProjectMemberMutation.mutateAsync({
        projectId: projectData?.id,
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
        projectId: projectData?.id,
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
    <div className="flex flex-col bg-background shadow-sm">
      <div className='flex flex-row items-center justify-between pb-2'>
        <div className='flex items-center gap-2 text-base font-semibold'>
          {/* <Users className='h-5 w-5 text-indigo-600' />  */}
          Project Users
        </div>
        <div className='relative' ref={ref}>
          <Button
            variant='ghost'
            size='icon'
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((p) => !p);
            }}
          >
            <UserPlus className='h-4 w-4 text-gray-400' />
          </Button>
          {isOpen && (
            <div className='absolute right-0 top-full z-50 w-80 rounded-md border bg-background shadow-md'>
              <div className='border-b p-2 text-xs text-gray-500'>
                Click to assign team members
              </div>
              {teamMembers.map((member: OrganizationMembership) => {
                const selected = projectMembers.some(
                  (pm: UserType) => pm.id === member.user?.id
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
                    className='grid w-full grid-cols-6 gap-2 px-3 py-2 text-sm hover:bg-blue-50'
                  >
                    <div className='col-span-1 flex h-full items-center justify-center'>
                      <UserAvatar
                        firstName={member.user?.firstName}
                        lastName={member.user?.lastName}
                        email={member.user?.email}
                        textSize="text-xs"
                      />
                    </div>
                    <div className='col-span-4 flex h-full flex-col justify-start overflow-hidden'>
                      <div className='block truncate text-left font-semibold'>
                        {member.user?.firstName && member.user?.lastName && (
                          <span>
                            {member.user.firstName} {member.user.lastName}
                          </span>
                        )}
                      </div>
                      <span className='text-left text-xs text-gray-500'>
                        {member.user?.email}
                      </span>
                    </div>
                    <div className='col-span-1 flex h-full items-center justify-center'>
                      {loadingId === member.user?.id ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          {selected && <Check className='h-4 text-green-600' />}
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className='flex flex-col space-y-2 p-4 pt-2'>
        {projectMembers.length === 0 ? (
          <div className='flex items-center gap-2 text-sm text-gray-400'>
            <User className='h-4 w-4' />
            <span>No users assigned</span>
          </div>
        ) : (
          projectMembers.map((member: UserType) => (
            <div key={member.id} className='flex items-center justify-between'>
              <div className='flex items-center gap-2 text-sm'>
                <UserAvatar
                  firstName={member.firstName}
                  lastName={member.lastName}
                  email={member.email}
                  textSize="text-xs"
                />
                <div className='flex flex-col'>
                  <span className='font-medium'>
                    {member.firstName && member.lastName && (
                      <span>
                        {member.firstName} {member.lastName}
                      </span>
                    )}
                  </span>
                  <span className='text-xs text-gray-500'>{member.email}</span>
                </div>
              </div>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => onRemove(member.id)}
                disabled={loadingId === member.id}
                className='h-6 w-6'
              >
                {loadingId === member.id ? (
                  <LoadingSpinner />
                ) : (
                  <UserMinus className='h-3 w-3 text-gray-400 hover:text-red-500' />
                )}
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
