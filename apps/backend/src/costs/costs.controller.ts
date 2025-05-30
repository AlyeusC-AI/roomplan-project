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
import { CostsService } from './costs.service';
import { Cost } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCostDto } from './dto/create-cost.dto';
import { UpdateCostDto } from './dto/update-cost.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RequestWithUser } from '../auth/interfaces/request-with-user';

@ApiTags('costs')
@ApiBearerAuth()
@Controller('costs')
@UseGuards(JwtAuthGuard)
export class CostsController {
  constructor(private readonly costsService: CostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new cost' })
  @ApiBody({ type: CreateCostDto })
  @ApiResponse({
    status: 201,
    description: 'The cost has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(
    @Body() createCostDto: CreateCostDto,
    @Request() req: RequestWithUser,
  ): Promise<Cost> {
    return this.costsService.create(createCostDto, req.user.userId);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all costs for a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all costs for the project.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Param('projectId') projectId: string,
    @Request() req: RequestWithUser,
  ): Promise<Cost[]> {
    return this.costsService.findAll(projectId, req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cost by id' })
  @ApiParam({ name: 'id', description: 'Cost ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the cost.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Cost not found.' })
  findOne(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<Cost> {
    return this.costsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cost' })
  @ApiParam({ name: 'id', description: 'Cost ID' })
  @ApiBody({ type: UpdateCostDto })
  @ApiResponse({
    status: 200,
    description: 'The cost has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Cost not found.' })
  update(
    @Param('id') id: string,
    @Body() updateCostDto: UpdateCostDto,
    @Request() req: RequestWithUser,
  ): Promise<Cost> {
    return this.costsService.update(id, updateCostDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete cost' })
  @ApiParam({ name: 'id', description: 'Cost ID' })
  @ApiResponse({
    status: 200,
    description: 'The cost has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Cost not found.' })
  remove(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<Cost> {
    return this.costsService.remove(id, req.user.userId);
  }
}
