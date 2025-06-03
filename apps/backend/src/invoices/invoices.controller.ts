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
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { Invoice, InvoiceItem } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateInvoiceDto,
  SavedLineItemsExportResponse,
} from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import {
  CreateInvoiceItemDto,
  UpdateInvoiceItemDto,
  SaveInvoiceItemDto,
} from './dto/invoice-item.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { RequestWithUser } from '../auth/interfaces/request-with-user';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiBody({ type: CreateInvoiceDto })
  @ApiResponse({
    status: 201,
    description: 'The invoice has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @Request() req: RequestWithUser,
  ): Promise<Invoice> {
    return this.invoicesService.create(createInvoiceDto, req.user.userId);
  }

  @Get('organization/:organizationId')
  @ApiOperation({ summary: 'Get all invoices for an organization' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search query' })
  @ApiResponse({
    status: 200,
    description: 'Return all invoices for the organization.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Invoice' },
        },
        total: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Request() req: RequestWithUser,
    @Param('organizationId') organizationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<{ data: Invoice[]; total: number }> {
    return this.invoicesService.findAll(
      organizationId,
      req.user.userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by id' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the invoice.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  findOne(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<Invoice> {
    return this.invoicesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invoice' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiBody({ type: UpdateInvoiceDto })
  @ApiResponse({
    status: 200,
    description: 'The invoice has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @Request() req: RequestWithUser,
  ): Promise<Invoice> {
    return this.invoicesService.update(id, updateInvoiceDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete invoice' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'The invoice has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  remove(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<Invoice> {
    return this.invoicesService.remove(id, req.user.userId);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all invoices for a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all invoices for the project.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  findByProject(
    @Param('projectId') projectId: string,
    @Request() req: RequestWithUser,
  ): Promise<Invoice[]> {
    return this.invoicesService.findByProject(projectId, req.user.userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update invoice status' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The invoice status has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED',
    @Request() req: RequestWithUser,
  ): Promise<Invoice> {
    return this.invoicesService.updateStatus(id, status, req.user.userId);
  }

  @Post('/items')
  @ApiOperation({ summary: 'Add an item to an invoice' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiBody({ type: CreateInvoiceItemDto })
  @ApiResponse({
    status: 201,
    description: 'The invoice item has been successfully added.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  addInvoiceItem(
    @Body() item: CreateInvoiceItemDto,
    @Request() req: RequestWithUser,
  ): Promise<InvoiceItem> {
    return this.invoicesService.addInvoiceItem(item, req.user.userId);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update an invoice item' })
  @ApiParam({ name: 'id', description: 'Invoice Item ID' })
  @ApiBody({ type: UpdateInvoiceItemDto })
  @ApiResponse({
    status: 200,
    description: 'The invoice item has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Invoice item not found.' })
  updateInvoiceItem(
    @Param('id') id: string,
    @Body() updates: UpdateInvoiceItemDto,
    @Request() req: RequestWithUser,
  ): Promise<InvoiceItem> {
    return this.invoicesService.updateInvoiceItem(id, updates, req.user.userId);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Delete an invoice item' })
  @ApiParam({ name: 'id', description: 'Invoice Item ID' })
  @ApiResponse({
    status: 200,
    description: 'The invoice item has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Invoice item not found.' })
  deleteInvoiceItem(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<InvoiceItem> {
    return this.invoicesService.deleteInvoiceItem(id, req.user.userId);
  }

  @Post(':id/email')
  @ApiOperation({ summary: 'Send invoice via email' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
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
    description: 'The invoice has been successfully sent.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  emailInvoice(
    @Param('id') id: string,
    @Body('message') message: string,
    @Request() req: RequestWithUser,
  ): Promise<{ success: boolean; message: string }> {
    return this.invoicesService.emailInvoice(id, message, req.user.userId);
  }

  @Post('items/save')
  @ApiOperation({ summary: 'Save an invoice item template' })
  @ApiBody({ type: SaveInvoiceItemDto })
  @ApiResponse({
    status: 201,
    description: 'The invoice item template has been successfully saved.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  saveInvoiceItem(
    @Body() item: SaveInvoiceItemDto,
    @Request() req: RequestWithUser,
  ): Promise<InvoiceItem> {
    return this.invoicesService.saveInvoiceItem(item, req.user.userId);
  }

  @Get('items/saved/:organizationId')
  @ApiOperation({ summary: 'Get all saved invoice items for an organization' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all saved invoice items for the organization.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getSavedInvoiceItems(
    @Param('organizationId') organizationId: string,
    @Request() req: RequestWithUser,
  ): Promise<InvoiceItem[]> {
    return this.invoicesService.getSavedInvoiceItems(
      organizationId,
      req.user.userId,
    );
  }

  @Get('items/saved/category/:category/:organizationId')
  @ApiOperation({ summary: 'Get saved line items by category' })
  @ApiParam({ name: 'category', description: 'Category name' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Return saved line items for the specified category.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getSavedLineItemsByCategory(
    @Param('category') category: string,
    @Param('organizationId') organizationId: string,
    @Request() req: RequestWithUser,
  ): Promise<InvoiceItem[]> {
    return this.invoicesService.getSavedLineItemsByCategory(
      category,
      organizationId,
      req.user.userId,
    );
  }

  @Patch('items/saved/:id')
  @UseGuards(JwtAuthGuard)
  async updateSavedLineItem(
    @Param('id') id: string,
    @Body()
    updates: {
      description?: string;
      quantity?: number;
      rate?: number;
      amount?: number;
      notes?: string;
      category?: string;
      name?: string;
    },
    @Request() req,
  ): Promise<InvoiceItem> {
    return this.invoicesService.updateSavedLineItem(id, updates, req.user.id);
  }

  @Delete('items/saved/:id')
  @ApiOperation({ summary: 'Delete a saved line item' })
  @ApiParam({ name: 'id', description: 'Saved Line Item ID' })
  @ApiResponse({
    status: 200,
    description: 'The saved line item has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Saved line item not found.' })
  async deleteSavedLineItem(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<InvoiceItem> {
    return this.invoicesService.deleteSavedLineItem(id, req.user.userId);
  }

  @Get('items/saved/export/:organizationId')
  @ApiOperation({ summary: 'Export saved line items to CSV' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Category to filter by',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the CSV file URL.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  exportSavedLineItemsToCsv(
    @Param('organizationId') organizationId: string,
    @Query('category') category: string | null,
    @Request() req: RequestWithUser,
  ): Promise<SavedLineItemsExportResponse> {
    return this.invoicesService.exportSavedLineItemsToCsv(
      category,
      organizationId,
      req.user.userId,
    );
  }

  @Post('items/saved/import/:organizationId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Import saved line items from CSV' })
  @ApiResponse({
    status: 200,
    description: 'Successfully imported line items',
    schema: {
      type: 'object',
      properties: {
        imported: { type: 'number' },
        total: { type: 'number' },
      },
    },
  })
  async importSavedLineItemsFromCsv(
    @Param('organizationId') organizationId: string,
    @Body() body: { fileUrl: string },
    @Request() req: any,
  ): Promise<{ imported: number; total: number }> {
    return this.invoicesService.importSavedLineItemsFromCsv(
      body.fileUrl,
      organizationId,
      req.user.id,
    );
  }
}
