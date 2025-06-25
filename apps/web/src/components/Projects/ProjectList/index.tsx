"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";

import CreateNewProject from "./new";

import { useDebouncedCallback } from "use-debounce";
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
import { AlertTriangle, ChevronRightIcon, CirclePlus, FileImage } from "lucide-react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Badge } from "@components/ui/badge";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { Input } from "@components/ui/input";
import { statusStore } from "@atoms/status";
import { cn, formatDate } from "@lib/utils";
import { toast } from "sonner";
import {
  Project,
  useGetProjects,
  useGetProjectStatuses,
  useUpdateProject,
  useGetOrganizationMembers,
} from "@service-geek/api-client";
import { userPreferenceStore } from "@state/user-prefrence";
import { ProjectKanban } from "./kanban";
import { ToggleFilter } from "@components/ui/ToggleFilter";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@components/ui/select";
import { DateTimePicker } from "@components/ui/date-time-picker";

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

  const { data: organizationMembers } = useGetOrganizationMembers();

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

  const [filterObj, setFilterObj] = useState({
    search: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
    user: "",
  });
  const [filterQuery, setFilterQuery] = useState("");

  return (
    <>
      <div
        className={cn(
          "fixed z-10 bg-background lg:pr-6",
          "lg:w-[calc(100vw-var(--sidebar-width)-48px)]"
        )}
      >
        <div className='flex w-full justify-between space-x-6'>
          <div className='z-10 w-11/12 space-y-0.5'>
            <h2 className='text-2xl font-bold tracking-tight'>Projects</h2>
            <p className='hidden text-muted-foreground lg:block'>
              Select a project to manage files and estimates.
            </p>
          </div>
          <div className='ml-auto flex min-w-[100px] flex-col space-y-4'>
            <Button onClick={() => setIsCreatingNewProject((i) => !i)}>
              <CirclePlus />
              Create Project
            </Button>
          </div>
        </div>
        <div className='mt-5 flex justify-between'>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search projects..."
              onChange={e => handleSearch(e.target.value)}
              className="w-full lg:max-w-96"
              defaultValue={query}
            />
            <ToggleFilter
              filterTitle='Filter Projects'
              onApply={() => {
                handleSearch(
                  [
                    filterObj.search,
                    filterObj.startDate ? filterObj.startDate.toISOString() : "",
                    filterObj.endDate ? filterObj.endDate.toISOString() : "",
                    filterObj.user,
                  ].filter(Boolean)
                    .join(" ")
                );
              }}
            >
              <div className='flex flex-col gap-4'>
                <div className="flex gap-4">

                  <div>

                    <label className='text-sm font-medium mb-2'>Start Date</label>
                    <DateTimePicker
                      date={filterObj.startDate}
                      setDate={date => setFilterObj(obj => ({ ...obj, startDate: date }))}
                    />
                  </div>
                  <div>

                    <label className='text-sm font-medium mb-2'>End Date</label>
                    <DateTimePicker
                      date={filterObj.endDate}
                      setDate={date => setFilterObj(obj => ({ ...obj, endDate: date }))}
                    />
                  </div>
                </div>
                <div>

                  <label className='text-sm font-medium mb-2'>User</label>
                  <Select
                    value={filterObj.user}
                    onValueChange={val => setFilterObj(obj => ({ ...obj, user: val }))}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select user' />
                    </SelectTrigger>
                    <SelectContent>
                      {organizationMembers?.data?.map((member: any) => (
                        <SelectItem key={member.user?.id} value={member.user?.id}>
                          {member.user?.firstName} {member.user?.lastName} ({member.user?.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ToggleFilter>
          </div>
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
        console.log("row.original", row.original);
        const status = statuses?.find(
          (status) => status.id === row.original.statusId
        );
        return (
          <div className='flex items-center gap-2'>
            <div className='relative'>
              {row.original.mainImage ? <img src={row.original.mainImage} alt={row.original.clientName} className='md:size-24 size-16 rrounded-xl border-2 border-border' /> :
                <div className='flex items-center justify-center md:size-24 size-16 rounded-xl border-2 border-border  bg-gray-100' >
                  <FileImage size={45} />
                </div>}
              {/* <Avatar className='size-16 rounded-full'>
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
              /> */}
            </div>
            <div className="flex flex-col justify-between h-full gap-1">
              <span className='font-medium text-lg capitalize'>{row.original?.name}</span>
              <div className='hidden items-center text-sm gap-1 text-muted-foreground lg:flex'>
                <span>{row.original?.location}</span>
                <ChevronRightIcon size={12} />
                <span>{row.original?.clientName}</span>

              </div>
              <span className="text-muted-foreground text-xs">Last updated {formatDate(new Date(row.original?.createdAt))}</span>
              <div className="flex items-center gap-2">


                <Badge style={{ backgroundColor: status?.color || "green", width: "fit-content", marginTop: 2 }}>
                  {status?.label}
                </Badge>
                {row.original.lossType && (
                  <Badge
                    variant='secondary'
                    className='border-red-200 bg-red-100 text-xs text-red-700 w-fit'
                  >
                    <AlertTriangle className='mr-1 h-3 w-3' />
                    {row.original.lossType}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "images",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Images' />
      ),
      cell: ({ row }) =>
        <div className="flex justify-between items-center gap-4">
          {/* TO_DO: Add images and docs count */}
          <div className="flex divide-x divide-gray-200">
            <div className="flex flex-col items-center gap-2 px-2">
              <span className="text-muted-foreground text-xs">Images</span>
              <span className="text-lg">10</span>
            </div>
            <div className="flex flex-col items-center gap-2 px-2">
              <span className="text-muted-foreground text-xs">Docs</span>
              <span className="text-lg">10</span>
            </div>
          </div>
          <div className="grow flex items-center  gap-2">
            {/* {row.original.images?.map((image:any)=>
            <img src={image} alt={row.original.clientName} className='md:size-24 size-16 rounded-full' />
          )} */}
            {["https://via.placeholder.com/150", "https://via.placeholder.com/150", "https://via.placeholder.com/150"].map((image: any) =>
              <img src={image} alt={row.original.clientName} className='md:size-24 size-16 rounded-xl border-2 border-border' />
            )}

          </div>
        </div>
    },
    // {
    //   accessorKey: "createdAt",
    //   header: ({ column }) => (
    //     <TableColumnHeader column={column} title='Start Date' />
    //   ),
    //   cell: ({ row }) =>
    //     new Intl.DateTimeFormat("en-US", {
    //       dateStyle: "medium",
    //     }).format(new Date(row.original.createdAt)),
    // },
    // {
    //   accessorKey: "status",
    //   header: ({ column }) => (
    //     <TableColumnHeader column={column} title='Status' />
    //   ),
    //   cell: ({ row }: { row: Row<Project> }) => {
    //     const status = statuses?.find(
    //       (status) => status.id === row.original.statusId
    //     );
    //     return (
    //       <Badge style={{ backgroundColor: status?.color || "green" }}>
    //         {status?.label}
    //       </Badge>
    //     );
    //   },
    // },
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
