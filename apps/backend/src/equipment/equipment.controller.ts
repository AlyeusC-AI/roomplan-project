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
import { EquipmentService } from './equipment.service';
import { Equipment } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
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
    @Request() req: RequestWithUser,
  ): Promise<Equipment[]> {
    return this.equipmentService.findAll(organizationId, req.user.userId);
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
}
