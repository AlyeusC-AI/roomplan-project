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
  Res,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RequestWithUser } from '../auth/interfaces/request-with-user';
import { Response } from 'express';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new report' })
  @ApiBody({ type: CreateReportDto })
  @ApiResponse({ status: 201, description: 'Report created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  async create(
    @Body() createReportDto: CreateReportDto,
    @Request() req: RequestWithUser,
  ) {
    return this.reportsService.create(createReportDto, req.user.userId);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all reports for a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  async findAll(
    @Param('projectId') projectId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.reportsService.findAll(projectId, req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Report not found.' })
  async findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.reportsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiBody({ type: UpdateReportDto })
  @ApiResponse({ status: 200, description: 'Report updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Report not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
    @Request() req: RequestWithUser,
  ) {
    return this.reportsService.update(id, updateReportDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Report deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Report not found.' })
  async remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.reportsService.remove(id, req.user.userId);
  }

  @Post(':id/generate-pdf')
  @ApiOperation({ summary: 'Generate PDF for a report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'PDF generated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Report not found.' })
  async generatePDF(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.reportsService.generatePDF(
      id,
      req.user.userId,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="report-${id}.pdf"`,
    });

    res.send(pdfBuffer);
  }
}
