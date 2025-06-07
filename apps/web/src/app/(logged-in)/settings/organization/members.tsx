import { useEffect, useMemo, useState } from "react";
import UserAvatar from "@components/DesignSystem/UserAvatar";
import Image from "next/image";

import RemoveTeamMember from "../../../../components/Settings/Organization/TeamManagement/RemoveTeamMember";
import RoleSelection from "../../../../components/Settings/Organization/TeamManagement/RoleSelection";
import { Input } from "@components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { toast } from "sonner";
import {
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableHeader,
  TableHeaderGroup,
  TableProvider,
  TableRow,
} from "@components/roadmap-ui/table";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronRightIcon, RefreshCw } from "lucide-react";
import { Card } from "@components/ui/card";
import {
  useInviteMember,
  useGetOrganizationMembers,
  useActiveOrganization,
  useResendInvitation,
  OrganizationMembership,
} from "@service-geek/api-client";
import { useQueryClient } from "@tanstack/react-query";

interface OrgMembersSectionProps {
  children?: React.ReactNode;
}

const FormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
});

type FormSchemaTypes = z.infer<typeof FormSchema>;

const OrgMembersSection = ({ children }: OrgMembersSectionProps) => {
  const form = useForm<FormSchemaTypes>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [resentInvites, setResentInvites] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const activeOrganization = useActiveOrganization();
  const { data: membersData } = useGetOrganizationMembers(
    activeOrganization?.id || ""
  );
  console.log("🚀 ~ OrgMembersSection ~ membersData:", membersData);
  const inviteMember = useInviteMember();
  const resendInvitation = useResendInvitation();

  const addMember = async ({ email }: FormSchemaTypes) => {
    if (!activeOrganization?.id) return;

    setLoading(true);
    try {
      await inviteMember.mutateAsync({
        orgId: activeOrganization.id,
        email,
      });

      toast.success("Invite sent successfully", {
        description: `An invitation was sent to ${email}.`,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvite = async (memberId: string) => {
    if (!activeOrganization?.id) return;

    try {
      await resendInvitation.mutateAsync({
        orgId: activeOrganization.id,
        memberId,
      });

      setResentInvites((prev) => new Set([...prev, memberId]));
      toast.success("Invitation resent successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error resending invite", {
        description: error
          ? (error as Error).message
          : "Something went wrong. Please try again.",
      });
    }
  };

  const columns: ColumnDef<OrganizationMembership>[] = [
    {
      accessorKey: "user",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Invited User' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <div className='relative'>
            <UserAvatar
              email={row.original.user?.email || ""}
              firstName={row.original.user?.firstName || ""}
              lastName={row.original.user?.lastName || ""}
              avatar={row.original.user?.avatar || ""}
            />
            <div
              className='absolute bottom-0 right-0 size-2 rounded-full ring-2 ring-background'
              style={{
                backgroundColor:
                  row.original.status === "PENDING"
                    ? "#F59E0B"
                    : row.original.status === "ACTIVE"
                      ? "#10B981"
                      : "#EF4444",
              }}
            />
          </div>
          <div>
            <span className='font-medium'>{row.original.user?.email}</span>
            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
              <span>{row.original.role}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Invited At' />
      ),
      cell: ({ row }) =>
        new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
        }).format(new Date(row.original.createdAt)),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              row.original.status === "PENDING"
                ? "bg-yellow-100 text-yellow-800"
                : row.original.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {row.original.status}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleResendInvite(row.original.id)}
            disabled={
              resendInvitation.isPending || resentInvites.has(row.original.id)
            }
          >
            <RefreshCw className='mr-2 h-4 w-4' />
            {resentInvites.has(row.original.id) ? "Resent" : "Resend"}
          </Button>
        </div>
      ),
    },
  ];

  const pendingMembers = useMemo(() => {
    return (
      membersData?.data.filter((member) => member.status === "PENDING") || []
    );
  }, [membersData]);

  const activeMembers = useMemo(() => {
    return (
      membersData?.data.filter((member) => member.status === "ACTIVE") || []
    );
  }, [membersData]);

  return (
    <section aria-labelledby='team-details-heading'>
      <div className={"py-6 pb-10"}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(addMember)}
            className='flex items-center space-x-6'
          >
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='example@gmail.com' {...field} />
                  </FormControl>
                  <FormDescription>
                    An email will be sent to the account provided.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' disabled={loading}>
              Submit
            </Button>
          </form>
        </Form>
        <Card className='mt-7'>
          <div className='border-b p-4'>
            <h3 className='text-lg font-medium'>Pending Invites</h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              Manage invitations that are waiting for acceptance
            </p>
          </div>
          {pendingMembers.length > 0 ? (
            <TableProvider columns={columns} data={pendingMembers}>
              <TableHeader>
                {({ headerGroup }) => (
                  <TableHeaderGroup
                    key={headerGroup.id}
                    headerGroup={headerGroup}
                  >
                    {({ header }) => (
                      <TableHead key={header.id} header={header} />
                    )}
                  </TableHeaderGroup>
                )}
              </TableHeader>
              <TableBody>
                {({ row }) => (
                  <TableRow key={row.id} row={row}>
                    {({ cell }) => <TableCell key={cell.id} cell={cell} />}
                  </TableRow>
                )}
              </TableBody>
            </TableProvider>
          ) : (
            <div className='p-8 text-center'>
              <p className='text-sm text-muted-foreground'>
                No pending invites
              </p>
            </div>
          )}
        </Card>
        <div className='mt-6'>
          {(activeMembers?.length || 0) > 0 && children && <>{children}</>}
          {(activeMembers?.length || 0) > 0 ? (
            <ul role='list' className='divide-y divide-gray-200'>
              {activeMembers?.map(({ user, ...member }) => {
                return (
                  <li
                    key={user?.email}
                    className='flex flex-col items-start justify-between space-y-6 py-4 pr-4 md:flex-row md:space-y-0'
                  >
                    <div className='flex'>
                      <div className='flex items-center justify-center'>
                        <UserAvatar
                          email={user?.email || ""}
                          firstName={user?.firstName || ""}
                          lastName={user?.lastName || ""}
                          avatar={user?.avatar || ""}
                        />
                        <div className='ml-4 flex flex-col'>
                          <span className='text-sm font-medium text-gray-900'>
                            {user?.email || ""}
                          </span>
                          <span className='text-sm text-gray-500'>
                            {member.role === "MEMBER" && "Member"}
                            {member.role === "PROJECT_MANAGER" &&
                              "Project Manager"}
                            {member.role === "ACCOUNT_MANAGER" &&
                              "Account Manager"}
                            {member.role === "CONTRACTOR" && "Contractor"}
                            {member.role === "OWNER" && "Owner"}
                            {member.role === "ADMIN" && "Administrator"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center justify-center md:space-x-4'>
                      <RoleSelection
                        member={member}
                        orgId={activeOrganization?.id || ""}
                        onRoleChange={() => {
                          // Invalidate the members query to trigger a refetch
                          queryClient.invalidateQueries({
                            queryKey: [
                              "organizations",
                              activeOrganization?.id,
                              "members",
                            ],
                          });
                        }}
                      />
                      <RemoveTeamMember
                        id={member.id}
                        email={user?.email || ""}
                        orgId={activeOrganization?.id || ""}
                        isAdmin={member.role === "ADMIN"}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className='flex flex-col items-center justify-center overflow-hidden pb-2 pt-8 sm:flex-row'>
              <div
                style={{
                  width: 647.63626 / 3,
                  height: 632.17383 / 3,
                }}
              >
                <Image
                  src='/images/team-empty-state.svg'
                  width={647.63626 / 3}
                  height={632.17383 / 3}
                  alt='Empty Team'
                />
              </div>
              <div className='mt-4 flex-col items-center justify-center sm:ml-12 sm:mt-0'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Add Team Members
                </h3>
                <p className='mt-1 text-sm text-gray-500 sm:max-w-sm'>
                  You can control the access level of each team member within
                  your project once added. Access levels range from Adminstrator
                  to Viewer.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default OrgMembersSection;
