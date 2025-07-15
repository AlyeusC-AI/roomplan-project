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
import { FilterProjectsDto } from './dto/filter-projects.dto';
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
import { SendLidarEmailDto } from './dto/send-lidar-email.dto';

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
  @ApiQuery({ type: FilterProjectsDto })
  @ApiQuery({
    name: 'tagNames',
    description: 'Filter by tag names (comma-separated)',
    required: false,
    type: String,
  })
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
    @Query() filterDto: FilterProjectsDto,
    @Query('tagNames') tagNames?: string,
  ): Promise<PaginatedResponse<Project>> {
    const tagNamesArray = tagNames
      ? tagNames.split(',').map((tag) => tag.trim())
      : undefined;

    return this.projectsService.findAll(
      organizationId,
      req.user.userId,
      filterDto,
      tagNamesArray,
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
  @ApiOperation({ summary: 'Update project by id' })
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
    @Body() updateProjectDto: UpdateProjectDto & { copilotProgress?: any },
    @Request() req: RequestWithUser,
  ): Promise<Project> {
    return this.projectsService.update(id, updateProjectDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project by id' })
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

  @Get(':id/member')
  @ApiOperation({ summary: 'Get all members of a project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all members of the project.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  getMembers(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.projectsService.getProjectMembers(id, req.user.userId);
  }

  @Post(':id/member')
  @ApiOperation({ summary: 'Add a member to a project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'User ID to add as a member',
        },
      },
      required: ['userId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The member has been successfully added to the project.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Project or user not found.' })
  addMember(
    @Param('id') id: string,
    @Body() body: { userId: string },
    @Request() req: RequestWithUser,
  ) {
    return this.projectsService.addProjectMember(
      id,
      body.userId,
      req.user.userId,
    );
  }

  @Delete(':id/member')
  @ApiOperation({ summary: 'Remove a member from a project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'User ID to remove from the project',
        },
      },
      required: ['userId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The member has been successfully removed from the project.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Project or member not found.' })
  removeMember(
    @Param('id') id: string,
    @Body() body: { userId: string },
    @Request() req: RequestWithUser,
  ) {
    return this.projectsService.removeProjectMember(
      id,
      body.userId,
      req.user.userId,
    );
  }

  @Get('organization/:organizationId/status/:statusId')
  @ApiOperation({ summary: 'Get all projects for an organization by status' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiParam({ name: 'statusId', description: 'Status ID' })
  @ApiQuery({ type: FilterProjectsDto })
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
    @Query() filterDto: FilterProjectsDto,
  ): Promise<PaginatedResponse<Project>> {
    return this.projectsService.findAllByStatus(
      organizationId,
      req.user.userId,
      statusId,
      filterDto,
    );
  }

  @Post(':id/lidar/email')
  @UseGuards(JwtAuthGuard)
  async sendLidarEmail(
    @Param('id') id: string,
    @Body() data: SendLidarEmailDto,
  ) {
    return this.projectsService.sendLidarEmail(id, data);
  }
}
