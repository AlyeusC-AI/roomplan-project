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
import { CalendarEventsService } from './calendar-events.service';
import { CalendarEvent } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
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

@ApiTags('calendar-events')
@ApiBearerAuth()
@Controller('calendar-events')
@UseGuards(JwtAuthGuard)
export class CalendarEventsController {
  constructor(private readonly calendarEventsService: CalendarEventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new calendar event' })
  @ApiBody({ type: CreateCalendarEventDto })
  @ApiResponse({
    status: 201,
    description: 'The calendar event has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(
    @Body() createCalendarEventDto: CreateCalendarEventDto,
    @Request() req: RequestWithUser,
  ): Promise<CalendarEvent> {
    return this.calendarEventsService.create(
      createCalendarEventDto,
      req.user.userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all calendar events for an organization' })
  @ApiQuery({ name: 'organizationId', description: 'Organization ID' })
  @ApiQuery({ name: 'projectId', description: 'Project ID', required: false })
  @ApiResponse({
    status: 200,
    description: 'Return all calendar events for the organization.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Request() req: RequestWithUser,
    @Query('organizationId') organizationId: string,
    @Query('projectId') projectId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<CalendarEvent[]> {
    return this.calendarEventsService.findAll(
      organizationId,
      req.user.userId,
      projectId,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get calendar event by id' })
  @ApiParam({ name: 'id', description: 'Calendar Event ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the calendar event.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Calendar event not found.' })
  findOne(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<CalendarEvent> {
    return this.calendarEventsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update calendar event' })
  @ApiParam({ name: 'id', description: 'Calendar Event ID' })
  @ApiBody({ type: UpdateCalendarEventDto })
  @ApiResponse({
    status: 200,
    description: 'The calendar event has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Calendar event not found.' })
  update(
    @Param('id') id: string,
    @Body() updateCalendarEventDto: UpdateCalendarEventDto,
    @Request() req: RequestWithUser,
  ): Promise<CalendarEvent> {
    return this.calendarEventsService.update(
      id,
      updateCalendarEventDto,
      req.user.userId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete calendar event' })
  @ApiParam({ name: 'id', description: 'Calendar Event ID' })
  @ApiResponse({
    status: 200,
    description: 'The calendar event has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Calendar event not found.' })
  remove(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<CalendarEvent> {
    return this.calendarEventsService.remove(id, req.user.userId);
  }
}
