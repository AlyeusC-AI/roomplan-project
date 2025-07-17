import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChambersService } from './chambers.service';
import { Prisma } from '@prisma/client';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateChamberDto, UpdateChamberDto } from './dto';

@ApiTags('chambers')
@ApiBearerAuth()
@Controller('chambers')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class ChambersController {
  constructor(private readonly chambersService: ChambersService) {}

  @Post()
  async create(@Body() data: CreateChamberDto): Promise<
    Prisma.ChamberGetPayload<{
      include: { roomChambers: { include: { room: true } } };
    }>
  > {
    return this.chambersService.create(data);
  }

  @Get('project/:projectId')
  async findAll(@Param('projectId') projectId: string): Promise<
    Prisma.ChamberGetPayload<{
      include: { roomChambers: { include: { room: true } } };
    }>[]
  > {
    return this.chambersService.findAll(projectId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<
    Prisma.ChamberGetPayload<{
      include: { roomChambers: { include: { room: true } } };
    }>
  > {
    return this.chambersService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateChamberDto,
  ): Promise<
    Prisma.ChamberGetPayload<{
      include: { roomChambers: { include: { room: true } } };
    }>
  > {
    return this.chambersService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<
    Prisma.ChamberGetPayload<{
      include: { roomChambers: { include: { room: true } } };
    }>
  > {
    return this.chambersService.delete(id);
  }
}
