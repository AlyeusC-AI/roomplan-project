import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Invoice,
  InvoiceItem,
  PaymentSchedule,
  Role,
  MemberStatus,
} from '@prisma/client';
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
import { EmailService } from '../email/email.service';
import { Multer } from 'multer';
import { createObjectCsvWriter } from 'csv-writer';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { ImageKitService } from '../imagekit/imagekit.service';
import axios from 'axios';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private imageKitService: ImageKitService,
  ) {}

  async create(
    createInvoiceDto: CreateInvoiceDto,
    userId: string,
  ): Promise<Invoice> {
    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: createInvoiceDto.organizationId,
        userId: userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to create invoices in this organization',
      );
    }

    const { items, paymentSchedules, ...invoiceData } = createInvoiceDto;

    return this.prisma.invoice.create({
      data: {
        ...invoiceData,
        items: {
          create: items,
        },
        paymentSchedules: {
          create: paymentSchedules || [],
        },
      },
      include: {
        items: true,
        paymentSchedules: true,
      },
    });
  }

  async findAll(
    organizationId: string,
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ data: Invoice[]; total: number }> {
    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to view invoices in this organization',
      );
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      organizationId,
      ...(search
        ? {
            OR: [
              { number: { contains: search, mode: 'insensitive' as const } },
              {
                clientName: { contains: search, mode: 'insensitive' as const },
              },
              {
                clientEmail: { contains: search, mode: 'insensitive' as const },
              },
            ],
          }
        : {}),
    };

    // Get total count
    const total = await this.prisma.invoice.count({ where });

    // Get paginated data
    const data = await this.prisma.invoice.findMany({
      where,
      include: {
        items: true,
        paymentSchedules: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { data, total };
  }

  async findOne(id: string, userId: string): Promise<Invoice> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        paymentSchedules: true,
        project: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: invoice.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to view this invoice',
      );
    }

    return invoice;
  }

  async update(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
    userId: string,
  ): Promise<Invoice> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: invoice.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to update invoices in this organization',
      );
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        ...updateInvoiceDto,
        projectId: updateInvoiceDto.projectId || invoice.projectId,
        items: {
          deleteMany: {},
          create: updateInvoiceDto.items?.map((item) => ({
            amount: item.amount || 0,
            description: item.description || '',
            quantity: item.quantity || 0,
            rate: item.rate || 0,
            name: item.name || '',
            notes: item.notes || '',
            category: item.category || '',
          })),
        },
      },
      include: {
        items: true,
        paymentSchedules: true,
      },
    });
  }

  async remove(id: string, userId: string): Promise<Invoice> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: invoice.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to delete invoices in this organization',
      );
    }

    return this.prisma.invoice.delete({
      where: { id },
    });
  }

  async findByProject(projectId: string, userId: string): Promise<Invoice[]> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { organization: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user has permission
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: project.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to view invoices for this project',
      );
    }

    return this.prisma.invoice.findMany({
      where: { projectId: projectId },
      include: {
        items: true,
        paymentSchedules: true,
      },
    });
  }

  async updateStatus(
    id: string,
    status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED',
    userId: string,
  ): Promise<Invoice> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: invoice.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to update invoice status in this organization',
      );
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        paymentSchedules: true,
      },
    });
  }

  async addInvoiceItem(
    item: CreateInvoiceItemDto,
    userId: string,
  ): Promise<InvoiceItem> {
    // const invoice = await this.prisma.invoice.findUnique({
    //   where: { id: item.invoiceId },
    // });

    // if (!invoice) {
    //   throw new NotFoundException('Invoice not found');
    // }

    // Check if user is a member of the organization with appropriate role
    // const member = await this.prisma.organizationMember.findFirst({
    //   where: {
    //     organizationId: invoice.organizationId,
    //     userId,
    //     status: MemberStatus.ACTIVE,
    //     role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
    //   },
    // });

    // if (!member) {
    //   throw new BadRequestException(
    //     'You do not have permission to add items to invoices in this organization',
    //   );
    // }

    return this.prisma.invoiceItem.create({
      data: {
        ...item,
        invoiceId: item.invoiceId,
        estimateId: item.estimateId,
        organizationId: item.organizationId,
      },
    });
  }

  async updateInvoiceItem(
    itemId: string,
    updates: UpdateInvoiceItemDto,
    userId: string,
  ): Promise<InvoiceItem> {
    const item = await this.prisma.invoiceItem.findUnique({
      where: { id: itemId },
      include: {
        invoice: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Invoice item not found');
    }

    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: item.invoice?.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to update invoice items in this organization',
      );
    }

    return this.prisma.invoiceItem.update({
      where: { id: itemId },
      data: updates,
    });
  }

  async deleteInvoiceItem(
    itemId: string,
    userId: string,
  ): Promise<InvoiceItem> {
    const item = await this.prisma.invoiceItem.findUnique({
      where: { id: itemId },
      include: {
        invoice: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Invoice item not found');
    }

    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: item.invoice?.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to delete invoice items in this organization',
      );
    }

    return this.prisma.invoiceItem.delete({
      where: { id: itemId },
    });
  }

  async emailInvoice(
    id: string,
    message: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        organization: true,
        project: true,
        items: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: invoice.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to email invoices in this organization',
      );
    }

    if (!invoice.clientEmail) {
      throw new BadRequestException(
        'Client email is required to send the invoice',
      );
    }

    try {
      await this.emailService.sendInvoiceEmail({
        to: invoice.clientEmail,
        invoice,
        message,
      });

      // Update invoice status to SENT
      await this.prisma.invoice.update({
        where: { id },
        data: { status: 'SENT' },
      });

      return {
        success: true,
        message: 'Invoice has been sent successfully',
      };
    } catch (error) {
      console.error('Error sending invoice email:', error);
      throw new BadRequestException('Failed to send invoice email');
    }
  }

  async saveInvoiceItem(
    item: SaveInvoiceItemDto,
    userId: string,
  ): Promise<InvoiceItem> {
    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: item.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to save invoice items in this organization',
      );
    }

    return this.prisma.invoiceItem.create({
      data: {
        ...item,
        isSaved: true,
      },
    });
  }

  async getSavedInvoiceItems(
    organizationId: string,
    userId: string,
  ): Promise<InvoiceItem[]> {
    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to view saved invoice items in this organization',
      );
    }

    return this.prisma.invoiceItem.findMany({
      where: {
        organizationId,
        isSaved: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getSavedLineItemsByCategory(
    category: string,
    organizationId: string,
    userId: string,
  ): Promise<InvoiceItem[]> {
    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to view saved line items in this organization',
      );
    }

    return this.prisma.invoiceItem.findMany({
      where: {
        organizationId,
        isSaved: true,
        category,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async exportSavedLineItemsToCsv(
    category: string | null,
    organizationId: string,
    userId: string,
  ): Promise<SavedLineItemsExportResponse> {
    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to export saved line items in this organization',
      );
    }

    // Get the items to export
    const items = await this.prisma.invoiceItem.findMany({
      where: {
        organizationId,
        isSaved: true,
        ...(category ? { category } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Generate a unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = category
      ? `saved-line-items-${category}-${timestamp}.csv`
      : `saved-line-items-${timestamp}.csv`;

    // Create temporary file
    const tempFilePath = path.join(process.cwd(), 'temp', filename);
    const tempDir = path.dirname(tempFilePath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Create CSV writer
    const csvWriter = createObjectCsvWriter({
      path: tempFilePath,
      header: [
        { id: 'name', title: 'Name' },
        { id: 'description', title: 'Description' },
        { id: 'rate', title: 'Rate' },
        { id: 'category', title: 'Category' },
      ],
    });

    // Write data to CSV
    await csvWriter.writeRecords(
      items.map((item) => ({
        name: item.name,
        description: item.description,
        rate: item.rate,
        category: item.category || '',
      })),
    );

    // Upload to ImageKit
    const fileBuffer = fs.readFileSync(tempFilePath);
    const uploadResult = await this.imageKitService.uploadFile(
      fileBuffer,
      filename,
      'csv',
    );

    // Clean up temporary file
    fs.unlinkSync(tempFilePath);

    // Return the file URL
    return {
      filePath: uploadResult.url,
    };
  }

  async importSavedLineItemsFromCsv(
    fileUrl: string,
    organizationId: string,
    userId: string,
  ): Promise<{ imported: number; total: number }> {
    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to import saved line items in this organization',
      );
    }

    if (!fileUrl) {
      throw new BadRequestException('No file URL provided');
    }

    const records: any[] = [];
    let imported = 0;
    let total = 0;

    try {
      // Download the file from ImageKit
      const response = await axios.get(fileUrl, {
        responseType: 'arraybuffer',
      });
      const csvContent = Buffer.from(response.data).toString('utf-8');

      // Create a promise-based parser with more robust configuration
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
        relax_column_count: true,
        skip_records_with_empty_values: true,
        delimiter: [',', ';', '\t'], // Try multiple delimiters
        quote: '"',
        escape: '"',
        ltrim: true,
        rtrim: true,
      });

      // Process the CSV content
      const processCsv = promisify((callback: (error?: Error) => void) => {
        parser
          .on('data', (record) => {
            console.log('🚀 ~ InvoicesService ~ .on ~ record:', record);
            // Clean up the record
            const cleanedRecord = Object.entries(record).reduce(
              (acc, [key, value]) => {
                // Remove BOM and trim
                const cleanValue =
                  typeof value === 'string'
                    ? value.replace(/^\uFEFF/, '').trim()
                    : value;
                acc[key.trim().toLowerCase()] = cleanValue;
                return acc;
              },
              {},
            );

            records.push(cleanedRecord);
            total++;
          })
          .on('end', () => {
            callback();
          })
          .on('error', (error) => {
            console.error('CSV parsing error:', error);
            callback(error);
          });

        parser.write(csvContent);
        parser.end();
      });

      // Parse the CSV content
      await processCsv();

      // Process each record
      for (const record of records) {
        try {
          // Validate required fields
          if (!record.name || !record.rate) {
            continue;
          }

          const rate = parseFloat(
            record.rate.toString().replace(/[^0-9.-]+/g, ''),
          );
          if (isNaN(rate)) {
            console.warn('Invalid rate value:', record.rate);
            continue;
          }

          const quantity = 1; // Default quantity for saved items

          // Create the saved line item
          await this.prisma.invoiceItem.create({
            data: {
              name: record.name,
              description: record.description || '',
              rate,
              quantity,
              amount: rate * quantity,
              category: record.category || null,
              organizationId,
              isSaved: true,
            },
          });

          imported++;
        } catch (error) {
          console.error('Error importing record:', error);
          // Continue with next record
        }
      }

      return { imported, total };
    } catch (error) {
      console.error('Error processing CSV file:', error);
      throw new BadRequestException(
        'Failed to process CSV file: ' + error.message,
      );
    }
  }

  async updateSavedLineItem(
    id: string,
    updates: {
      description?: string;
      quantity?: number;
      rate?: number;
      amount?: number;
      notes?: string;
      category?: string;
      name?: string;
    },
    userId: string,
  ): Promise<InvoiceItem> {
    const item = await this.prisma.invoiceItem.findUnique({
      where: { id },
      include: {
        invoice: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Saved line item not found');
    }

    if (!item.organizationId) {
      throw new BadRequestException(
        'Line item is not associated with an organization',
      );
    }

    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: item.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to update saved line items in this organization',
      );
    }

    // Calculate amount if rate or quantity is updated
    if (updates.rate !== undefined || updates.quantity !== undefined) {
      const newRate = updates.rate ?? item.rate;
      const newQuantity = updates.quantity ?? item.quantity;
      updates.amount = newRate * newQuantity;
    }

    return this.prisma.invoiceItem.update({
      where: { id },
      data: updates,
    });
  }

  async deleteSavedLineItem(id: string, userId: string): Promise<InvoiceItem> {
    const item = await this.prisma.invoiceItem.findUnique({
      where: { id },
      include: {
        invoice: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Saved line item not found');
    }

    if (!item.organizationId) {
      throw new BadRequestException(
        'Line item is not associated with an organization',
      );
    }

    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: item.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to delete saved line items in this organization',
      );
    }

    return this.prisma.invoiceItem.delete({
      where: { id },
    });
  }
}
