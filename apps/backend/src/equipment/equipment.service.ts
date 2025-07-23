import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Equipment,
  Role,
  MemberStatus,
  EquipmentProject,
} from '@prisma/client';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { AssignEquipmentDto } from './dto/assign-equipment.dto';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  async create(
    createEquipmentDto: CreateEquipmentDto,
    userId: string,
  ): Promise<Equipment> {
    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: createEquipmentDto.organizationId,
        userId: userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to create equipment in this organization',
      );
    }

    return this.prisma.equipment.create({
      data: createEquipmentDto,
    });
  }

  async findAll(
    organizationId: string,
    userId: string,
    categoryId?: string,
  ): Promise<Equipment[]> {
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
        'You do not have permission to view equipment in this organization',
      );
    }

    return this.prisma.equipment.findMany({
      where: {
        organizationId,
        ...(categoryId ? { categoryId } : {}),
      },
    });
  }

  async findOne(id: string, userId: string): Promise<Equipment> {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id },
    });

    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: equipment.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to view this equipment',
      );
    }

    return equipment;
  }

  async update(
    id: string,
    updateEquipmentDto: UpdateEquipmentDto,
    userId: string,
  ): Promise<Equipment> {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id },
    });

    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: equipment.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to update equipment in this organization',
      );
    }

    return this.prisma.equipment.update({
      where: { id },
      data: updateEquipmentDto,
    });
  }

  async remove(id: string, userId: string): Promise<Equipment> {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id },
    });

    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: equipment.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to delete equipment in this organization',
      );
    }

    return this.prisma.equipment.delete({
      where: { id },
    });
  }

  async assignEquipment(
    assignEquipmentDto: AssignEquipmentDto,
    userId: string,
  ): Promise<EquipmentProject> {
    // Check if equipment exists
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: assignEquipmentDto.equipmentId },
    });

    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: assignEquipmentDto.projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if room exists if roomId is provided
    if (assignEquipmentDto.roomId) {
      const room = await this.prisma.room.findUnique({
        where: { id: assignEquipmentDto.roomId },
      });

      if (!room) {
        throw new NotFoundException('Room not found');
      }
    }

    // Check if user has permission
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: equipment.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to assign equipment in this organization',
      );
    }

    // Create equipment project assignment
    return this.prisma.equipmentProject.create({
      data: {
        equipmentId: assignEquipmentDto.equipmentId,
        projectId: assignEquipmentDto.projectId,
        quantity: assignEquipmentDto.quantity,
        ...(assignEquipmentDto.roomId
          ? { roomId: assignEquipmentDto.roomId }
          : {}),
      },
    });
  }

  async getEquipmentAssignments(
    projectId: string,
    userId: string,
  ): Promise<EquipmentProject[]> {
    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { organization: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user has permission
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: project.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to view equipment assignments in this project',
      );
    }

    return this.prisma.equipmentProject.findMany({
      where: { projectId },
      include: {
        equipment: true,
        room: true,
      },
    });
  }

  async removeEquipmentAssignment(
    assignmentId: string,
    userId: string,
  ): Promise<EquipmentProject> {
    const assignment = await this.prisma.equipmentProject.findUnique({
      where: { id: assignmentId },
      include: {
        equipment: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Equipment assignment not found');
    }

    // Check if user has permission
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: assignment.equipment.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to remove equipment assignments in this organization',
      );
    }

    return this.prisma.equipmentProject.delete({
      where: { id: assignmentId },
    });
  }
}
