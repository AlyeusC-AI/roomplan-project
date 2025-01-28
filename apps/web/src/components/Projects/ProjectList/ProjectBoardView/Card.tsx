import { useDrag } from "react-dnd";
import Address from "@components/DesignSystem/Address";
import UserAvatar from "@components/DesignSystem/UserAvatar";
import { ProjectType } from "@servicegeek/db/queries/project/listProjects";
import { ProjectStatus } from "@servicegeek/db";
import { trpc } from "@utils/trpc";
import clsx from "clsx";
import produce from "immer";
import Link from "next/link";

const Card = ({
  redirectTo,
  project,
}: {
  redirectTo: string;
  project: ProjectType;
}) => {
  const trpcContext = trpc.useContext();

  const associateProjectStatus =
    trpc.projectStatus.associateProjectStatus.useMutation({
      async onMutate({ publicProjectId, publicProjectStatusId }) {
        await trpcContext.projects.getBoardProjects.cancel();
        const prevData = trpcContext.projects.getBoardProjects.getData();
        trpcContext.projects.getBoardProjects.setData({}, (old) => {
          const newStatus = trpcContext.projectStatus.getAllProjectStatuses
            .getData({ publicProjectId: undefined })
            ?.statuses.find((s) => s.publicId === publicProjectStatusId);
          if (!newStatus || !old) return old;
          const nextState = produce(old.data, (draft) => {
            const projectIndex = draft.findIndex(
              (p) => p.publicId === publicProjectId
            );
            if (projectIndex >= 0) {
              draft[projectIndex].currentStatus = newStatus;
            }
          });
          return { ...old, data: nextState };
        });
        return { prevData };
      },
      onError(err, { publicProjectId, publicProjectStatusId }, ctx) {
        // If the mutation fails, use the context-value from onMutate
        if (ctx?.prevData)
          trpcContext.projects.getBoardProjects.setData({}, ctx.prevData);
      },
      onSettled() {
        trpcContext.projectStatus.getAllProjectStatuses.invalidate();
        trpcContext.projects.getBoardProjects.invalidate();
      },
    });
  const createProjectStatus =
    trpc.projectStatus.createProjectStatus.useMutation({
      onSettled() {
        trpcContext.projectStatus.getAllProjectStatuses.invalidate();
      },
    });

  const attemptStatusChange = async (
    publicId: string,
    status: string,
    statusPublicId: string,
    originalStatus?: ProjectStatus | null
  ) => {
    try {
      await associateProjectStatus.mutateAsync({
        publicProjectId: publicId,
        publicProjectStatusId: statusPublicId,
      });
    } catch (e) {
      console.log("failed to change status");
    }
  };

  const [{ opacity }, dragRef] = useDrag(
    () => ({
      type: "CARD",
      item: project,
      end: (item, monitor) => {
        const dropResult = monitor.getDropResult();
        if (item && dropResult) {
          // @ts-expect-error
          const status = dropResult.status;
          // @ts-expect-error
          let statusPublicId = dropResult.statusPublicId;

          if (!statusPublicId) {
            const customStatus = trpcContext.projectStatus.getAllProjectStatuses
              .getData({ publicProjectId: undefined })
              ?.statuses.find(
                (s) => s.label.toLowerCase() === status.toLowerCase()
              );
            if (customStatus) {
              statusPublicId = customStatus.publicId;
            }
          }
          console.log("attempting status change", item.publicId);
          attemptStatusChange(
            item.publicId,
            status,
            statusPublicId,
            project.status
          );
        }
      },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
      }),
    }),
    []
  );
  return (
    <div ref={dragRef} style={{ opacity }}>
      <Link href={`/projects/${project.publicId}/${redirectTo}`}>
        <div className='relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 shadow-sm hover:border-gray-400'>
          <div className='my-4'>
            <div className='flex flex-col space-y-2'>
              <div>
                <div className='text-lg font-bold text-gray-900'>
                  {project.name}
                </div>
                <div className='text-gray-500'>
                  {project._count.images} Photos
                </div>
              </div>
              <div>
                <Address address={project.location} />
              </div>
              <div
                className={`relative flex h-full ${
                  project.projectAssignees.length > 0 &&
                  "size-4 min-h-4 min-w-4 sm:size-8 sm:min-h-8 sm:min-w-8"
                }`}
              >
                {project.projectAssignees.map((a, i) => (
                  <div
                    key={a.userId}
                    className='absolute h-full'
                    style={{ left: `${i * 15}px` }}
                  >
                    <UserAvatar
                      className={clsx(
                        "size-4 min-h-4 min-w-4 sm:size-8 sm:min-h-8 sm:min-w-8"
                      )}
                      textSize='text-xs'
                      userId={a.userId}
                      firstName={a.user.firstName}
                      lastName={a.user.lastName}
                      email={a.user?.email}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Card;
