"use client";

import { toast } from "sonner";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { colorHash } from "@utils/color-hash";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { BadgeInfo, Plus } from "lucide-react";
import WorkflowStatus from "./components/status";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { LoadingPlaceholder, LoadingSpinner } from "@components/ui/spinner";
import {
  useCreateProjectStatus,
  useGetProjectStatuses,
  useReorderProjectStatus,
  ProjectStatus,
} from "@service-geek/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";

const workflowSchema = z.object({
  name: z.string().min(2, "Label name must be at least 2 characters"),
  description: z.string().optional(),
});

type WorkflowLabelValues = z.infer<typeof workflowSchema>;

export default function WorkflowPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: statuses = [], isLoading: fetching } = useGetProjectStatuses();
  const createStatus = useCreateProjectStatus();
  const reorderStatus = useReorderProjectStatus();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    try {
      const { active, over } = event;
      if (!over) return;

      const oldIndex = statuses.findIndex(
        (s: ProjectStatus) => s.id === active.id
      );
      const newIndex = statuses.findIndex(
        (s: ProjectStatus) => s.id === over.id
      );

      const newArr = arrayMove(statuses, oldIndex, newIndex);
      const statusIds = newArr.map((status: ProjectStatus) => status.id);

      await reorderStatus.mutateAsync({ statusIds });
      toast.success("Reordered statuses successfully");
    } catch (error) {
      toast.error("Failed to reorder statuses");
    }
  }

  const form = useForm<WorkflowLabelValues>({
    resolver: zodResolver(workflowSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(data: WorkflowLabelValues) {
    try {
      setIsAdding(true);

      await createStatus.mutateAsync({
        label: data.name,
        description: data.description,
        color: colorHash(data.name).rgb,
        order: statuses.length,
      });

      setIsAdding(false);
      form.reset();
      setIsDialogOpen(false);
      toast.success("Added label successfully");
    } catch (error) {
      toast.error("Failed to add label");
    } finally {
      setIsAdding(false);
    }
  }

  if (fetching) {
    return <LoadingPlaceholder />;
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Workflow Statuses</CardTitle>
          <CardDescription>
            Manage your project workflow statuses. Drag and drop to reorder
            them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='mb-6 flex items-center justify-between'>
            <div className='flex items-center space-x-2 text-muted-foreground'>
              <BadgeInfo className='h-5 w-5' />
              <p className='text-sm'>
                Drag statuses to change their order. The order here is the order
                that will be displayed on your Projects page while using the
                "board" view.
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Status</DialogTitle>
                  <DialogDescription>
                    Create a new status for your project workflow.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='space-y-4'
                  >
                    <FormField
                      control={form.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Label Name</FormLabel>
                          <FormControl>
                            <Input placeholder='New label' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='description'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder='Label description' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className='flex justify-end space-x-2'>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type='submit' disabled={isAdding}>
                        {isAdding ? <LoadingSpinner /> : "Add Status"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <div className='flex flex-col gap-6'>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={statuses}
                strategy={verticalListSortingStrategy}
              >
                {statuses.map((status: ProjectStatus) => (
                  <WorkflowStatus key={status.id} label={status} />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
//   try {
//     const { user, orgAccessLevel } = await getUserWithAuthStatus(ctx)

//     if (!user) {
//       return {
//         redirect: {
//           destination: '/login',
//           permanent: false,
//         },
//       }
//     }

//     if (orgAccessLevel === ORG_ACCESS_LEVEL.REMOVED) {
//       return {
//         redirect: {
//           destination: '/access-revoked',
//           permanent: false,
//         },
//       }
//     }

//     const orgPublicId = user.org?.organization.publicId

//     if (!orgPublicId) {
//       return {
//         redirect: {
//           destination: '/projects',
//           permanent: false,
//         },
//       }
//     }
//     const organization = await getOrganization(orgPublicId)
//     if (!organization) {
//       return {
//         props: {
//           error: 'Could not find Organization.',
//         },
//       }
//     }

//     const allowedAccess =
//       user.org?.isAdmin ||
//       user.org?.accessLevel === AccessLevel.admin ||
//       user.org?.accessLevel === AccessLevel.accountManager

//     if (!allowedAccess) {
//       return {
//         redirect: {
//           destination: '/projects',
//           permanent: false,
//         },
//       }
//     }
//     const members = (await getMembers(organization.id)) as unknown as Member[]
//     const serializedMembers = superjson.serialize(members)

//     const invitations = await getInvitations(organization.id)

//     const subscriptionStatus = await getSubcriptionStatus(user.id)

//     const supabaseClient = await createClient()
//     const {
//       data: { user: sUser },
//     } = await supabaseClient.auth.getUser()
//     const {
//       data: { session },
//     } = await supabaseClient.auth.getSession()
//     if (!user) {
//       return { user: null, accessToken: null }
//     }

//     const statusCaller = appRouter.projectStatus.createCaller({
//       user: sUser,
//       session,
//       supabase: supabaseClient,
//     })
//     const { statuses } = await statusCaller.getAllProjectStatuses({})

//     return {
//       props: {
//         orgId: orgPublicId,
//         teamMembers: serializedMembers.json as unknown as Member[],
//         orgName: organization.name,
//         orgInfo: getOrgInfo(user),
//         userInfo: getUserInfo(user),
//         invitations,
//         isAdmin: orgAccessLevel === ORG_ACCESS_LEVEL.ADMIN,
//         subscriptionStatus,
//         statuses,
//       },
//     }
//   } catch (e) {
//     console.error(e)
//     return {
//       props: {},
//     }
//   }
// }
