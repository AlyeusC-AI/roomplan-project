import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { EmailService } from '../email/email.service';
import { SendLidarEmailDto } from '../lidar-analysis/dto/send-lidar-email.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    userId: string,
  ): Promise<Project> {
    // Verify user has access to the organization
    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: createProjectDto.organizationId,
        userId,
        status: 'ACTIVE',
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You do not have access to this organization',
      );
    }
    let statusId = createProjectDto.statusId;
    if (!statusId) {
      const status = await this.prisma.projectStatus.findFirst({
        where: {
          organizationId: createProjectDto.organizationId,
          isDefault: true,
        },
      });
      statusId = status?.id;
      if (!statusId) {
        const defaultStatus = await this.prisma.projectStatus.create({
          data: {
            label: 'Active',
            color: 'green',
            organizationId: createProjectDto.organizationId,
            isDefault: true,
          },
        });
        statusId = defaultStatus.id;
      }
    }

    return this.prisma.project.create({
      data: {
        ...createProjectDto,
        statusId,
        dateOfLoss: createProjectDto.dateOfLoss
          ? new Date(createProjectDto.dateOfLoss)
          : undefined,
      },
    });
  }

  async findAll(
    organizationId: string,
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Project>> {
    // Verify user has access to the organization
    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        status: 'ACTIVE',
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You do not have access to this organization',
      );
    }

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
    } = paginationDto;
    const skip = (page - 1) * limit;

    const [total, projects] = await Promise.all([
      this.prisma.project.count({
        where: {
          organizationId,
        },
      }),
      this.prisma.project.findMany({
        where: {
          organizationId,
          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' as const } },
                  {
                    clientName: {
                      contains: search,
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    location: {
                      contains: search,
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    description: {
                      contains: search,
                      mode: 'insensitive' as const,
                    },
                  },
                ],
              }
            : {}),
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          status: true,
        },
      }),
    ]);

    return {
      data: projects,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        status: true,
        equipmentProject: {
          include: {
            equipment: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Verify user has access to the project's organization
    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: project.organizationId,
        userId,
        status: 'ACTIVE',
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
  ): Promise<Project> {
    const project = await this.findOne(id, userId);

    return this.prisma.project.update({
      where: { id },
      data: {
        ...updateProjectDto,
        dateOfLoss: updateProjectDto.dateOfLoss
          ? new Date(updateProjectDto.dateOfLoss)
          : undefined,
      },
      include: {
        status: true,
      },
    });
  }

  async remove(id: string, userId: string): Promise<Project> {
    const project = await this.findOne(id, userId);

    return this.prisma.project.delete({
      where: { id },
    });
  }

  async findAllByStatus(
    organizationId: string,
    userId: string,
    statusId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Project>> {
    // Verify user has access to the organization
    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        status: 'ACTIVE',
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You do not have access to this organization',
      );
    }

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
    } = paginationDto;
    const skip = (page - 1) * limit;

    const whereClause = {
      organizationId,
      statusId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              {
                clientName: { contains: search, mode: 'insensitive' as const },
              },
              { location: { contains: search, mode: 'insensitive' as const } },
              {
                description: { contains: search, mode: 'insensitive' as const },
              },
            ],
          }
        : {}),
    };

    const [total, projects] = await Promise.all([
      this.prisma.project.count({
        where: whereClause,
      }),
      this.prisma.project.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          status: true,
        },
      }),
    ]);

    return {
      data: projects,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Project Member Management

  async getProjectMembers(projectId: string, userId: string) {
    // Get the project to verify it exists and user has access
    const project = await this.findOne(projectId, userId);

    // Retrieve all members of the project with their user data
    const projectWithMembers = await this.prisma.user.findMany({
      where: { projects: { some: { id: projectId } } },
    });

    return {
      users: projectWithMembers,
    };
  }

  async addProjectMember(
    projectId: string,
    memberUserId: string,
    requestingUserId: string,
  ) {
    // Get the project to verify it exists and user has access
    const project = await this.findOne(projectId, requestingUserId);

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: memberUserId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${memberUserId} not found`);
    }

    // Check if user is already a member of the project
    const existingMember = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        members: {
          some: {
            id: memberUserId,
          },
        },
      },
    });

    if (existingMember) {
      // If already a member, simply return success
      return { status: 'ok' };
    }

    // Add the user to the project members
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        members: {
          connect: {
            id: memberUserId,
          },
        },
      },
    });

    return { status: 'ok' };
  }

  async removeProjectMember(
    projectId: string,
    memberUserId: string,
    requestingUserId: string,
  ) {
    // Get the project to verify it exists and user has access
    const project = await this.findOne(projectId, requestingUserId);

    // Remove the user from the project members
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        members: {
          disconnect: {
            id: memberUserId,
          },
        },
      },
    });

    return { status: 'ok' };
  }

  async sendLidarEmail(projectId: string, data: SendLidarEmailDto) {
    try {
      // Get room details
      const room = await this.prisma.room.findFirst({
        where: {
          id: data.roomId,
          projectId: projectId,
        },
        include: {
          project: {
            include: {
              organization: true,
            },
          },
        },
      });

      if (!room) {
        throw new NotFoundException('Room not found');
      }

      // Send email using email service
      await this.emailService.sendLidarAnalysisEmail({
        to: room.project.organization.email,
        roomName: room.name,
        roomPlanSVG: data.roomPlanSVG,
        projectName: room.project.name,
      });

      return {
        success: true,
        message: 'Lidar analysis email sent successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send lidar analysis email',
      );
    }
  }
}
