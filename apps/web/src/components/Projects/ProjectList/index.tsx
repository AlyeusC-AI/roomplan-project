"use client";

import { useEffect, useState } from "react";
import CreateFirstProject from "@components/onboarding/CreateFirstProject";
import { DashboardViews } from "@servicegeek/db";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";

import CreateNewProject from "../../../../unused/CreateNewProject";

import { ProjectMapView } from "./ProjectMapView";
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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ChevronRightIcon } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Badge } from "@components/ui/badge";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { Input } from "@components/ui/input";

const ProjectBoardView = dynamic(() => import("./ProjectBoardView"), {
  ssr: false,
});

export const useSearchTerm = () => {
  const router = useSearchParams();

  return router?.get("search");
};

export default function ProjectList({
  redirectTo = "overview",
}: {
  redirectTo?: string;
}) {
  const { projects, setProjects } = projectsStore((state) => state);
  const { user, setUser } = userInfoStore((state) => state);
  const searchTerm = useSearchTerm();
  const [isCreatingNewProject, setIsCreatingNewProject] = useState(false);
  const [loading, setLoading] = useState(true);
  const search = useSearchParams();

  useEffect(() => {
    fetchProjects();
  }, []);

  function fetchProjects() {
    fetch(`/api/v1/projects?offset=${search.get("offset") || 0}`)
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects, data.total);
        setLoading(false);
        console.log(data);
      });
  }

  const setView = (preference: DashboardViews) => {
    if (!user) {
      return;
    }

    fetch("/api/user/save-dashboard-preference", {
      method: "PATCH",
      body: JSON.stringify({
        preference,
      }),
    });

    setUser({ ...user, savedDashboardView: preference });
  };

  if (projects.length === 0 && !searchTerm && !loading) {
    return (
      <div className='flex size-full items-center justify-center'>
        <CreateFirstProject />
      </div>
    );
  }

  return (
    <>
      <div>
        <div className='mt-3 flex justify-between space-x-6'>
          <div className='space-y-0.5'>
            <h2 className='mt-4 text-2xl font-bold tracking-tight'>Projects</h2>
            <p className='text-muted-foreground'>
              Select a project to manage files and estimates.
            </p>
          </div>
          <div className='flex min-w-[100px] flex-col space-y-4'>
            <Button onClick={() => setIsCreatingNewProject((i) => !i)}>
              New Project
            </Button>
          </div>
        </div>
        <div className='mt-5 flex justify-between'>
          {/* <ProjectSearch /> */}
          <Input placeholder='Search projects...' className='max-w-96' />
          <Tabs
            defaultValue={user?.savedDashboardView || DashboardViews.listView}
            onValueChange={(e) => setView(e as DashboardViews)}
          >
            <TabsList>
              <TabsTrigger value={DashboardViews.listView}>
                List View
              </TabsTrigger>
              <TabsTrigger value={DashboardViews.boardView}>
                Board View
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {loading ? (
        <LoadingPlaceholder />
      ) : (
        <div className='flex flex-col justify-start'>
          <View />
          <Pagination className='mt-5'>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href='#' />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href='#'>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href='#' isActive>
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href='#'>3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href='#' />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      <CreateNewProject
        open={isCreatingNewProject}
        setOpen={setIsCreatingNewProject}
      />
    </>
  );

  function View() {
    switch (user?.savedDashboardView) {
      case DashboardViews.listView:
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
      case DashboardViews.boardView:
        return <ProjectBoardView redirectTo={redirectTo} />;
      case DashboardViews.mapView:
        return <ProjectMapView />;
      default:
        return (
          <Card>
            <Table />
          </Card>
        );
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
                src={row.original.images.find((_, index) => index === 0)?.url}
                alt={row.original.clientName}
              />
              <AvatarFallback className='rounded-lg'>
                {`${row.original.clientName}`
                  .split(" ")
                  .map((word) => word[0].toUpperCase())
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
            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
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
      cell: ({ row }) => row.original.assignees[0].User?.firstName ?? "No User",
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
