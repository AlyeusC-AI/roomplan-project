"use client";

import { Badge } from "@/components/ui/badge";
import {
  Project,
  Tag,
  useActiveOrganization,
  useAddProjectTags,
  useGetProjectById,
  useRemoveProjectTags,
  useDeleteProject,
} from "@service-geek/api-client";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  MoreHorizontal,
  ChevronLeft,
  FileImage,
  X,
  Plus,
  ChevronRight,
} from "lucide-react";
import InfoSidebar from "@components/Project/layout/infoSidebar";
import { Button } from "@components/ui/button";
import Link from "next/link";
import clsx from "clsx";
import TagsModal from "@components/tags/TagsModal";
import DamageBadge from "@components/Project/DamageBadge";
import StatusBadge from "@components/Project/StatusBadge";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function Layout({ children }: React.PropsWithChildren) {
  const { id } = useParams();
  const { data: project, isLoading } = useGetProjectById(id as string);
  const org = useActiveOrganization();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteProjectMutation = useDeleteProject();
  const router = useRouter();

  function handleDeleteConfirm() {
    setIsDeleting(true);
    if (!id) return;
    deleteProjectMutation.mutate(id as string, {
      onSuccess: () => {
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
        router.push("/projects");
      },
      onError: () => {
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
        // Optionally use a toast here
        alert("Failed to delete project");
      },
    });
  }

  const sidebarNavItems = () => [
    {
      title: "Overview",
      href: `/projects/${id}/overview`,
    },
    {
      title: "Chat",
      href: `/projects/${id}/chat`,
    },
    {
      title: "Files",
      href: `/projects/${id}/files`,
    },
    {
      title: "Rooms",
      href: `/projects/${id}/rooms`,
    },
    {
      title: "Photos",
      href: `/projects/${id}/photos`,
    },
    {
      title: "Mitigation",
      href: `/projects/${id}/mitigation`,
    },
    {
      title: "Expenses",
      href: `/projects/${id}/expenses`,
    },
    {
      title: "Forms",
      href: `/projects/${id}/forms`,
    },
    // {
    //   title: "Weather",
    //   href: `/projects/${id}/weather`,
    // },
    {
      title: "Report",
      href: `/projects/${id}/report`,
    },
  ];

  if (
    (!project?.data || project?.data?.organizationId !== org?.id) &&
    !isLoading
  ) {
    return (
      <div className='flex min-h-[100%] flex-col items-center justify-center gap-6 rounded-lg bg-gradient-to-b from-gray-50 to-white p-12 shadow-lg transition-all hover:shadow-xl'>
        <div className='animate-pulse rounded-full bg-gray-100 p-6'>
          <svg
            className='h-16 w-16 text-gray-400 transition-colors hover:text-gray-500'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z'
            />
          </svg>
        </div>
        <div className='space-y-4 text-center'>
          <h3 className='animate-fade-in text-2xl font-bold text-gray-900'>
            Project Not Found
          </h3>
          <p className='max-w-md text-lg leading-relaxed text-gray-600'>
            We couldn&apos;t locate the project you&apos;re looking for. It may
            have been moved or deleted.
          </p>
          <button
            onClick={() => window.history.back()}
            className='mt-4 rounded-full bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const projectData = project?.data;
  const currentProjectTags = projectData?.tags || [];

  return (
    <>
      <div
        className={clsx("relative grid gap-2", {
          "grid-cols-[24fr_400px]": !isCollapsed,
          "grid-cols-[24fr_48px]": isCollapsed,
        })}
      >
        {/* Main Content */}
        <div className={clsx(!pathname.includes("report") && "")}>
          <div className='flex items-center justify-between'>
            <Link href='/projects' className='mb-4 flex items-center gap-2'>
              <ChevronLeft size={24} />
              <span className='font-medium'>Projects</span>
            </Link>
            {/* 3-dot menu with AlertDialog */}
            <div className='mb-2 flex justify-end'>
              <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='rounded-full'
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <MoreHorizontal className='text-gray-400' />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Project</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this project? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                      onClick={handleDeleteConfirm}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          {/* Project Header */}
          <div className='top-0 z-20 w-full space-y-6 bg-background py-4'>
            <div className='space-y-4'>
              {/* Main Project Info with Image */}
              <div className='flex items-center gap-6'>
                {/* Project Image */}
                {projectData?.mainImage ? (
                  <div className='relative h-36 w-36 flex-shrink-0 overflow-hidden rounded-xl border-2 border-border shadow-sm'>
                    <img
                      src={projectData.mainImage}
                      alt={projectData.name}
                      className='h-full w-full object-cover'
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className='relative flex h-36 w-36 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-border bg-background shadow-sm'>
                    <FileImage size={45} />
                  </div>
                )}
                {/* Project Details */}
                <div className='flex-1 space-y-3'>
                  <div>
                    <h1 className='text-[40px] font-bold capitalize tracking-tight'>
                      {projectData?.name}
                    </h1>
                    {projectData?.location && (
                      <div className='flex items-center gap-1'>
                        {/* <MapPin className='h-4 w-4 text-blue-500' /> */}
                        <a
                          className='underline'
                          href={`https://www.google.com/maps/search/?api=1&query=${projectData.location}`}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          {projectData.location}
                        </a>
                      </div>
                    )}
                  </div>
                  {/* <div className='flex items-center gap-3'>
                    <h1 className='text-[40px] font-bold capitalize tracking-tight'>
                      {projectData?.name}
                    </h1>
                   
                  </div> */}

                  {/* <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
                    {projectData?.location && (
                      <div className='flex items-center gap-1'>
                        <MapPin className='h-4 w-4 text-blue-500' />
                        <a
                          className='underline'
                          href={`https://www.google.com/maps/search/?api=1&query=${projectData.location}`}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          {projectData.location}
                        </a>
                      </div>
                    )}

                    {projectData?.dateOfLoss && (
                        <div className='flex items-center gap-1'>
                          <Calendar className='h-4 w-4 text-orange-500' />
                          <span>
                            Loss:{" "}
                            {format(
                              new Date(projectData.dateOfLoss),
                              "MMM dd, yyyy"
                            )}
                          </span>
                        </div>
                      )}

                    
                  </div> */}
                  <div className='flex items-center gap-2'>
                    {projectData?.status && (
                      <StatusBadge
                        label={projectData.status.label}
                        color={projectData.status.color}
                      />
                    )}
                    {projectData?.lossType && (
                      // <Badge
                      //   variant='secondary'
                      //   className='border-red-200 bg-red-100 text-xs text-red-700'
                      // >
                      //   <AlertTriangle className='mr-1 h-3 w-3' />
                      //   {projectData.lossType}
                      // </Badge>
                      <DamageBadge lossType={projectData.lossType} />
                    )}
                    {projectData && (
                      <ProjectTags
                        currentProjectTags={currentProjectTags}
                        projectData={projectData}
                      />
                    )}
                  </div>
                  {/* Tags Section */}
                </div>
              </div>

              {/* Navigation */}
              <div className='pt-4'>
                {/* <SidebarNav items={sidebarNavItems()} /> */}
                <div className='flex border-b border-gray-200'>
                  {sidebarNavItems().map((item) => {
                    const isActive =
                      typeof window !== "undefined" &&
                      window.location.pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                          isActive
                            ? "border-black text-black"
                            : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-black"
                        }`}
                        prefetch={false}
                      >
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
              {/* <Separator /> */}
            </div>
          </div>

          {/* Page Content */}
          <div className='bg-background p-4'>{children}</div>
        </div>

        {/* Right Sidebar */}
        {pathname.includes("report") ? null : (
          <div className='col-sp relative'>
            {isCollapsed ? (
              <button
                className='absolute left-3 top-0 flex h-10 w-10 items-center justify-center rounded-lg border-0 bg-accent'
                onClick={() => setIsCollapsed(false)}
                aria-label='Expand sidebar'
                style={{ zIndex: 40 }}
              >
                <ChevronLeft size={24} />
              </button>
            ) : (
              <button
                className='absolute left-3 top-0 flex h-10 w-10 items-center justify-center rounded-lg border-0 bg-accent'
                onClick={() => setIsCollapsed(true)}
                aria-label='Collapse sidebar'
                style={{ zIndex: 40 }}
              >
                <ChevronRight size={24} />
              </button>
            )}
            <InfoSidebar
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
          </div>
        )}
      </div>
    </>
  );
}

interface ProjectTagsProps {
  currentProjectTags: Tag[];
  projectData: Project;
}

const ProjectTags = ({ currentProjectTags, projectData }: ProjectTagsProps) => {
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);

  const { mutate: addProjectTags, isPending: isAddingTags } =
    useAddProjectTags();
  const { mutate: removeProjectTags, isPending: isRemovingTags } =
    useRemoveProjectTags();
  const handleAddTags = (tagNames: string[]) => {
    if (!projectData) return;

    addProjectTags(
      {
        projectId: projectData.id,
        tagNames,
      }
      // {
      //   onSuccess: () => {
      //     toast.success("Tags added successfully");
      //     refetch();
      //   },
      //   onError: () => {
      //     toast.error("Failed to add tags");
      //   },
      // }
    );
  };

  const handleRemoveTag = (tagName: string) => {
    if (!projectData) return;

    removeProjectTags(
      {
        projectId: projectData.id,
        tagNames: [tagName],
      }
      // {
      //   onSuccess: () => {
      //     toast.success("Tag removed successfully");
      //     refetch();
      //   },
      //   onError: () => {
      //     toast.error("Failed to remove tag");
      //   },
      // }
    );
  };
  return (
    <>
      <div className='flex flex-wrap items-center gap-2'>
        {currentProjectTags.length ===
        0 ? //   <TagIcon className='mx-auto mb-2 h-6 w-6 opacity-50' /> // <div className='py-4 text-center text-muted-foreground'>
        //   <p className='text-sm'>No tags assigned</p>
        //   <Button
        //     variant='outline'
        //     size='sm'
        //     onClick={() => setIsTagsModalOpen(true)}
        //     className='mt-2'
        //     disabled={isAddingTags || isRemovingTags}
        //   >

        //   </Button>
        // </div>
        null : (
          <div className='flex flex-wrap gap-2'>
            {currentProjectTags.map((tag) => (
              <Badge
                key={tag.id}
                variant='secondary'
                className='cursor-pointer rounded-full text-sm transition-all hover:bg-destructive/10 hover:text-destructive'
                onClick={() => handleRemoveTag(tag.name)}
                style={
                  tag.color
                    ? {
                        backgroundColor: tag.color,
                        color: "white",
                      }
                    : {}
                }
              >
                {tag.name}
                <X className='ml-1 h-3 w-3' />
              </Badge>
            ))}
          </div>
        )}

        <Button
          variant='default'
          size='sm'
          onClick={() => setIsTagsModalOpen(true)}
          className='h-7 rounded-full'
          disabled={isAddingTags || isRemovingTags}
        >
          <Plus className='h-4 w-4' />
          Add Labels
        </Button>
      </div>
      <TagsModal
        tagType='PROJECT'
        open={isTagsModalOpen}
        onOpenChange={setIsTagsModalOpen}
        title='Project Labels'
        description='Select labels to add to this project'
        onAssignTags={handleAddTags}
        isAssignMode={true}
        currentTags={currentProjectTags}
      />
    </>
  );
};
