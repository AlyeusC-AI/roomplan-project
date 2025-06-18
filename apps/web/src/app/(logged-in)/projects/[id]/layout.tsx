"use client";

import { SidebarNav } from "@/components/ui/sidebar-nav";
import { Separator } from "@components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useActiveOrganization,
  useGetProjectById,
  useGetProjectStatus,
} from "@service-geek/api-client";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import {
  MapPin,
  Calendar,
  Hash,
  Building,
  DollarSign,
  FileText,
  Clock,
  User,
  AlertTriangle,
  Target,
  Shield,
  Briefcase,
  Home,
  Phone,
  Mail,
} from "lucide-react";
import { format } from "date-fns";

export default function Layout({ children }: React.PropsWithChildren) {
  const { id } = useParams();
  const { data: project, isLoading } = useGetProjectById(id as string);
  const org = useActiveOrganization();

  const sidebarNavItems = () => [
    {
      title: "Overview",
      href: `/projects/${id}/overview`,
    },
    {
      title: "Files",
      href: `/projects/${id}/files`,
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
    {
      title: "Weather",
      href: `/projects/${id}/weather`,
    },
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

  return (
    <>
      <div className='relative pb-16 pl-5 pt-4'>
        {/* Main Content */}
        <div className='pr-96'>
          {/* Project Header */}
          <div className='sticky top-0 z-20 w-full space-y-6 bg-background py-4'>
            <div className='space-y-4'>
              {/* Main Project Info with Image */}
              <div className='flex items-start gap-6'>
                {/* Project Image */}
                {projectData?.mainImage && (
                  <div className='relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 border-border shadow-sm'>
                    <img
                      src={projectData.mainImage}
                      alt={projectData.name}
                      className='h-full w-full object-cover'
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* Project Details */}
                <div className='flex-1 space-y-3'>
                  <div className='flex items-center gap-3'>
                    <h1 className='text-3xl font-bold tracking-tight'>
                      {projectData?.name}
                    </h1>
                    {projectData?.status && (
                      <Badge
                        variant='outline'
                        className='border px-2 py-0.5 text-xs font-medium'
                        style={{
                          borderColor: projectData.status.color,
                          backgroundColor: projectData.status.color,
                          color: "white",
                        }}
                      >
                        {projectData.status.label}
                      </Badge>
                    )}
                  </div>

                  {/* Key Project Info */}
                  <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
                    {projectData?.location && (
                      <div className='flex items-center gap-1'>
                        <MapPin className='h-4 w-4 text-blue-500' />
                        <span>{projectData.location}</span>
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
                    {projectData?.lossType && (
                      <Badge
                        variant='secondary'
                        className='border-red-200 bg-red-100 text-xs text-red-700'
                      >
                        <AlertTriangle className='mr-1 h-3 w-3' />
                        {projectData.lossType}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className='pt-4'>
                <SidebarNav items={sidebarNavItems()} />
              </div>
              <Separator />
            </div>
          </div>

          {/* Page Content */}
          <div className='mt-8'>{children}</div>
        </div>

        {/* Right Sidebar */}
        <div className='fixed right-4 top-4 z-30 w-80 space-y-4'>
          {/* Project Quick Info */}
          <Card className='border-l-4 border-l-blue-500'>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Target className='h-5 w-5 text-blue-600' />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {projectData?.assignmentNumber && (
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Hash className='h-4 w-4 text-purple-500' />
                    <span>Assignment #</span>
                  </div>
                  <span className='text-sm font-medium'>
                    {projectData.assignmentNumber}
                  </span>
                </div>
              )}

              {projectData?.insuranceCompanyName && (
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Building className='h-4 w-4 text-indigo-500' />
                    <span>Insurance</span>
                  </div>
                  <span
                    className='max-w-32 truncate text-sm font-medium'
                    title={projectData.insuranceCompanyName}
                  >
                    {projectData.insuranceCompanyName}
                  </span>
                </div>
              )}

              {projectData?.insuranceClaimId && (
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <FileText className='h-4 w-4 text-green-500' />
                    <span>Claim #</span>
                  </div>
                  <span className='text-sm font-medium'>
                    {projectData.insuranceClaimId}
                  </span>
                </div>
              )}

              {projectData?.createdAt && (
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Clock className='h-4 w-4 text-cyan-500' />
                    <span>Created</span>
                  </div>
                  <span className='text-sm font-medium'>
                    {format(new Date(projectData.createdAt), "MMM dd, yyyy")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Summary */}
          {(projectData?.rcvValue || projectData?.actualValue) && (
            <Card className='border-l-4 border-l-emerald-500'>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <DollarSign className='h-5 w-5 text-emerald-600' />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {projectData.rcvValue && (
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      RCV Value
                    </span>
                    <span className='text-sm font-medium text-green-600'>
                      ${Number(projectData.rcvValue).toLocaleString()}
                    </span>
                  </div>
                )}
                {projectData.actualValue && (
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Actual Value
                    </span>
                    <span className='text-sm font-medium text-blue-600'>
                      ${Number(projectData.actualValue).toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contact Quick Info */}
          {(projectData?.clientName || projectData?.adjusterName) && (
            <Card className='border-l-4 border-l-purple-500'>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <User className='h-5 w-5 text-purple-600' />
                  Key Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {projectData.clientName && (
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Home className='h-4 w-4 text-blue-500' />
                      <span>Client</span>
                    </div>
                    <p className='text-sm font-medium'>
                      {projectData.clientName}
                    </p>
                  </div>
                )}
                {projectData.adjusterName && (
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Shield className='h-4 w-4 text-green-500' />
                      <span>Adjuster</span>
                    </div>
                    <p className='text-sm font-medium'>
                      {projectData.adjusterName}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
