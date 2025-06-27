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
import { AlertTriangle, ChevronRightIcon, CirclePlus, FileImage, CalendarIcon, X, RotateCw } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Calendar } from "@components/ui/calendar";
import { format } from "date-fns";

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
  const [filterObj, setFilterObj] = useState({
    search: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
    assigneeIds: [],
  });
  const [filterDialogState, setFilterDialogState] = useState({
    startDate: null as Date | null,
    endDate: null as Date | null,
    assigneeId: "",
  });

  const { data, isLoading, refetch } = useGetProjects({
    pagination: {
      page,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
      search: query,
      assigneeIds: filterObj.assigneeIds,
      startDate: filterObj?.startDate ? filterObj?.startDate?.toISOString() : undefined,
      endDate: filterObj?.endDate ? filterObj?.endDate?.toISOString() : undefined,
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

 
  const [filterQuery, setFilterQuery] = useState("");

  const filterTabsList = [
    {
      label: "All",
      value: "all",
    },
    {
      label: "Started",
      value: "stared",
    },
    {
      label: "My Projects",
      value: "My Projects",
    },
    {
      label: "Archived",
      value: "Archived",
    },    
  ]

  return (
    <>
      <div
        className={cn(
          "z-10 bg-background lg:pr-6",
          "md:w-[calc(100vw-var(--sidebar-width)-48px)]"
        )}
      >
        <div className='flex w-full justify-between space-x-6'>
          <div className='z-10 w-11/12 flex flex-col md:flex-row md:items-center gap-2 space-x-4'>
          <div className=" space-y-0.5">

            <h2 className='text-2xl md:text-4xl font-bold tracking-tight'>Projects</h2>
            {/* <p className='hidden text-muted-foreground lg:block'>
              Select a project to manage files and estimates.
            </p> */}
          </div>
          <Input
              placeholder="Search projects..."
              onChange={e => handleSearch(e.target.value)}
              className="w-full lg:max-w-64 h-10"
              defaultValue={query}
            />
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

          <Tabs
            defaultValue={"all"}
            onValueChange={(e) => changeDashboardView(e)}
          >
            <TabsList className='hidden lg:block'>
              {filterTabsList.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
            
            <ToggleFilter
              filterTitle='Filter Projects'
              onApply={() => {
                setFilterObj({
                  ...filterObj,
                  startDate: filterDialogState.startDate,
                  endDate: filterDialogState.endDate,
                  assigneeIds: filterDialogState.assigneeId ? [filterDialogState.assigneeId] : [],
                });
              }}
            >
            <ProjectFilterForm
              filterObj={filterDialogState}
              setFilterObj={setFilterDialogState}
              organizationMembers={organizationMembers}
            />
            </ToggleFilter>
            <Button
              variant={"outline"}

              onClick={() => refetch()}
            >
              <RotateCw />

            </Button>
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

      <div className='mt-10'>
        {isLoading ? (
          <LoadingPlaceholder />
        ) : (
          <div className='flex flex-col justify-start'>
            {savedDashboardView === "boardView" ? (
              // <KanBan projects={data?.data ?? []} />
              <ProjectKanban />
            ) : (
              <List projects={data?.data ?? []} />
              // <Card>
              //   <Table projects={data?.data ?? []} />
              // </Card>
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
              <span className="text-lg">{row.original._count.images}</span>
            </div>
            <div className="flex flex-col items-center gap-2 px-2">
              <span className="text-muted-foreground text-xs">Docs</span>
              <span className="text-lg">{row.original._count.documents?.length || 0}</span>
            </div>
          </div>
          <div className="grow flex items-center  gap-2">
            {row.original.images?.map((image: any) =>
              <img src={image.url} alt={row.original.name || "image"} height={64} width={64} className='md:size-24 size-16 rounded-xl border-2 border-border' />
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

const List = ({ projects }: { projects: any[] }) => {
  const { data: statuses } = useGetProjectStatuses();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 ">
      {projects.map((project) => {
        const status = statuses?.find((status) => status.id === project.statusId);
        return (
          <div
            key={project.id}
            className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 border rounded-lg shadow hover:shadow-xl hover:bg-gray-50 cursor-pointer transition-colors group"
            onClick={() => router.push(`/projects/${project.id}/overview`)}
            tabIndex={0}
            role="button"
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push(`/projects/${project.id}/overview`); }}
          >
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 space-y-4 md:space-y-0 justify-between md:items-center grow">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="relative">
                  {project.mainImage ? (
                    <img
                      src={project.mainImage}
                      alt={project.clientName}
                      className="md:size-24 size-16 rounded-xl border-2 border-border object-cover bg-white"
                    />
                  ) : (
                    <div className="flex items-center justify-center md:size-24 size-16 rounded-xl border-2 border-border bg-gray-100">
                      <FileImage size={45} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-between h-full gap-1 min-w-0">
                  <span className="font-medium text-lg capitalize truncate">{project?.name}</span>
                  <div className="flex items-center text-sm gap-1 text-muted-foreground min-w-0">
                    <span className="truncate">{project?.location}</span>
                    <ChevronRightIcon size={12} />
                    <span className="truncate">{project?.clientName}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">Last updated {formatDate(new Date(project?.createdAt))}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge style={{ backgroundColor: status?.color || 'green', width: 'fit-content' }}>
                      {status?.label}
                    </Badge>
                    {project.lossType && (
                      <Badge
                        variant='secondary'
                        className='border-red-200 bg-red-100 text-xs text-red-700 w-fit'
                      >
                        <AlertTriangle className='mr-1 h-3 w-3' />
                        {project.lossType}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex divide-x divide-gray-200 rounded-lg p-2">
                <div className="flex flex-col items-center gap-2 px-2">
                  <span className="text-muted-foreground text-xs">Images</span>
                  <span className="text-lg">{project._count.images}</span>
                </div>
                <div className="flex flex-col items-center gap-2 px-2">
                  <span className="text-muted-foreground text-xs">Docs</span>
                  <span className="text-lg">{project._count.documents?.length || 0}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 items-center gap-2 md:flex-wrap w-fit lg:w-auto md:basis-1/3">
              {project.images?.map((image: any) => (
                <img
                  key={image.url}
                  src={image.url}
                  alt={project.name || 'image'}
                  height={48}
                  width={48}
                  className="md:size-24 size-16 rounded-xl border-2 border-border object-cover bg-white"
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
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

const ProjectFilterForm = ({
  filterObj,
  setFilterObj,
  organizationMembers,
}: {
  filterObj: any;
  setFilterObj: any;
  organizationMembers: any;
}) => {
  return (
      <div className='flex flex-col gap-4'>
                <div className="grid grid-cols-2 gap-4">
                  <div >
                    <label className='text-sm font-medium mb-2'>Start Date</label>
                    <div className="relative">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal pr-8",
                              !filterObj.startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filterObj.startDate ? format(filterObj.startDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filterObj.startDate || undefined}
                            onSelect={(date) => setFilterObj(obj => ({ ...obj, startDate: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {filterObj.startDate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                          onClick={() => setFilterObj(obj => ({ ...obj, startDate: null }))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className='text-sm font-medium mb-2'>End Date</label>
                    <div className="relative">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal pr-8",
                              !filterObj.endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filterObj.endDate ? format(filterObj.endDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filterObj.endDate || undefined}
                            onSelect={(date) => setFilterObj(obj => ({ ...obj, endDate: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {filterObj.endDate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                          onClick={() => setFilterObj(obj => ({ ...obj, endDate: null }))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className='text-sm font-medium mb-2'>User</label>
                  <div className="relative">
                    <Select
                      value={filterObj.user}
                      onValueChange={val => setFilterObj(obj => ({ ...obj, user: val }))}
                    >
                      <SelectTrigger className='w-full pr-8'>
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
                    {filterObj.user && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                        onClick={() => setFilterObj(obj => ({ ...obj, user: "" }))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
  );
};