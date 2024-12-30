import { prisma } from "../../";
import { ProjectStatus } from "../../";

export interface ProjectList {
  projects: ProjectType[];
  _count: {
    projects: number;
  };
}

export interface Assignee {
  userId: string;
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface ProjectType {
  publicId: string;
  createdAt: Date;
  name: string;
  clientName: string;
  location: string;
  lng: string;
  lat: string;
  status?: ProjectStatus | null;
  currentStatus?: {
    label: string;
    description: string;
    publicId: string;
    color: string;
  } | null;
  projectAssignees: Assignee[];
  images: { key: string }[];
  _count: { images: number };
}

const listProjects = async (id: number, limit: number, offset: number): Promise<ProjectList | null> =>
  prisma.organization.findFirst({
    where: { id },
    select: {
      _count: {
        select: {
          projects: true,
        },
      },
      projects: {
        orderBy: {
          createdAt: "desc",
        },
        where: {
          isDeleted: false,
        },
        select: {
          publicId: true,
          createdAt: true,
          name: true,
          clientName: true,
          location: true,
          status: true,
          lng: true,
          lat: true,
          currentStatus: {
            select: {
              label: true,
              description: true,
              publicId: true,
              color: true,
            },
          },
          projectAssignees: {
            select: {
              userId: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: { images: true },
          },
          images: {
            take: 1,
            select: {
              key: true,
            },
            where: {
              isDeleted: false,
            },
          },
        },
      },
    },
    skip: offset,
    take: limit,
  });

export const listProjectsForUser = async (id: number, userId: string, limit: number, offset: number) =>
  prisma.project.findMany({
    where: {
      organizationId: id,
      
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      publicId: true,
      createdAt: true,
      name: true,
      location: true,
      status: true,
      projectAssignees: {
        select: {
          userId: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: { images: true },
      },
      images: {
        take: 1,
        select: {
          key: true,
        },
        where: {
          isDeleted: false,
        },
      },
    },
    skip: offset,
    take: limit,
  });

export default listProjects;
