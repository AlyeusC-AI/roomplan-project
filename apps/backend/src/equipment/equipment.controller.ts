import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { Equipment, EquipmentProject } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { AssignEquipmentDto } from './dto/assign-equipment.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RequestWithUser } from '../auth/interfaces/request-with-user';

@ApiTags('equipment')
@ApiBearerAuth()
@Controller('equipment')
@UseGuards(JwtAuthGuard)
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new equipment' })
  @ApiBody({ type: CreateEquipmentDto })
  @ApiResponse({
    status: 201,
    description: 'The equipment has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(
    @Body() createEquipmentDto: CreateEquipmentDto,
    @Request() req: RequestWithUser,
  ): Promise<Equipment> {
    return this.equipmentService.create(createEquipmentDto, req.user.userId);
  }

  @Get('organization/:organizationId')
  @ApiOperation({ summary: 'Get all equipment for an organization' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all equipment for the organization.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Param('organizationId') organizationId: string,
    @Query('categoryId') categoryId: string,
    @Request() req: RequestWithUser,
  ): Promise<Equipment[]> {
    return this.equipmentService.findAll(
      organizationId,
      req.user.userId,
      categoryId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get equipment by id' })
  @ApiParam({ name: 'id', description: 'Equipment ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the equipment.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Equipment not found.' })
  findOne(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<Equipment> {
    return this.equipmentService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update equipment' })
  @ApiParam({ name: 'id', description: 'Equipment ID' })
  @ApiBody({ type: UpdateEquipmentDto })
  @ApiResponse({
    status: 200,
    description: 'The equipment has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Equipment not found.' })
  update(
    @Param('id') id: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
    @Request() req: RequestWithUser,
  ): Promise<Equipment> {
    return this.equipmentService.update(
      id,
      updateEquipmentDto,
      req.user.userId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete equipment' })
  @ApiParam({ name: 'id', description: 'Equipment ID' })
  @ApiResponse({
    status: 200,
    description: 'The equipment has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Equipment not found.' })
  remove(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<Equipment> {
    return this.equipmentService.remove(id, req.user.userId);
  }

  @Post('assign')
  @ApiOperation({
    summary: 'Assign equipment to a project and optionally to a room',
  })
  @ApiBody({ type: AssignEquipmentDto })
  @ApiResponse({
    status: 201,
    description: 'The equipment has been successfully assigned.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 404,
    description: 'Equipment, project, or room not found.',
  })
  assignEquipment(
    @Body() assignEquipmentDto: AssignEquipmentDto,
    @Request() req: RequestWithUser,
  ): Promise<EquipmentProject> {
    return this.equipmentService.assignEquipment(
      assignEquipmentDto,
      req.user.userId,
    );
  }

  @Get('project/:projectId/assignments')
  @ApiOperation({ summary: 'Get all equipment assignments for a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all equipment assignments for the project.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  getEquipmentAssignments(
    @Param('projectId') projectId: string,
    @Request() req: RequestWithUser,
  ): Promise<EquipmentProject[]> {
    return this.equipmentService.getEquipmentAssignments(
      projectId,
      req.user.userId,
    );
  }

  @Delete('assignment/:id')
  @ApiOperation({ summary: 'Remove an equipment assignment' })
  @ApiParam({ name: 'id', description: 'Equipment Assignment ID' })
  @ApiResponse({
    status: 200,
    description: 'The equipment assignment has been successfully removed.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Equipment assignment not found.' })
  removeEquipmentAssignment(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<EquipmentProject> {
    return this.equipmentService.removeEquipmentAssignment(id, req.user.userId);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get equipment assignment history' })
  @ApiParam({ name: 'id', description: 'Equipment ID' })
  @ApiResponse({
    status: 200,
    description: 'Return equipment assignment history.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Equipment not found.' })
  getEquipmentHistory(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<EquipmentProject[]> {
    return this.equipmentService.getEquipmentHistory(id, req.user.userId);
  }
}
