import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { ImageType, Prisma } from '@prisma/client';
import {
  ImageFilters,
  ImageSortOptions,
  PaginationOptions,
} from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  async create(@Body() data: { name: string; projectId: string }): Promise<
    Prisma.RoomGetPayload<{
      include: { images: { include: { comments: true } } };
    }>
  > {
    return this.roomsService.create(data);
  }

  @Get('project/:projectId')
  async findAll(@Param('projectId') projectId: string): Promise<
    Prisma.RoomGetPayload<{
      include: { images: { include: { comments: true } } };
    }>[]
  > {
    return this.roomsService.findAll(projectId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Prisma.RoomGetPayload<{
    include: { images: { include: { comments: true } } };
  }> | null> {
    return this.roomsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    data: {
      name?: string;
      equipmentUsed?: { id: string; quantity: number }[];
      length?: number;
      width?: number;
      height?: number;
      totalSqft?: number;
      windows?: number;
      doors?: number;
      humidity?: number;
      dehuReading?: number;
      temperature?: number;
      roomPlanSVG?: string;
      scannedFileKey?: string;
      cubiTicketId?: string;
      cubiModelId?: string;
      cubiRoomPlan?: string;
    },
  ): Promise<
    Prisma.RoomGetPayload<{
      include: { images: { include: { comments: true } } };
    }>
  > {
    return this.roomsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<
    Prisma.RoomGetPayload<{
      include: { images: { include: { comments: true } } };
    }>
  > {
    return this.roomsService.delete(id);
  }

  // Image endpoints
  @Post('images')
  async addImage(
    @Body()
    data: {
      url: string;
      showInReport?: boolean;
      order?: number;
      projectId: string;
      roomId?: string;
      name?: string;
      description?: string;
      type?: ImageType;
    },
  ): Promise<Prisma.ImageGetPayload<{ include: { comments: true } }>> {
    return this.roomsService.addImage(data);
  }

  @Delete('images/:imageId')
  async removeImage(
    @Param('imageId') imageId: string,
  ): Promise<Prisma.ImageGetPayload<{ include: { comments: true } }>> {
    return this.roomsService.removeImage(imageId);
  }

  @Put('images/:imageId')
  async updateImage(
    @Param('imageId') imageId: string,
    @Body()
    data: {
      url?: string;
      showInReport?: boolean;
      order?: number;
      name?: string;
      description?: string;
      type?: ImageType;
    },
  ): Promise<Prisma.ImageGetPayload<{ include: { comments: true } }>> {
    return this.roomsService.updateImage(imageId, data);
  }

  // Comment endpoints
  @Post('images/:imageId/comments')
  async addComment(
    @Param('imageId') imageId: string,
    @Body() data: { content: string; userId: string },
  ): Promise<Prisma.CommentGetPayload<{}>> {
    return this.roomsService.addComment(imageId, data);
  }

  @Delete('comments/:commentId')
  async removeComment(
    @Param('commentId') commentId: string,
  ): Promise<Prisma.CommentGetPayload<{}>> {
    return this.roomsService.removeComment(commentId);
  }

  // Get comments for an image
  @Get('images/:imageId/comments')
  async getComments(
    @Param('imageId') imageId: string,
  ): Promise<Prisma.CommentGetPayload<{}>[]> {
    return this.roomsService.getComments(imageId);
  }

  // Get all images that are marked for report in a room
  @Get(':id/report-images')
  async getReportImages(
    @Param('id') roomId: string,
  ): Promise<Prisma.ImageGetPayload<{ include: { comments: true } }>[]> {
    return this.roomsService.getReportImages(roomId);
  }

  // Get all images in a room
  @Get(':id/images')
  async getAllRoomImages(
    @Param('id') roomId: string,
  ): Promise<Prisma.ImageGetPayload<{ include: { comments: true } }>[]> {
    return this.roomsService.getAllRoomImages(roomId);
  }

  // Update multiple images' showInReport status
  @Patch('images/report-status')
  async updateImagesInReport(
    @Body() data: { imageIds: string[]; showInReport: boolean },
  ): Promise<Prisma.BatchPayload> {
    return this.roomsService.updateImagesInReport(
      data.imageIds,
      data.showInReport,
    );
  }

  // Update images order in bulk
  @Patch('images/order')
  async updateImagesOrder(
    @Body() updates: { id: string; order: number }[],
  ): Promise<Prisma.BatchPayload> {
    return this.roomsService.updateImagesOrder(updates);
  }

  // Toggle all images in a room for report
  @Patch(':id/images/toggle-all-report')
  async toggleAllRoomImagesInReport(
    @Param('id') roomId: string,
    @Body() data: { showInReport: boolean },
  ): Promise<Prisma.BatchPayload> {
    return this.roomsService.toggleAllRoomImagesInReport(
      roomId,
      data.showInReport,
    );
  }

  // Advanced image search with filters, sorting, and pagination
  @Get('project/:projectId/images/search')
  async findImages(
    @Param('projectId') projectId: string,
    @Query('type') type: ImageType,
    @Query('showInReport') showInReport?: string,
    @Query('hasComments') hasComments?: string,
    @Query('createdAfter') createdAfter?: string,
    @Query('createdBefore') createdBefore?: string,
    @Query('roomIds') roomIds?: string,
    @Query('searchTerm') searchTerm?: string,
    @Query('sortField') sortField?: 'createdAt' | 'order' | 'url',
    @Query('sortDirection') sortDirection?: 'asc' | 'desc',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: ImageFilters = {
      projectId,
      showInReport: showInReport ? showInReport === 'true' : undefined,
      hasComments: hasComments ? hasComments === 'true' : undefined,
      createdAfter: createdAfter ? new Date(createdAfter) : undefined,
      createdBefore: createdBefore ? new Date(createdBefore) : undefined,
      roomIds: roomIds ? roomIds.split(',') : undefined,
      searchTerm,
      type: type,
    };

    const sort: ImageSortOptions = {
      field: sortField || 'createdAt',
      direction: sortDirection || 'desc',
    };

    const pagination: PaginationOptions = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    };

    return this.roomsService.findImages(filters, sort, pagination);
  }

  // Get image statistics for a project
  @Get('project/:projectId/images/stats')
  async getImageStats(@Param('projectId') projectId: string) {
    return this.roomsService.getImageStats(projectId);
  }

  // Bulk update images with filtering
  @Patch('project/:projectId/images/bulk-update')
  async bulkUpdateImages(
    @Param('projectId') projectId: string,
    @Body()
    data: {
      filters: Omit<ImageFilters, 'projectId'>;
      updates: { showInReport?: boolean; order?: number };
    },
  ) {
    const filters = {
      ...data.filters,
      projectId,
    };
    return this.roomsService.bulkUpdateImages(filters, data.updates);
  }

  // Bulk remove images with filtering
  @Delete('project/:projectId/images/bulk-remove')
  async bulkRemoveImages(
    @Param('projectId') projectId: string,
    @Body() data: { filters: Omit<ImageFilters, 'projectId'> },
  ) {
    const filters = {
      ...data.filters,
      projectId,
    };
    return this.roomsService.bulkRemoveImages(filters);
  }

  // Area Affected endpoints
  @Patch(':id/area-affected/:type')
  async updateAreaAffected(
    @Param('id') roomId: string,
    @Param('type') type: 'floor' | 'walls' | 'ceiling',
    @Body()
    data: {
      material?: string;
      totalAreaRemoved?: string;
      totalAreaMicrobialApplied?: string;
      cabinetryRemoved?: string;
      isVisible?: boolean;
      extraFields?: any;
    },
  ) {
    return this.roomsService.updateAreaAffected(roomId, type, data);
  }

  @Delete(':id/area-affected/:type')
  async deleteAreaAffected(
    @Param('id') roomId: string,
    @Param('type') type: 'floor' | 'walls' | 'ceiling',
  ) {
    return this.roomsService.deleteAreaAffected(roomId, type);
  }

  @Get(':id/area-affected')
  async getAreaAffected(@Param('id') roomId: string) {
    return this.roomsService.getAreaAffected(roomId);
  }
}
