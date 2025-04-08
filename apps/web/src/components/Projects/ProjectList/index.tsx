"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";

import CreateNewProject from "./new";

import { useDebouncedCallback } from "use-debounce";
import { userInfoStore } from "@atoms/user-info";
import { projectsStore } from "@atoms/projects";
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
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Badge } from "@components/ui/badge";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { Input } from "@components/ui/input";
import { statusStore } from "@atoms/status";
import { cn } from "@lib/utils";
import { toast } from "sonner";
import { Database } from "@/types/database";

type DashboardView = Database["public"]["Enums"]["DashboardViews"];

export default function ProjectList() {
  const { projects, totalProjects, setProjects } = projectsStore(
    (state) => state
  );
  const { user, setUser } = userInfoStore((state) => state);
  const [isCreatingNewProject, setIsCreatingNewProject] = useState(false);
  const [loading, setLoading] = useState(true);
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchProjects();
  }, [search.get("query"), search.get("page")]);

  function fetchProjects() {
    setLoading(true);
    fetch(`/api/v1/projects?${search.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects, data.total);
        setLoading(false);
        console.log(data);
      })
      .catch((err) => {
        if (err instanceof Error) {
          console.error(err);
          toast.error("Failed to fetch projects", {
            description: err.message,
          });
        }
        setLoading(false);
      });
  }

  const handleSearch = useDebouncedCallback((term) => {
    console.log(`Searching... ${term}`);
    const params = new URLSearchParams(search);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  useEffect(() => {
    if (
      !projects ||
      (projects.length === 0 && !search.get("query") && !loading)
    ) {
      setIsCreatingNewProject(true);
    }
  }, [projects]);

  function changeDashboardView(view: DashboardView) {
    fetch("/api/v1/user", {
      method: "PATCH",
      body: JSON.stringify({
        savedDashboardView: view,
      }),
    });

    setUser({ ...user!, savedDashboardView: view });
  }

  const page = parseInt(search.get("page") || "1");

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
            defaultValue={search.get("query") ?? ""}
          />
          <Tabs
            defaultValue={user?.savedDashboardView || "listView"}
            onValueChange={(e) => changeDashboardView(e as DashboardView)}
          >
            <TabsList
              className='hidden lg:block'
              defaultValue={user?.savedDashboardView ?? "listView"}
            >
              <TabsTrigger value={"listView"}>List View</TabsTrigger>
              <TabsTrigger value={"boardView"}>Board View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className='mt-40'>
        {loading ? (
          <LoadingPlaceholder />
        ) : (
          <div className='flex flex-col justify-start'>
            {user?.savedDashboardView === "boardView" ? (
              <KanBan />
            ) : (
              <Card>
                <Table />
              </Card>
            )}
            {user?.savedDashboardView === "listView" && (
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
                  {totalProjects > 10 * page && (
                    <PaginationItem>
                      <PaginationLink
                        href={`/projects?page=${page + 1}`}
                        isActive
                      >
                        {page + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  {totalProjects > 10 * page && (
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

  function View() {
    switch (user?.savedDashboardView) {
      case "listView":
        return (
          <Card>
            <Table />
          </Card>
          // <ProjectListView
          //   redirectTo={redirectTo}
          //   hidePagination={hidePagination}
          //   isFetching={false}
          // />
        );
      case "boardView":
        return <KanBan />;
      case "mapView":
        return <></>;
    }
  }
}

export const Table = () => {
  const { projects } = projectsStore((state) => state);
  const router = useRouter();

  const columns: ColumnDef<(typeof projects)[number]>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <div className='relative'>
            <Avatar className='size-16 rounded-full'>
              <AvatarImage
                src={row.original.images.find((_, index) => !_.isDeleted)?.url}
                alt={row.original.clientName}
              />
              <AvatarFallback className='rounded-lg'>
                {`${row.original.clientName}`
                  .split(" ")
                  .map((word) => word[0]?.toUpperCase())
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {/* <Image
              src={row.original.owner.image}
              alt={row.original.owner.name}
              width={24}
              height={24}
              unoptimized
              className="h-6 w-6 rounded-full"
            /> */}
            <div
              className='absolute bottom-0 right-0 size-3 rounded-full ring-2 ring-background'
              style={{
                backgroundColor: "green",
              }}
            />
          </div>
          <div>
            <span className='font-medium'>{row.original.name}</span>
            <div className='hidden items-center gap-1 text-xs text-muted-foreground lg:flex'>
              <span>{row.original.location}</span>
              <ChevronRightIcon size={12} />
              <span>{row.original.clientName}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "startAt",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Start Date' />
      ),
      cell: ({ row }) =>
        new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
        }).format(new Date(row.original.createdAt)),
    },
    {
      id: "assignee",
      accessorFn: (row) => row.assignees,
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Assignee' />
      ),
      cell: ({ row }) =>
        row.original.assignees.find((_, i) => i === 0)?.User?.firstName ??
        "No User",
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => <Badge>{row.original.status}</Badge>,
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
        {({ row }) => (
          <TableRow key={row.id} row={row}>
            {({ cell }) => (
              <TableCell
                key={cell.id}
                cell={cell}
                className='hover:cursor-pointer'
                onClick={() => {
                  console.log(row);
                  router.push(
                    `/projects/${(row.original as { publicId: string })?.publicId}/overview`
                  );
                }}
              />
            )}
          </TableRow>
        )}
      </TableBody>
    </TableProvider>
  );
};

function getPFPUrl(id: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pictures/${id}/avatar.png`;
}

export const KanBan = () => {
  const { projects, updateProject } = projectsStore((state) => state);
  const status = statusStore((state) => state);
  const [statuses, setStatuses] = useState<Status[]>([]);

  useEffect(() => {
    status.getStatuses().then((data) => {
      console.log(data);
      setStatuses(data);
    });
  }, []);
  const router = useRouter();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      console.log("no over");
      return;
    }

    const project = projects.find((p) => p.publicId === active.id);

    console.log("project", project?.status);
    console.log("over", over.id);

    if (project?.status === over.id.toString().toLowerCase()) {
      router.push(`/projects/${project.publicId}/overview`);
      return;
    } else {
      updateProject({ ...project!, status: over.id.toString().toLowerCase() });
    }

    console.log(event);
  };

  return (
    <KanbanProvider onDragEnd={handleDragEnd} className='p-4'>
      {statuses.map((status) => (
        <KanbanBoard key={status.id} id={status.label} className='min-w-64'>
          <KanbanHeader name={status.label} color={status.color} />
          <KanbanCards>
            {projects
              .filter(
                (feature) => feature.status === status.label.toLowerCase()
              )
              .map((feature, index) => (
                <KanbanCard
                  key={feature.id}
                  id={feature.publicId}
                  name={feature.name}
                  parent={status.label}
                  index={index}
                  className='min-w-60'
                  onClick={() =>
                    router.push(`/projects/${feature.publicId}/overview`)
                  }
                >
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex flex-col gap-1'>
                      <p className='m-0 flex-1 text-sm font-medium'>
                        {feature.name}
                      </p>
                      <p className='m-0 max-w-60 text-xs text-muted-foreground'>
                        {feature.location}
                      </p>
                    </div>
                    {feature.assignees.length > 0 && (
                      <Avatar className='size-4 shrink-0'>
                        <AvatarImage
                          src={getPFPUrl(feature.assignees[0].userId)}
                        />
                        <AvatarFallback>
                          {`${feature.assignees[0].User?.firstName.slice(0, 2)}`}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  {/* <p className='m-0 text-xs text-muted-foreground'>
                    {shortDateFormatter.format(feature.startAt)} -{" "}
                    {dateFormatter.format(feature.endAt)}
                  </p> */}
                </KanbanCard>
              ))}
          </KanbanCards>
        </KanbanBoard>
      ))}
    </KanbanProvider>
  );
};
