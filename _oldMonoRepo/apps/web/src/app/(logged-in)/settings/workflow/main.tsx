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
import { BadgeInfo } from "lucide-react";
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

const workflowSchema = z.object({
  name: z.string().optional(),
});

type WorkflowLabelValues = z.infer<typeof workflowSchema>;

export default function WorkflowPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [fetching, setFetching] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // const reorderStatuses = trpc.projectStatus.reorderProjectStatuses.useMutation(
  //   {
  //     async onMutate({ oldIndex, newIndex }) {
  //       await utils.projectStatus.getAllProjectStatuses.cancel();
  //       const prevData = utils.projectStatus.getAllProjectStatuses.getData();

  //       utils.projectStatus.getAllProjectStatuses.setData({}, (old) => {
  //         if (!old || !old.statuses) {
  //           return { statuses: [] };
  //         }
  //         const oldStatuses = [...old?.statuses];
  //         const newArr = arrayMove(oldStatuses, oldIndex, newIndex);

  //         return { statuses: newArr };
  //       });
  //       return { prevData };
  //     },
  //     onError(err, data, ctx) {
  //       if (ctx?.prevData)
  //         utils.projectStatus.getAllProjectStatuses.setData({}, ctx.prevData);
  //     },
  //     onSettled() {
  //       utils.projectStatus.getAllProjectStatuses.invalidate();
  //     },
  //   }
  // );

  useEffect(() => {
    setFetching(true);
    fetch("/api/v1/organization/status")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setStatuses(data.data);
        setFetching(false);
      });
  }, []);

  async function handleDragEnd(event: DragEndEvent) {
    try {
      const { active, over } = event;

      const copiedStatuses = statuses;
      const oldIndex = copiedStatuses.findIndex((o) => o.id === active.id);
      const newIndex = copiedStatuses.findIndex((o) => o.id === over?.id);

      const newArr = arrayMove(copiedStatuses, oldIndex, newIndex);
      const ordering = newArr.map((d, index) => ({
        publicId: d.publicId,
        index: index,
      }));

      await fetch("/api/v1/organization/status", {
        method: "PATCH",
        body: JSON.stringify({ order: ordering }),
      });

      setStatuses(newArr);
      toast.success("Reordered statuses successfully");
    } catch {
      toast.error("Failed to reorder statuses");
    }
  }

  const form = useForm<z.infer<typeof workflowSchema>>({
    resolver: zodResolver(workflowSchema),
    mode: "onChange",
  });

  async function onSubmit(data: WorkflowLabelValues) {
    try {
      if (!data.name || data.name.length < 2) {
        toast.error("Workflow label must be at least 2 characters.");
        return;
      }
      setIsAdding(true);
      const res = await fetch("/api/v1/organization/status", {
        method: "POST",
        body: JSON.stringify({
          label: data.name,
          color: colorHash(data.name).rgb,
        }),
      });
      const json = await res.json();
      setIsAdding(false);
      form.setValue("name", "");
      setStatuses([...statuses, json.data]);
      toast.success("Added label successfully");
    } catch {
      toast.error("Failed to add label");
    }
  }

  if (fetching) {
    return <LoadingPlaceholder />;
  }

  return (
    <div className=''>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Add Workflow Label</FormLabel>
                <FormControl>
                  <Input placeholder='New label' {...field} />
                </FormControl>
                <FormDescription>
                  Add a new workflow label for you projects. Please provide a
                  name for the label.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit'>
            {isAdding ? <LoadingSpinner /> : "Add label"}
          </Button>
        </form>
      </Form>
      <div className='my-6 flex'>
        <BadgeInfo className='mr-4 h-6 text-muted' /> Drag statuses to change
        their order. The order here is the order that will be displayed on your
        Projects page while using the "board" view.
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
            {statuses.map((s) => (
              <WorkflowStatus key={s.label} label={s} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
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
