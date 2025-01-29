"use client";

import { toast } from "sonner";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { v4 } from "uuid";
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
import { PrimaryButton } from "@components/components";
import { BadgeInfo } from "lucide-react";
import WorkflowStatus from "./components/status";
import { useState } from "react";
import { trpc } from "@utils/trpc";
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

const workflowSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Workflow label must be at least 2 characters.",
    })
    .max(30, {
      message: "Workflow label must not be longer than 30 characters.",
    }),
});

type WorkflowLabelValues = z.infer<typeof workflowSchema>;

export default function WorkflowPage() {
  const [newLabel, setNewLabel] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const utils = trpc.useContext();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const reorderStatuses = trpc.projectStatus.reorderProjectStatuses.useMutation(
    {
      async onMutate({ oldIndex, newIndex }) {
        await utils.projectStatus.getAllProjectStatuses.cancel();
        const prevData = utils.projectStatus.getAllProjectStatuses.getData();

        utils.projectStatus.getAllProjectStatuses.setData({}, (old) => {
          if (!old || !old.statuses) {
            return { statuses: [] };
          }
          const oldStatuses = [...old?.statuses];
          const newArr = arrayMove(oldStatuses, oldIndex, newIndex);

          return { statuses: newArr };
        });
        return { prevData };
      },
      onError(err, data, ctx) {
        if (ctx?.prevData)
          utils.projectStatus.getAllProjectStatuses.setData({}, ctx.prevData);
      },
      onSettled() {
        utils.projectStatus.getAllProjectStatuses.invalidate();
      },
    }
  );

  const createLabel = trpc.projectStatus.createProjectStatus.useMutation({
    async onMutate({ label, description, color }) {
      await utils.projectStatus.getAllProjectStatuses.cancel();
      const prevData = utils.projectStatus.getAllProjectStatuses.getData();
      const temporaryId = v4();

      utils.projectStatus.getAllProjectStatuses.setData({}, (old) => {
        const newData = {
          label,
          description,
          color,
          publicId: `temporary-${temporaryId}`,
          order: old?.statuses.length || -1,
          id: Math.floor(Math.random() * (1000000 - 1000 + 1)) + 1000,
        };
        if (!old || !old.statuses) {
          return { statuses: [newData] };
        }
        return { statuses: [newData, ...old.statuses] };
      });
      return { prevData, temporaryId };
    },
    onError(err, data, ctx) {
      if (ctx?.prevData)
        utils.projectStatus.getAllProjectStatuses.setData({}, ctx.prevData);
    },
    onSettled() {
      utils.projectStatus.getAllProjectStatuses.invalidate();
    },
  });

  const allStatuses = trpc.projectStatus.getAllProjectStatuses.useQuery({});

  const addLabel = async () => {
    setIsAdding(true);
    try {
      await createLabel.mutateAsync({
        label: newLabel,
        description: "",
        color: colorHash(newLabel).rgb,
      });
      toast.success(`Added equipment: ${newLabel}`);
    } catch (e) {
      console.error(e);
    }
    setNewLabel("");
    setIsAdding(false);
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    const copiedStatuses = allStatuses?.data?.statuses ?? [];
    const oldIndex = copiedStatuses.findIndex((o) => o.id === active.id);
    const newIndex = copiedStatuses.findIndex((o) => o.id === over?.id);

    const newArr = arrayMove(copiedStatuses, oldIndex, newIndex);
    const ordering = newArr.map((d) => ({ publicId: d.publicId }));
    reorderStatuses.mutate({ ordering, oldIndex, newIndex });
  }

  const allLabels = allStatuses.data?.statuses || [];

  const form = useForm<z.infer<typeof workflowSchema>>({
    resolver: zodResolver(workflowSchema),
    mode: "onChange",
  });

  function onSubmit(data: WorkflowLabelValues) {
    toast("You submitted the following values:", {
      description: (
        <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
          <code className='text-white'>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    // <RecoilRoot
    //   initializeState={initRecoilAtoms({ userInfo, teamMembers, orgInfo })}
    // >
    // <AppContainer
    //   renderSecondaryNavigation={() => <ProjectsNavigationContainer />}
    // >
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
          <Button type='submit'>Add label</Button>
        </form>
      </Form>
      <div className='my-8 w-full'>
        <label
          htmlFor='equipment'
          className='block text-sm font-medium text-gray-700'
        >
          Add Label
        </label>
        <div className='mt-1 flex justify-between gap-2'>
          <input
            type='equipment'
            name='equipment'
            id='equipment'
            className='block w-full rounded-md border border-gray-200 px-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            placeholder='New label'
            onChange={(e) => setNewLabel(e.target.value)}
            value={newLabel}
            disabled={isAdding}
          />
          <div className='flex w-80 justify-end'>
            <PrimaryButton
              className='w-full'
              onClick={addLabel}
              disabled={isAdding || !newLabel}
            >
              Add New Label
            </PrimaryButton>
          </div>
        </div>
      </div>
      <div className='mb-6 flex'>
        <BadgeInfo className='mr-4 h-6 text-gray-800' /> Drag statuses to change
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
            items={allLabels}
            strategy={verticalListSortingStrategy}
          >
            {allLabels.map((s) => (
              <WorkflowStatus key={s.label} label={s} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
    // </AppContainer>
    /* </RecoilRoot> */
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
