import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateMaterialDto,
  UpdateMaterialDto,
  CreateProjectMaterialDto,
  UpdateProjectMaterialDto,
} from './dto';

@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}

  async create(
    data: CreateMaterialDto,
    organizationId?: string,
  ): Promise<Prisma.MaterialGetPayload<{}>> {
    // Validate variance is within acceptable range for dry standard
    if (data.variance < 0 || data.variance > 100) {
      throw new BadRequestException('Variance must be between 0 and 100');
    }

    return this.prisma.material.create({
      data: {
        name: data.name,
        description: data.description,
        image: data.image,
        variance: data.variance,
        organizationId: organizationId || null,
        isDefault: !organizationId, // If no organization, it's a default material
      },
    });
  }

  async findAll(
    organizationId?: string,
  ): Promise<Prisma.MaterialGetPayload<{}>[]> {
    return this.prisma.material.findMany({
      where: {
        OR: [
          { isDefault: true }, // Include all default materials
          { organizationId: organizationId }, // Include organization-specific materials
        ],
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<Prisma.MaterialGetPayload<{}>> {
    const material = await this.prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }

    return material;
  }

  async update(
    id: string,
    data: UpdateMaterialDto,
  ): Promise<Prisma.MaterialGetPayload<{}>> {
    // Check if material exists
    await this.findOne(id);

    // Validate variance if provided
    if (data.variance !== undefined) {
      if (data.variance < 0 || data.variance > 100) {
        throw new BadRequestException('Variance must be between 0 and 100');
      }
    }

    return this.prisma.material.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        image: data.image,
        variance: data.variance,
      },
    });
  }

  async delete(id: string): Promise<Prisma.MaterialGetPayload<{}>> {
    // Check if material exists
    await this.findOne(id);

    return this.prisma.material.delete({
      where: { id },
    });
  }

  // Helper method to get materials suitable for dry standard
  async getDryStandardMaterials(): Promise<Prisma.MaterialGetPayload<{}>[]> {
    return this.prisma.material.findMany({
      where: {
        variance: {
          gte: 0,
          lte: 15, // Dry standard typically requires variance <= 15%
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  // Helper method to check if a material meets dry standard
  async isDryStandardCompliant(materialId: string): Promise<boolean> {
    const material = await this.findOne(materialId);
    return material.variance <= 15; // Dry standard threshold
  }

  // Project Material Methods
  async createProjectMaterial(
    data: CreateProjectMaterialDto,
  ): Promise<Prisma.ProjectMaterialGetPayload<{}>> {
    // Validate moisture values
    if (
      data.initialMoisture !== undefined &&
      (data.initialMoisture < 0 || data.initialMoisture > 100)
    ) {
      throw new BadRequestException(
        'Initial moisture must be between 0 and 100',
      );
    }
    if (
      data.currentMoisture !== undefined &&
      (data.currentMoisture < 0 || data.currentMoisture > 100)
    ) {
      throw new BadRequestException(
        'Current moisture must be between 0 and 100',
      );
    }
    if (
      data.dryGoal !== undefined &&
      (data.dryGoal < 0 || data.dryGoal > 100)
    ) {
      throw new BadRequestException('Dry goal must be between 0 and 100');
    }
    if (
      data.customVariance !== undefined &&
      (data.customVariance < 0 || data.customVariance > 100)
    ) {
      throw new BadRequestException(
        'Custom variance must be between 0 and 100',
      );
    }

    // Calculate dry standard compliance
    const effectiveVariance =
      data.customVariance || (await this.findOne(data.materialId)).variance;
    const isDryStandardCompliant = effectiveVariance <= 15;

    return this.prisma.projectMaterial.create({
      data: {
        projectId: data.projectId,
        materialId: data.materialId,
        customVariance: data.customVariance,
        initialMoisture: data.initialMoisture,
        currentMoisture: data.currentMoisture,
        dryGoal: data.dryGoal,
        isDryStandardCompliant,
      },
      include: {
        material: true,
        project: true,
        wallReadings: true,
      },
    });
  }

  async getProjectMaterials(
    projectId: string,
  ): Promise<Prisma.ProjectMaterialGetPayload<{}>[]> {
    return this.prisma.projectMaterial.findMany({
      where: { projectId },
      include: {
        material: true,
        wallReadings: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getProjectMaterial(id: string): Promise<
    Prisma.ProjectMaterialGetPayload<{
      include: {
        material: true;
        project: true;
        wallReadings: true;
      };
    }>
  > {
    const projectMaterial = await this.prisma.projectMaterial.findUnique({
      where: { id },
      include: {
        material: true,
        project: true,
        wallReadings: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!projectMaterial) {
      throw new NotFoundException(`Project material with ID ${id} not found`);
    }

    return projectMaterial;
  }

  async updateProjectMaterial(
    id: string,
    data: UpdateProjectMaterialDto,
  ): Promise<Prisma.ProjectMaterialGetPayload<{}>> {
    // Check if project material exists
    await this.getProjectMaterial(id);

    // Validate moisture values
    if (
      data.initialMoisture !== undefined &&
      (data.initialMoisture < 0 || data.initialMoisture > 100)
    ) {
      throw new BadRequestException(
        'Initial moisture must be between 0 and 100',
      );
    }
    if (
      data.currentMoisture !== undefined &&
      (data.currentMoisture < 0 || data.currentMoisture > 100)
    ) {
      throw new BadRequestException(
        'Current moisture must be between 0 and 100',
      );
    }
    if (
      data.dryGoal !== undefined &&
      (data.dryGoal < 0 || data.dryGoal > 100)
    ) {
      throw new BadRequestException('Dry goal must be between 0 and 100');
    }
    if (
      data.customVariance !== undefined &&
      (data.customVariance < 0 || data.customVariance > 100)
    ) {
      throw new BadRequestException(
        'Custom variance must be between 0 and 100',
      );
    }

    // Recalculate dry standard compliance if variance changed
    let isDryStandardCompliant: boolean | undefined;
    if (data.customVariance !== undefined) {
      const projectMaterial = await this.getProjectMaterial(id);
      const effectiveVariance =
        data.customVariance || projectMaterial.material.variance;
      isDryStandardCompliant = effectiveVariance <= 15;
    }

    return this.prisma.projectMaterial.update({
      where: { id },
      data: {
        customVariance: data.customVariance,
        initialMoisture: data.initialMoisture,
        currentMoisture: data.currentMoisture,
        dryGoal: data.dryGoal,
        ...(isDryStandardCompliant !== undefined && { isDryStandardCompliant }),
      },
      include: {
        material: true,
        project: true,
        wallReadings: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async deleteProjectMaterial(
    id: string,
  ): Promise<Prisma.ProjectMaterialGetPayload<{}>> {
    // Check if project material exists
    await this.getProjectMaterial(id);

    return this.prisma.projectMaterial.delete({
      where: { id },
      include: {
        material: true,
        project: true,
      },
    });
  }

  // Helper method to calculate dry goal based on material variance
  async calculateDryGoal(
    materialId: string,
    initialMoisture: number,
  ): Promise<number> {
    const material = await this.findOne(materialId);
    const variance = material.variance;

    // Dry goal calculation: initial moisture - variance
    // This ensures the material reaches the dry standard threshold
    return Math.max(0, initialMoisture - variance);
  }

  // Helper method to check if current moisture meets dry goal
  async checkDryGoalCompliance(projectMaterialId: string): Promise<{
    isCompliant: boolean;
    currentMoisture: number;
    dryGoal: number;
    difference: number;
  }> {
    const projectMaterial = await this.getProjectMaterial(projectMaterialId);

    if (!projectMaterial.currentMoisture || !projectMaterial.dryGoal) {
      throw new BadRequestException(
        'Current moisture and dry goal must be set',
      );
    }

    const difference =
      projectMaterial.currentMoisture - projectMaterial.dryGoal;
    const isCompliant = difference <= 0; // Current moisture should be <= dry goal

    return {
      isCompliant,
      currentMoisture: projectMaterial.currentMoisture,
      dryGoal: projectMaterial.dryGoal,
      difference: Math.abs(difference),
    };
  }
}
