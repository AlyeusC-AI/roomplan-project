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
import { EstimatesService } from './estimates.service';
import { Estimate } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEstimateDto } from './dto/create-estimate.dto';
import { UpdateEstimateDto } from './dto/update-estimate.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RequestWithUser } from '../auth/interfaces/request-with-user';

@ApiTags('estimates')
@ApiBearerAuth()
@Controller('estimates')
@UseGuards(JwtAuthGuard)
export class EstimatesController {
  constructor(private readonly estimatesService: EstimatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new estimate' })
  @ApiBody({ type: CreateEstimateDto })
  @ApiResponse({
    status: 201,
    description: 'The estimate has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(
    @Body() createEstimateDto: CreateEstimateDto,
    @Request() req: RequestWithUser,
  ): Promise<Estimate> {
    return this.estimatesService.create(createEstimateDto, req.user.userId);
  }

  @Get('organization/:organizationId')
  @ApiOperation({ summary: 'Get all estimates for an organization' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all estimates for the organization.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Param('organizationId') organizationId: string,
    @Request() req: RequestWithUser,
  ): Promise<Estimate[]> {
    return this.estimatesService.findAll(organizationId, req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get estimate by id' })
  @ApiParam({ name: 'id', description: 'Estimate ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the estimate.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Estimate not found.' })
  findOne(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<Estimate> {
    return this.estimatesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update estimate' })
  @ApiParam({ name: 'id', description: 'Estimate ID' })
  @ApiBody({ type: UpdateEstimateDto })
  @ApiResponse({
    status: 200,
    description: 'The estimate has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Estimate not found.' })
  update(
    @Param('id') id: string,
    @Body() updateEstimateDto: UpdateEstimateDto,
    @Request() req: RequestWithUser,
  ): Promise<Estimate> {
    return this.estimatesService.update(id, updateEstimateDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete estimate' })
  @ApiParam({ name: 'id', description: 'Estimate ID' })
  @ApiResponse({
    status: 200,
    description: 'The estimate has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Estimate not found.' })
  remove(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<Estimate> {
    return this.estimatesService.remove(id, req.user.userId);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all estimates for a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all estimates for the project.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  findByProject(
    @Param('projectId') projectId: string,
    @Request() req: RequestWithUser,
  ): Promise<Estimate[]> {
    return this.estimatesService.findByProject(projectId, req.user.userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update estimate status' })
  @ApiParam({ name: 'id', description: 'Estimate ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: [
            'DRAFT',
            'SENT',
            'APPROVED',
            'REJECTED',
            'CANCELLED',
            'EXPIRED',
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The estimate status has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Estimate not found.' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED',
    @Request() req: RequestWithUser,
  ): Promise<Estimate> {
    return this.estimatesService.updateStatus(id, status, req.user.userId);
  }

  @Post(':id/convert')
  @ApiOperation({ summary: 'Convert estimate to invoice' })
  @ApiParam({ name: 'id', description: 'Estimate ID' })
  @ApiResponse({
    status: 200,
    description: 'The estimate has been successfully converted to an invoice.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Estimate not found.' })
  convertToInvoice(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<{ estimate: Estimate; invoiceId: string }> {
    return this.estimatesService.convertToInvoice(id, req.user.userId);
  }

  @Post(':id/email')
  @ApiOperation({ summary: 'Send estimate via email' })
  @ApiParam({ name: 'id', description: 'Estimate ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Optional message to include in the email',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The estimate has been successfully sent.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Estimate not found.' })
  emailEstimate(
    @Param('id') id: string,
    @Body('message') message: string,
    @Request() req: RequestWithUser,
  ): Promise<{ success: boolean; message: string }> {
    return this.estimatesService.emailEstimate(id, message, req.user.userId);
  }
}
