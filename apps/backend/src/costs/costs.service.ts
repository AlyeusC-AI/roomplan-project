import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cost, Role, MemberStatus } from '@prisma/client';
import { CreateCostDto } from './dto/create-cost.dto';
import { UpdateCostDto } from './dto/update-cost.dto';

@Injectable()
export class CostsService {
  constructor(private prisma: PrismaService) {}

  async create(createCostDto: CreateCostDto, userId: string): Promise<Cost> {
    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: createCostDto.projectId },
      include: { organization: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: project.organizationId,
        userId: userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to create costs in this project',
      );
    }

    return this.prisma.cost.create({
      data: createCostDto,
    });
  }

  async findAll(projectId: string, userId: string): Promise<Cost[]> {
    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { organization: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: project.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to view costs in this project',
      );
    }

    return this.prisma.cost.findMany({
      where: {
        projectId,
      },
    });
  }

  async findOne(id: string, userId: string): Promise<Cost> {
    const cost = await this.prisma.cost.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!cost) {
      throw new NotFoundException('Cost not found');
    }

    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: cost.project.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to view this cost',
      );
    }

    return cost;
  }

  async update(
    id: string,
    updateCostDto: UpdateCostDto,
    userId: string,
  ): Promise<Cost> {
    const cost = await this.prisma.cost.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!cost) {
      throw new NotFoundException('Cost not found');
    }

    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: cost.project.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to update costs in this project',
      );
    }

    return this.prisma.cost.update({
      where: { id },
      data: updateCostDto,
    });
  }

  async remove(id: string, userId: string): Promise<Cost> {
    const cost = await this.prisma.cost.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!cost) {
      throw new NotFoundException('Cost not found');
    }

    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: cost.project.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to delete costs in this project',
      );
    }

    return this.prisma.cost.delete({
      where: { id },
    });
  }
}
