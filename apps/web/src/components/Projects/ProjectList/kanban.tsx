import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  useGetProjectsByStatus,
  useUpdateProject,
  useGetProjectStatuses,
} from "@service-geek/api-client";
import {
  DragEndEvent,
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/ui/kibo-ui/kanban";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ExternalLink,
  Mail,
  ArrowRight,
  StickyNote,
  User,
  Archive,
} from "lucide-react";
import { Project } from "@service-geek/api-client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ITEMS_PER_PAGE = 10;

export function ProjectKanban() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const updateProject = useUpdateProject();
  const { data: statuses } = useGetProjectStatuses();
  const [pageStates, setPageStates] = useState<Record<string, number>>({});
  const [accumulatedProjects, setAccumulatedProjects] = useState<
    Record<string, Project[]>
  >({});

  // Initialize page states when statuses are loaded
  useEffect(() => {
    if (statuses) {
      setPageStates(
        statuses.reduce((acc, status) => ({ ...acc, [status.id]: 1 }), {})
      );
    }
  }, [statuses]);

  // Reset accumulated projects and page states when search query changes
  useEffect(() => {
    if (statuses) {
      setAccumulatedProjects({});
      setPageStates(
        statuses.reduce((acc, status) => ({ ...acc, [status.id]: 1 }), {})
      );
    }
  }, [query, statuses]);

  const columnQueries =
    statuses?.map((status) => {
      const { data, isLoading } = useGetProjectsByStatus(status.id, {
        pagination: {
          page: pageStates[status.id] || 1,
          limit: ITEMS_PER_PAGE,
          search: query,
        },
      });

      // Update accumulated projects when new data arrives
      useEffect(() => {
        if (data?.data) {
          setAccumulatedProjects((prev) => ({
            ...prev,
            [status.id]:
              pageStates[status.id] === 1
                ? data.data
                : [...(prev[status.id] || []), ...data.data],
          }));
        }
      }, [data?.data, status.id, pageStates[status.id]]);

      return {
        status,
        data,
        isLoading,
        hasNextPage: data?.meta ? data.meta.page < data.meta.totalPages : false,
        projects: accumulatedProjects[status.id] || [],
      };
    }) || [];

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const project = columnQueries
      .flatMap((query) => query.projects)
      .find((p) => p.id === active.id);

    if (!project) return;

    // if (project.statusId === over.id) {
    //   router.push(`/projects/${project.id}/overview`);
    //   return;
    // }

    try {
      await updateProject.mutateAsync({
        id: project.id,
        data: { statusId: over.id as string },
      });
      toast.success("Project status updated successfully");
    } catch (error) {
      toast.error("Failed to update project status");
    }
  };

  const loadMore = (statusId: string) => {
    setPageStates((prev) => ({
      ...prev,
      [statusId]: (prev[statusId] || 1) + 1,
    }));
  };

  return (
    <KanbanProvider onDragEnd={handleDragEnd} className='p-4'>
      {columnQueries.map(({ status, isLoading, hasNextPage, projects }) => (
        <KanbanBoard key={status.id} id={status.id} className='min-w-56'>
          <KanbanHeader name={status.label || ""} color={status.color || ""} />
          <KanbanCards>
            {isLoading && pageStates[status.id] === 1 ? (
              <div className='flex justify-center p-4'>
                <Loader2 className='h-6 w-6 animate-spin' />
              </div>
            ) : (
              <>
                {projects.map((project, index) => (
                  <KanbanCard
                    key={project.id}
                    id={project.id}
                    name={project.name}
                    parent={status.label}
                    index={index}
                    className='flex min-w-56 flex-col justify-between rounded-lg border bg-white p-2 shadow transition hover:shadow-md'
                  >
                    {/* Top: Name + Link + Menu */}
                    <div className='mb-1 flex items-center justify-between'>
                      <span className='max-w-[110px] truncate text-sm font-semibold'>
                        {project.name || project.clientName || "Untitled"}
                      </span>
                      <div className='flex items-center gap-1'>
                        <a
                          href={`/projects/${project.id}/overview`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-600 hover:underline'
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          title='View Project Overview'
                        >
                          <svg
                            width='14'
                            height='14'
                            fill='none'
                            viewBox='0 0 24 24'
                          >
                            <path
                              stroke='currentColor'
                              strokeWidth='2'
                              d='M14 3h7v7m0-7L10 14m-4 0v7h7'
                            />
                          </svg>
                        </a>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              size='icon'
                              variant='ghost'
                              className='h-6 w-6 p-0'
                              onClick={(e) => {
                                e.stopPropagation();
                                // e.preventDefault();
                              }}
                              title='More actions'
                            >
                              <svg
                                width='16'
                                height='16'
                                fill='none'
                                viewBox='0 0 24 24'
                              >
                                <circle
                                  cx='5'
                                  cy='12'
                                  r='2'
                                  fill='currentColor'
                                />
                                <circle
                                  cx='12'
                                  cy='12'
                                  r='2'
                                  fill='currentColor'
                                />
                                <circle
                                  cx='19'
                                  cy='12'
                                  r='2'
                                  fill='currentColor'
                                />
                              </svg>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            align='end'
                            className='w-56 p-1'
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className='flex flex-col gap-1'>
                              <a
                                href={`/projects/${project.id}/overview`}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm hover:bg-gray-100'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // allow navigation
                                }}
                              >
                                <ExternalLink className='h-4 w-4' />
                                <span>View Proposal</span>
                              </a>
                              <button
                                className='flex items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-gray-100'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  /* TODO: Work Order */
                                }}
                              >
                                <Mail className='h-4 w-4' />
                                <span>Send Work Order</span>
                              </button>
                              <button
                                className='flex items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-gray-100'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  /* TODO: Invoice */
                                }}
                              >
                                <Mail className='h-4 w-4' />
                                <span>Send Invoice</span>
                              </button>
                              <div className='my-1 border-t' />
                              <button
                                className='flex items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-gray-100'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  /* TODO: Advance Stage */
                                }}
                              >
                                <ArrowRight className='h-4 w-4' />
                                <span>Advance Stage</span>
                              </button>
                              <button
                                className='flex items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-gray-100'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  /* TODO: Add Note */
                                }}
                              >
                                <StickyNote className='h-4 w-4' />
                                <span>Add Note</span>
                              </button>
                              <div className='my-1 border-t' />
                              <button
                                className='flex items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-gray-100'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  /* TODO: Reassign */
                                }}
                              >
                                <User className='h-4 w-4' />
                                <span>Reassign</span>
                              </button>
                              <button
                                className='flex items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-gray-100'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  /* TODO: Archive */
                                }}
                              >
                                <Archive className='h-4 w-4' />
                                <span>Archive</span>
                              </button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    {/* Lead Source */}
                    <div className='mb-1 truncate text-xs text-muted-foreground'>
                      {project.clientName || (
                        <span className='italic'>No lead Source</span>
                      )}
                    </div>
                    {/* Date + Action + Amount */}
                    <div className='mb-1 flex items-center justify-between'>
                      <span
                        className={`flex items-center gap-1 text-xs ${project.dateOfLoss && new Date(project.dateOfLoss) < new Date() ? "text-red-500" : "text-gray-700"}`}
                      >
                        <svg
                          width='12'
                          height='12'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <rect
                            x='3'
                            y='4'
                            width='18'
                            height='18'
                            rx='2'
                            stroke='currentColor'
                            strokeWidth='2'
                          />
                          <path
                            d='M16 2v4M8 2v4'
                            stroke='currentColor'
                            strokeWidth='2'
                          />
                          <path
                            d='M3 10h18'
                            stroke='currentColor'
                            strokeWidth='2'
                          />
                        </svg>
                        {project.dateOfLoss
                          ? new Date(project.dateOfLoss).toLocaleDateString(
                              undefined,
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "No date"}
                      </span>
                      <Button
                        size='sm'
                        variant='outline'
                        className='h-6 min-w-0 px-2 py-0 text-xs'
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                      >
                        {project.status?.label === "Estimate Scheduled"
                          ? "New Proposal"
                          : "View Proposal"}
                      </Button>
                      <div className='flex min-w-0 flex-col items-end'>
                        {/* TODO: Integrate amount/total when available */}
                        <span className='text-xs font-bold leading-tight'>
                          N/A
                        </span>
                        <span className='text-[10px] leading-tight text-muted-foreground'>
                          Pending
                        </span>
                      </div>
                    </div>
                    {/* Bottom: Avatar + Name + Updated */}
                    <div className='mt-1 flex items-center justify-between'>
                      <div className='flex items-center gap-1'>
                        <div className='flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-700'>
                          <span>
                            {project.managerName
                              ? project.managerName
                                  .split(" ")
                                  .map((w) => w[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)
                              : "TC"}
                          </span>
                        </div>
                        <span className='max-w-[60px] truncate text-xs'>
                          {project.managerName || "Contact"}
                        </span>
                      </div>
                      <span className='text-[10px] text-muted-foreground'>
                        {project.updatedAt
                          ? Math.round(
                              (Date.now() -
                                new Date(project.updatedAt).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )
                          : "?"}
                        d ago
                      </span>
                    </div>
                  </KanbanCard>
                ))}
                {hasNextPage && (
                  <Button
                    variant='outline'
                    className='mt-2 w-full'
                    onClick={() => loadMore(status.id)}
                  >
                    {isLoading ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      "Load More"
                    )}
                  </Button>
                )}
              </>
            )}
          </KanbanCards>
        </KanbanBoard>
      ))}
    </KanbanProvider>
  );
}
