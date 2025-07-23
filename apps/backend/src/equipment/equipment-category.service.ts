import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EquipmentCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; organizationId: string }): Promise<any> {
    // Prevent duplicate category names per org
    const exists = await this.prisma.equipmentCategory.findUnique({
      where: {
        name_organizationId: {
          name: data.name,
          organizationId: data.organizationId,
        },
      },
    });
    if (exists) throw new BadRequestException('Category already exists');
    return this.prisma.equipmentCategory.create({ data });
  }

  async findAll(organizationId: string): Promise<any[]> {
    return this.prisma.equipmentCategory.findMany({
      where: { organizationId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async findOne(id: string): Promise<any> {
    const category = await this.prisma.equipmentCategory.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, data: { name?: string }): Promise<any> {
    await this.findOne(id);
    return this.prisma.equipmentCategory.update({ where: { id }, data });
  }

  async delete(id: string): Promise<any> {
    await this.findOne(id);
    return this.prisma.equipmentCategory.delete({ where: { id } });
  }
}
