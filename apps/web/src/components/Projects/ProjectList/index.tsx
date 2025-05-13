"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";

import CreateNewProject from "./new";

import { useDebouncedCallback } from "use-debounce";
import { userInfoStore } from "@atoms/user-info";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import {
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableHeader,
  TableHeaderGroup,
  TableProvider,
  TableRow,
} from "@/components/roadmap-ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DragEndEvent,
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/ui/kibo-ui/kanban";
import { ChevronRightIcon } from "lucide-react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Badge } from "@components/ui/badge";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { Input } from "@components/ui/input";
import { statusStore } from "@atoms/status";
import { cn } from "@lib/utils";
import { toast } from "sonner";
import {
  Project,
  useGetProjects,
  useGetProjectStatuses,
  useUpdateProject,
} from "@service-geek/api-client";
import { userPreferenceStore } from "@state/user-prefrence";
import { ProjectKanban } from "./kanban";

export default function ProjectList() {
  const [isCreatingNewProject, setIsCreatingNewProject] = useState(false);
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: statuses } = useGetProjectStatuses();
  const { savedDashboardView, updatePreference } = userPreferenceStore(
    (state) => state
  );

  const page = parseInt(search.get("page") || "1");
  const query = search.get("query") || "";

  const { data, isLoading } = useGetProjects({
    pagination: {
      page,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
      search: query,
    },
  });

  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams(search);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  useEffect(() => {
    if (data?.data && data.data.length === 0 && !query && !isLoading) {
      setIsCreatingNewProject(true);
    }
  }, [data?.data, query, isLoading]);

  function changeDashboardView(view: any) {
    updatePreference({ savedDashboardView: view });
  }

  return (
    <>
      <div
        className={cn(
          "fixed z-10 bg-background lg:pr-10",
          "lg:w-[calc(100vw-var(--sidebar-width))]"
        )}
      >
        <div className='mt-3 flex w-full justify-between space-x-6'>
          <div className='z-10 w-11/12 space-y-0.5'>
            <h2 className='mt-4 text-2xl font-bold tracking-tight'>Projects</h2>
            <p className='hidden text-muted-foreground lg:block'>
              Select a project to manage files and estimates.
            </p>
          </div>
          <div className='ml-auto flex min-w-[100px] flex-col space-y-4'>
            <Button onClick={() => setIsCreatingNewProject((i) => !i)}>
              New Project
            </Button>
          </div>
        </div>
        <div className='mt-5 flex justify-between'>
          <Input
            placeholder='Search projects...'
            onChange={(e) => handleSearch(e.target.value)}
            className='w-full lg:max-w-96'
            defaultValue={query}
          />
          <Tabs
            defaultValue={savedDashboardView}
            onValueChange={(e) => changeDashboardView(e)}
          >
            <TabsList className='hidden lg:block'>
              <TabsTrigger value={"listView"}>List View</TabsTrigger>
              <TabsTrigger value={"boardView"}>Board View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className='mt-40'>
        {isLoading ? (
          <LoadingPlaceholder />
        ) : (
          <div className='flex flex-col justify-start'>
            {savedDashboardView === "boardView" ? (
              // <KanBan projects={data?.data ?? []} />
              <ProjectKanban />
            ) : (
              <Card>
                <Table projects={data?.data ?? []} />
              </Card>
            )}
            {savedDashboardView === "listView" && data?.meta && (
              <Pagination className='mt-5'>
                <PaginationContent>
                  <PaginationItem>
                    {page !== 1 && (
                      <PaginationPrevious href={`/projects?page=${page - 1}`} />
                    )}
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink isActive>{page}</PaginationLink>
                  </PaginationItem>
                  {data.meta.totalPages > page && (
                    <PaginationItem>
                      <PaginationLink
                        href={`/projects?page=${page + 1}`}
                        isActive
                      >
                        {page + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  {data.meta.totalPages > page && (
                    <PaginationItem>
                      <PaginationNext href={`/projects?page=${page + 1}`} />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>
      <CreateNewProject
        open={isCreatingNewProject}
        setOpen={setIsCreatingNewProject}
      />
    </>
  );
}

export const Table = ({ projects }: { projects: any[] }) => {
  const router = useRouter();
  const { data: statuses } = useGetProjectStatuses();
  const columns: ColumnDef<(typeof projects)[number]>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }: { row: Row<Project> }) => {
        const status = statuses?.find(
          (status) => status.id === row.original.statusId
        );
        return (
          <div className='flex items-center gap-2'>
            <div className='relative'>
              <Avatar className='size-16 rounded-full'>
                <AvatarImage
                  src={row.original.mainImage}
                  alt={row.original.clientName}
                />
                <AvatarFallback className='rounded-lg'>
                  {`${row.original.clientName || row.original.name || ""}`
                    .split(" ")
                    .map((word) => word[0]?.toUpperCase())
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div
                className='absolute bottom-0 right-0 size-3 rounded-full ring-2 ring-background'
                style={{
                  backgroundColor: status?.color || "green",
                }}
              />
            </div>
            <div>
              <span className='font-medium'>{row.original?.name}</span>
              <div className='hidden items-center gap-1 text-xs text-muted-foreground lg:flex'>
                <span>{row.original?.location}</span>
                <ChevronRightIcon size={12} />
                <span>{row.original?.clientName}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Start Date' />
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
      cell: ({ row }: { row: Row<Project> }) => {
        const status = statuses?.find(
          (status) => status.id === row.original.statusId
        );
        return (
          <Badge style={{ backgroundColor: status?.color || "green" }}>
            {status?.label}
          </Badge>
        );
      },
    },
  ];

  return (
    <TableProvider columns={columns} data={projects}>
      <TableHeader>
        {({ headerGroup }) => (
          <TableHeaderGroup key={headerGroup.id} headerGroup={headerGroup}>
            {({ header }) => <TableHead key={header.id} header={header} />}
          </TableHeaderGroup>
        )}
      </TableHeader>
      <TableBody>
        {({ row }: any) => (
          <TableRow key={row.original.id} row={row}>
            {({ cell }) => (
              <TableCell
                key={cell.id}
                cell={cell}
                className='hover:cursor-pointer'
                onClick={() => {
                  router.push(`/projects/${row.original.id}/overview`);
                }}
              />
            )}
          </TableRow>
        )}
      </TableBody>
    </TableProvider>
  );
};

export const KanBan = ({ projects }: { projects: any[] }) => {
  const updateProject = useUpdateProject();
  const router = useRouter();
  const { data: statuses } = useGetProjectStatuses();

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const project = projects.find((p) => p.id === active.id);

    if (project?.status?.id === over.id) {
      router.push(`/projects/${project.id}/overview`);
      return;
    }

    try {
      await updateProject.mutateAsync({
        id: project?.id,
        data: { statusId: over.id as string },
      });
    } catch (error) {
      toast.error("Failed to update project status");
    }
  };

  return (
    <KanbanProvider onDragEnd={handleDragEnd} className='p-4'>
      {statuses?.map((status) => (
        <KanbanBoard key={status.id} id={status.id} className='min-w-64'>
          <KanbanHeader name={status.label || ""} color={status.color || ""} />
          <KanbanCards>
            {projects
              .filter((project) => project.statusId === status.id)
              .map((project, index) => (
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
          </KanbanCards>
        </KanbanBoard>
      ))}
    </KanbanProvider>
  );
};
