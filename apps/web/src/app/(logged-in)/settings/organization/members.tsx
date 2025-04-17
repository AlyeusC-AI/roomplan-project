import { useEffect, useMemo, useState } from "react";
import UserAvatar from "@components/DesignSystem/UserAvatar";
import Image from "next/image";
import { teamMembersStore } from "@atoms/team-members";
import { userInfoStore } from "@atoms/user-info";

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
import { ChevronRightIcon } from "lucide-react";
import { Card } from "@components/ui/card";

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
  const userInfo = userInfoStore((state) => state.user);
  // const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const teamMembers = teamMembersStore((state) => state.teamMembers);
  useEffect(() => {
    fetch("/api/v1/organization/members")
      .then((res) => res.json())
      .then((data) => {
        console.log("team members", data);
        teamMembersStore.getState().setTeamMembers(data.members||[]);
        // setTeamMembers(data.members);
        console.log(data);
      });
  }, []);
  const addMember = async ({ email }: FormSchemaTypes) => {
    console.log("🚀 ~ addMember ~ email:", email);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/organization/invite", {
        method: "POST",
        body: JSON.stringify({
          email,
        }),
      });
      console.log("🚀 ~ addMember ~ res:", res);
      if (!res.ok) {
        const message = "Something went wrong. Please try again.";
        const json = await res.json();
        console.log("🚀 ~ addMember ~ json:", json);
        if (json.message) {
          if (json.message === "existing-invite") {
            return toast.error("Error sending invite", {
              description: `An invitation already exists for ${email}.`,
            });
          } else if (json.message === "existing-member") {
            return toast.error("Error sending invite", {
              description: `${email} is already a member of this organization.`,
            });
          }
          return toast.error("Error sending invite", {
            description: json.message,
          });
        }
        return toast.error("Error sending invite", {
          description: message,
        });
      }

      // teamMembersStore.getState().addTeamMember({
      //   isAdmin: false,
      //   accessLevel: "viewer",
      //   User: {
      //     email,
      //     firstName: "",
      //     lastName: "",
      //   },
      // });

      toast.success("Invite sent successfully", {
        description: `An invitation was sent to ${email}.`,
      });
    } catch (error) {
      console.log("🚀 ~ addMember ~ error:", error);
      console.error(error);
      toast.error("Error sending invite", {
        description: error
          ? (error as Error).message
          : "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTeamMembers = useMemo(
    () => teamMembers?.filter(({ id }) => id !== userInfo?.id),
    [teamMembers, userInfo]
  );

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <div className='relative'>
            <Image
              src={row.original.owner.image}
              alt={row.original.owner.name}
              width={24}
              height={24}
              unoptimized
              className='size-6 rounded-full'
            />
            <div
              className='absolute bottom-0 right-0 size-2 rounded-full ring-2 ring-background'
              style={{
                backgroundColor: row.original.status.color,
              }}
            />
          </div>
          <div>
            <span className='font-medium'>{row.original?.name}</span>
            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
              <span>{row.original?.product?.name}</span>
              <ChevronRightIcon size={12} />
              <span>{row.original?.group?.name}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "startAt",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Start At' />
      ),
      cell: ({ row }) =>
        new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
        }).format(row.original.startAt),
    },
    {
      accessorKey: "endAt",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='End At' />
      ),
      cell: ({ row }) =>
        new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
        }).format(row.original.endAt),
    },
    {
      id: "release",
      accessorFn: (row) => row.release.id,
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Release' />
      ),
      cell: ({ row }) => row.original.release.name,
    },
  ];

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
          <TableProvider columns={columns} data={[]}>
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
        </Card>
        <div className='mt-6'>
          {filteredTeamMembers.length > 0 && children && <>{children}</>}
          {filteredTeamMembers.length > 0 ? (
            <ul role='list' className='divide-y divide-gray-200'>
              {filteredTeamMembers?.map((member) => {
                return (
                  <li
                    key={member.email}
                    className='flex flex-col items-start justify-between space-y-6 py-4 pr-4 md:flex-row md:space-y-0'
                  >
                    <div className='flex'>
                      <div className='flex items-center justify-center'>
                        <UserAvatar
                          email={member.email}
                          userId={member.id}
                          firstName={member.firstName || ""}
                          lastName={member.lastName || ""}
                        />
                        <div className='ml-4 flex flex-col'>
                          <span className='text-sm font-medium text-gray-900'>
                            {member.email}
                          </span>
                          <span className='text-sm text-gray-500'>
                            {member.accessLevel === "admin" &&
                              "Account Administrator"}
                            {member.accessLevel === "viewer" && "Viewer"}
                            {member.accessLevel === "projectManager" &&
                              "Project Manager"}
                            {member.accessLevel === "accountManager" &&
                              "Account Manager"}
                            {member.accessLevel === "contractor" &&
                              "Contractor"}
                            {member.accessLevel === "owner" && "Owner"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center justify-center md:space-x-4'>
                      <RoleSelection
                        member={{
                          User: member,
                          createdAt: member.createdAt,
                          // id: member.id,
                          // projectId: member.projectId,
                          userId: member.id,
                        }}
                      />
                      <RemoveTeamMember
                        id={member.id}
                        email={member.email}
                        removeTeamMember={
                          teamMembersStore.getState().removeTeamMember
                        }
                        setEmailStatus={() => {}}
                        isAdmin={member.accessLevel === "admin"}
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
