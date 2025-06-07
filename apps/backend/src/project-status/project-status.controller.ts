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
} from '@nestjs/common';
import { ProjectStatusService } from './project-status.service';
import { ProjectStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProjectStatusDto } from './dto/create-project-status.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { ReorderProjectStatusDto } from './dto/reorder-project-status.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RequestWithUser } from '../auth/interfaces/request-with-user';

@ApiTags('project-status')
@ApiBearerAuth()
@Controller('project-status')
@UseGuards(JwtAuthGuard)
export class ProjectStatusController {
  constructor(private readonly projectStatusService: ProjectStatusService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project status' })
  @ApiBody({ type: CreateProjectStatusDto })
  @ApiResponse({
    status: 201,
    description: 'The project status has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(
    @Body() createProjectStatusDto: CreateProjectStatusDto,
    @Request() req: RequestWithUser,
  ): Promise<ProjectStatus> {
    return this.projectStatusService.create(
      createProjectStatusDto,
      req.user.userId,
    );
  }

  @Get('organization/:organizationId')
  @ApiOperation({ summary: 'Get all project statuses for an organization' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all project statuses for the organization.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Param('organizationId') organizationId: string,
    @Request() req: RequestWithUser,
  ): Promise<ProjectStatus[]> {
    return this.projectStatusService.findAll(organizationId, req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project status by id' })
  @ApiParam({ name: 'id', description: 'Project Status ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the project status.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Project status not found.' })
  findOne(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<ProjectStatus> {
    return this.projectStatusService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project status' })
  @ApiParam({ name: 'id', description: 'Project Status ID' })
  @ApiBody({ type: UpdateProjectStatusDto })
  @ApiResponse({
    status: 200,
    description: 'The project status has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Project status not found.' })
  update(
    @Param('id') id: string,
    @Body() updateProjectStatusDto: UpdateProjectStatusDto,
    @Request() req: RequestWithUser,
  ): Promise<ProjectStatus> {
    return this.projectStatusService.update(
      id,
      updateProjectStatusDto,
      req.user.userId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project status' })
  @ApiParam({ name: 'id', description: 'Project Status ID' })
  @ApiResponse({
    status: 200,
    description: 'The project status has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Project status not found.' })
  remove(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<ProjectStatus> {
    return this.projectStatusService.remove(id, req.user.userId);
  }

  @Post('organization/:organizationId/reorder')
  @ApiOperation({ summary: 'Reorder project statuses' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiBody({ type: ReorderProjectStatusDto })
  @ApiResponse({
    status: 200,
    description: 'The project statuses have been successfully reordered.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  reorder(
    @Param('organizationId') organizationId: string,
    @Body() reorderDto: ReorderProjectStatusDto,
    @Request() req: RequestWithUser,
  ): Promise<ProjectStatus[]> {
    return this.projectStatusService.reorder(
      organizationId,
      reorderDto,
      req.user.userId,
    );
  }
}
