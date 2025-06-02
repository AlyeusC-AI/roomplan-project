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
import { CreateInvoiceDto } from './dto/create-invoice.dto';
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

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
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

  async findAll(organizationId: string, userId: string): Promise<Invoice[]> {
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

    return this.prisma.invoice.findMany({
      where: {
        organizationId,
      },
      include: {
        items: true,
        paymentSchedules: true,
      },
    });
  }

  async findOne(id: string, userId: string): Promise<Invoice> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        paymentSchedules: true,
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
      data: updateInvoiceDto,
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
  ): Promise<string> {
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

    // Create exports directory if it doesn't exist
    const exportDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filePath = path.join(exportDir, filename);

    // Create CSV writer
    const csvWriter = createObjectCsvWriter({
      path: filePath,
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

    // Return the file path
    return filePath;
  }

  async importSavedLineItemsFromCsv(
    file: Express.Multer.File,
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

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const records: any[] = [];
    let imported = 0;
    let total = 0;

    // Create a promise-based parser
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
    });

    // Process the file
    const processFile = promisify((callback: (error?: Error) => void) => {
      fs.createReadStream(file.path)
        .pipe(parser)
        .on('data', (record) => {
          records.push(record);
          total++;
        })
        .on('end', () => {
          callback();
        })
        .on('error', (error) => {
          callback(error);
        });
    });

    try {
      // Parse the CSV file
      await processFile();

      // Process each record
      for (const record of records) {
        try {
          // Validate required fields
          if (!record.name || !record.rate) {
            continue;
          }

          const rate = parseFloat(record.rate);
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

      // Clean up the uploaded file
      fs.unlinkSync(file.path);

      return { imported, total };
    } catch (error) {
      // Clean up the uploaded file in case of error
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new BadRequestException('Failed to process CSV file');
    }
  }
}
