import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectStatus, Role, MemberStatus } from '@prisma/client';
import { CreateProjectStatusDto } from './dto/create-project-status.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { ReorderProjectStatusDto } from './dto/reorder-project-status.dto';

@Injectable()
export class ProjectStatusService {
  constructor(private prisma: PrismaService) {}

  async create(
    createProjectStatusDto: CreateProjectStatusDto,
    userId: string,
  ): Promise<ProjectStatus> {
    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: createProjectStatusDto.organizationId,
        userId: userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to create project statuses in this organization',
      );
    }

    return this.prisma.projectStatus.create({
      data: createProjectStatusDto,
    });
  }

  async findAll(
    organizationId: string,
    userId: string,
  ): Promise<ProjectStatus[]> {
    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to view project statuses in this organization',
      );
    }

    return this.prisma.projectStatus.findMany({
      where: {
        organizationId,
        isDeleted: false,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findOne(id: string, userId: string): Promise<ProjectStatus> {
    const projectStatus = await this.prisma.projectStatus.findUnique({
      where: { id },
    });

    if (!projectStatus) {
      throw new NotFoundException('Project status not found');
    }

    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: projectStatus.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to view this project status',
      );
    }

    return projectStatus;
  }

  async update(
    id: string,
    updateProjectStatusDto: UpdateProjectStatusDto,
    userId: string,
  ): Promise<ProjectStatus> {
    const projectStatus = await this.prisma.projectStatus.findUnique({
      where: { id },
    });

    if (!projectStatus) {
      throw new NotFoundException('Project status not found');
    }

    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: projectStatus.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to update project statuses in this organization',
      );
    }

    return this.prisma.projectStatus.update({
      where: { id },
      data: updateProjectStatusDto,
    });
  }

  async remove(id: string, userId: string): Promise<ProjectStatus> {
    const projectStatus = await this.prisma.projectStatus.findUnique({
      where: { id },
    });

    if (!projectStatus) {
      throw new NotFoundException('Project status not found');
    }

    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: projectStatus.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to delete project statuses in this organization',
      );
    }

    return this.prisma.projectStatus.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async reorder(
    organizationId: string,
    reorderDto: ReorderProjectStatusDto,
    userId: string,
  ): Promise<ProjectStatus[]> {
    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to reorder project statuses in this organization',
      );
    }

    // Verify all statuses belong to the organization
    const statuses = await this.prisma.projectStatus.findMany({
      where: {
        id: { in: reorderDto.statusIds },
        organizationId,
      },
    });

    if (statuses.length !== reorderDto.statusIds.length) {
      throw new BadRequestException('One or more status IDs are invalid');
    }

    // Update the order of each status
    const updates = reorderDto.statusIds.map((id, index) =>
      this.prisma.projectStatus.update({
        where: { id },
        data: { order: index },
      }),
    );

    return this.prisma.$transaction(updates);
  }
}
