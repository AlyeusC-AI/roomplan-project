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
import { Loader2 } from "lucide-react";
import { Project } from "@service-geek/api-client";

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
        <KanbanBoard key={status.id} id={status.id} className='min-w-64'>
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
                    className='min-w-60'
                    onClick={() =>
                      router.push(`/projects/${project.id}/overview`)
                    }
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex flex-col gap-1'>
                        <p className='m-0 flex-1 text-sm font-medium'>
                          {project.name}
                        </p>
                        <p className='m-0 max-w-60 text-xs text-muted-foreground'>
                          {project.location}
                        </p>
                      </div>
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
