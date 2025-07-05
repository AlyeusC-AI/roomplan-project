import { useEffect, useRef, useState } from "react";
import { Button } from "@components/ui/button";
import {
  Users,
  User,
  UserPlus,
  UserMinus,
  ChevronUp,
  Edit2,
  UserCheck,
  UserX,
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
import { Dialog, DialogContent } from "@components/ui/dialog";
import { Badge } from "@components/ui/badge";

export default function ProjectUsersCard({
  projectData,
}: {
  projectData: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingId, setLoadingId] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    <div className='flex flex-col'>
      <div className='flex flex-row items-center justify-between'>
        <div className='flex items-center gap-2 text-base font-semibold mb-2'>
          Project Users {projectMembers.length ? `(${projectMembers.length})` : ''}
        </div>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setIsDialogOpen(true)}
        >
          {projectMembers.length ? <Edit2 className='h-4 w-4 text-gray-400' /> : <UserPlus className='h-4 w-4 text-gray-400' />}
        </Button>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}  >
        <DialogContent className="xl:min-w-[700px] bg-white rounded-lg shadow-lg p-6">
          <div className="border-b pb-4 mb-4 flex flex-col gap-1">
            <h3 className="text-xl font-bold text-gray-900">Project Users</h3>
            <p className="text-sm text-gray-500">Click to assign team members</p>
          </div>
          <div className="flex flex-wrap gap-2 overflow-y-auto">
            {teamMembers.map((member: OrganizationMembership) => {
              const selected = projectMembers.some(
                (pm: UserType) => pm.id === member.user?.id
              );
              return (
                <div
                  key={member.id}
                  className={
                    `w-full flex items-center justify-between rounded-md px-4 py-3 transition-colors ` +
                    (selected
                      ? 'bg-green-50 hover:bg-green-100 border border-green-200'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200')
                  }
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      firstName={member.user?.firstName}
                      lastName={member.user?.lastName}
                      email={member.user?.email}
                      textSize="text-xs"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 truncate">
                        {member.user?.firstName && member.user?.lastName && (
                          <span>
                            {member.user.firstName} {member.user.lastName}
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {member.user?.email}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {selected && (
                      <Badge variant="outline" className="flex items-center gap-1 border-green-400 bg-green-100 text-green-700 px-2 py-1">
                        <UserCheck className="h-4 w-4" />
                        <span className="text-xs font-medium">Assigned</span>
                      </Badge>
                    )}
                    <button
                      disabled={!!loadingId}
                      onClick={e => {
                        e.stopPropagation();
                        if (selected) {
                          onRemove(member.user?.id || "");
                        } else {
                          onAdd(member.user?.id || "");
                        }
                      }}
                      className={
                        `flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors border ` +
                        (selected
                          ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-300'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-300') +
                        (loadingId === member.user?.id ? ' opacity-60 cursor-not-allowed' : '')
                      }
                    >
                      {loadingId === member.user?.id ? (
                        <LoadingSpinner />
                      ) : selected ? (
                        <>
                          <UserX className="h-4 w-4" />
                          Unassign
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
      <div className='flex flex-wrap gap-2'>
        {projectMembers.length === 0 ? (
          <div className='flex items-center gap-2 text-sm text-gray-400'>
            <User className='h-4 w-4' />
            <span>No users assigned</span>
          </div>
        ) : (
          projectMembers.map((member: UserType) => (
            <div key={member.id} className='flex items-center justify-between'>
              <div className="flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold size-7" title={`${member.firstName} ${member.lastName}`}>
                {member.firstName[0]?.toUpperCase()}
                {member.lastName[0]?.toUpperCase()}
              </div>
              {/* <div className='flex items-center gap-2 text-sm'>
                <UserAvatar
                  firstName={member.firstName}
                  lastName={member.lastName}
                  email={member.email}
                  textSize='text-xs'
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
              </Button> */}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
