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
import { ProjectsService } from './projects.service';
import { Project } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { RequestWithUser } from '../auth/interfaces/request-with-user';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({
    status: 201,
    description: 'The project has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(
    @Body() createProjectDto: CreateProjectDto,
    @Request() req: RequestWithUser,
  ): Promise<Project> {
    return this.projectsService.create(createProjectDto, req.user.userId);
  }

  @Get('organization/:organizationId')
  @ApiOperation({ summary: 'Get all projects for an organization' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: 'Return all projects for the organization.',
    type: 'PaginatedResponse<Project>',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Param('organizationId') organizationId: string,
    @Request() req: RequestWithUser,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Project>> {
    return this.projectsService.findAll(
      organizationId,
      req.user.userId,
      paginationDto,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by id' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the project.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  findOne(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<Project> {
    return this.projectsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({
    status: 200,
    description: 'The project has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req: RequestWithUser,
  ): Promise<Project> {
    return this.projectsService.update(id, updateProjectDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'The project has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  remove(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<Project> {
    return this.projectsService.remove(id, req.user.userId);
  }

  @Get('organization/:organizationId/status/:statusId')
  @ApiOperation({ summary: 'Get all projects for an organization by status' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiParam({ name: 'statusId', description: 'Status ID' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: 'Return all projects for the organization by status.',
    type: 'PaginatedResponse<Project>',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAllByStatus(
    @Param('organizationId') organizationId: string,
    @Param('statusId') statusId: string,
    @Request() req: RequestWithUser,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Project>> {
    return this.projectsService.findAllByStatus(
      organizationId,
      req.user.userId,
      statusId,
      paginationDto,
    );
  }
}
