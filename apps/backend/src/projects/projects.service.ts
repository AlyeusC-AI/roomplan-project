import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

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
}
