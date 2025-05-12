import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Equipment, Role, MemberStatus } from '@prisma/client';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';

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

  async findAll(organizationId: string, userId: string): Promise<Equipment[]> {
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
}
