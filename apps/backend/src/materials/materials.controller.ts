import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { Prisma } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  CreateMaterialDto,
  UpdateMaterialDto,
  CreateProjectMaterialDto,
  UpdateProjectMaterialDto,
} from './dto';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user';

@ApiTags('materials')
@ApiBearerAuth()
@Controller('materials')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  async create(
    @Body() data: CreateMaterialDto,
    @Req() req: RequestWithUser,
  ): Promise<Prisma.MaterialGetPayload<{}>> {
    // Get organization ID from user context
    const organizationId = req.user.organizationId;
    return this.materialsService.create(data, organizationId);
  }

  @Get()
  async findAll(
    @Req() req: RequestWithUser,
  ): Promise<Prisma.MaterialGetPayload<{}>[]> {
    // Get organization ID from user context
    const organizationId = req.user.organizationId;
    return this.materialsService.findAll(organizationId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<Prisma.MaterialGetPayload<{}>> {
    return this.materialsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateMaterialDto,
  ): Promise<Prisma.MaterialGetPayload<{}>> {
    return this.materialsService.update(id, data);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
  ): Promise<Prisma.MaterialGetPayload<{}>> {
    return this.materialsService.delete(id);
  }

  // Project Material Endpoints
  @Post('project')
  async createProjectMaterial(
    @Body() data: CreateProjectMaterialDto,
  ): Promise<any> {
    return this.materialsService.createProjectMaterial(data);
  }

  @Get('project/:projectId')
  async getProjectMaterials(
    @Param('projectId') projectId: string,
  ): Promise<any[]> {
    return this.materialsService.getProjectMaterials(projectId);
  }

  @Get('project-material/:id')
  async getProjectMaterial(@Param('id') id: string): Promise<any> {
    return this.materialsService.getProjectMaterial(id);
  }

  @Put('project-material/:id')
  async updateProjectMaterial(
    @Param('id') id: string,
    @Body() data: UpdateProjectMaterialDto,
  ): Promise<any> {
    return this.materialsService.updateProjectMaterial(id, data);
  }

  @Delete('project-material/:id')
  async deleteProjectMaterial(@Param('id') id: string): Promise<any> {
    return this.materialsService.deleteProjectMaterial(id);
  }

  @Get('project-material/:id/dry-goal-compliance')
  async checkDryGoalCompliance(@Param('id') id: string): Promise<any> {
    return this.materialsService.checkDryGoalCompliance(id);
  }

  @Get('calculate-dry-goal/:materialId/:initialMoisture')
  async calculateDryGoal(
    @Param('materialId') materialId: string,
    @Param('initialMoisture') initialMoisture: string,
  ): Promise<any> {
    const moisture = parseFloat(initialMoisture);
    if (isNaN(moisture)) {
      throw new Error('Invalid initial moisture value');
    }
    return this.materialsService.calculateDryGoal(materialId, moisture);
  }
}
