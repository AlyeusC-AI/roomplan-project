import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Estimate, Role, MemberStatus } from '@prisma/client';
import { CreateEstimateDto } from './dto/create-estimate.dto';
import { UpdateEstimateDto } from './dto/update-estimate.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class EstimatesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(
    createEstimateDto: CreateEstimateDto,
    userId: string,
  ): Promise<Estimate> {
    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: createEstimateDto.organizationId,
        userId: userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to create estimates in this organization',
      );
    }

    const { items, ...estimateData } = createEstimateDto;

    return this.prisma.estimate.create({
      data: {
        ...estimateData,
        clientEmail: estimateData.clientEmail || '',
        items:
          items && items.length > 0
            ? {
                create: items,
              }
            : undefined,
      },
      include: {
        items: true,
      },
    });
  }

  async findAll(organizationId: string, userId: string): Promise<Estimate[]> {
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
        'You do not have permission to view estimates in this organization',
      );
    }

    return this.prisma.estimate.findMany({
      where: {
        organizationId,
      },
      include: {
        items: true,
        project: true,
      },
    });
  }

  async findOne(id: string, userId: string): Promise<Estimate> {
    const estimate = await this.prisma.estimate.findUnique({
      where: { id },
      include: {
        items: true,
        project: true,
      },
    });

    if (!estimate) {
      throw new NotFoundException('Estimate not found');
    }

    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: estimate.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to view this estimate',
      );
    }

    return estimate;
  }

  async update(
    id: string,
    {
      projectId,
      organizationId,
      items,
      ...updateEstimateDto
    }: UpdateEstimateDto,
    userId: string,
  ): Promise<Estimate> {
    const estimate = await this.prisma.estimate.findUnique({
      where: { id },
    });

    if (!estimate) {
      throw new NotFoundException('Estimate not found');
    }

    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: estimate.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to update estimates in this organization',
      );
    }

    return this.prisma.estimate.update({
      where: { id },
      data: {
        ...updateEstimateDto,
        project: projectId ? { connect: { id: projectId } } : undefined,
        organization: organizationId
          ? { connect: { id: organizationId } }
          : undefined,
        items:
          items && items.length > 0
            ? {
                deleteMany: {},
                create: items,
              }
            : undefined,
      },
      include: {
        items: true,
      },
    });
  }

  async remove(id: string, userId: string): Promise<Estimate> {
    const estimate = await this.prisma.estimate.findUnique({
      where: { id },
    });

    if (!estimate) {
      throw new NotFoundException('Estimate not found');
    }

    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: estimate.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to delete estimates in this organization',
      );
    }

    return this.prisma.estimate.delete({
      where: { id },
    });
  }

  async findByProject(projectId: string, userId: string): Promise<Estimate[]> {
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
        'You do not have permission to view estimates for this project',
      );
    }

    return this.prisma.estimate.findMany({
      where: { projectId: projectId },
      include: {
        items: true,
      },
    });
  }

  async updateStatus(
    id: string,
    status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED',
    userId: string,
  ): Promise<Estimate> {
    const estimate = await this.prisma.estimate.findUnique({
      where: { id },
    });

    if (!estimate) {
      throw new NotFoundException('Estimate not found');
    }

    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: estimate.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to update estimate status in this organization',
      );
    }

    return this.prisma.estimate.update({
      where: { id },
      data: { status },
      include: {
        items: true,
      },
    });
  }

  async convertToInvoice(
    id: string,
    userId: string,
  ): Promise<{ estimate: Estimate; invoiceId: string }> {
    const estimate = await this.prisma.estimate.findUnique({
      where: { id },
      include: {
        items: true,
        organization: true,
      },
    });

    if (!estimate) {
      throw new NotFoundException('Estimate not found');
    }

    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: estimate.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to convert estimates in this organization',
      );
    }

    // Create invoice from estimate
    const invoice = await this.prisma.invoice.create({
      data: {
        number: `INV-${estimate.number}`,
        clientName: estimate.clientName,
        clientEmail: estimate.clientEmail,
        projectId: estimate.projectId,
        poNumber: estimate.poNumber,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        subtotal: estimate.subtotal,
        discount: estimate.discount,
        markup: estimate.markup,
        tax: estimate.tax,
        total: estimate.total,
        deposit: estimate.deposit,
        status: 'DRAFT',
        notes: estimate.notes,
        organizationId: estimate.organizationId,
        items: {
          create: estimate.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            notes: item.notes,
          })),
        },
      },
    });

    // Update estimate status to approved
    await this.prisma.estimate.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    return {
      estimate,
      invoiceId: invoice.id,
    };
  }

  async emailEstimate(
    id: string,
    message: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    const estimate = await this.prisma.estimate.findUnique({
      where: { id },
      include: {
        organization: true,
        project: true,
        items: true,
      },
    });

    if (!estimate) {
      throw new NotFoundException('Estimate not found');
    }

    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: estimate.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to email estimates in this organization',
      );
    }

    if (!estimate.clientEmail) {
      throw new BadRequestException(
        'Client email is required to send the estimate',
      );
    }

    try {
      await this.emailService.sendEstimateEmail({
        to: estimate.clientEmail,
        estimate,
        message,
      });

      // Update estimate status to SENT
      await this.prisma.estimate.update({
        where: { id },
        data: { status: 'SENT' },
      });

      return {
        success: true,
        message: 'Estimate has been sent successfully',
      };
    } catch (error) {
      console.error('Error sending estimate email:', error);
      throw new BadRequestException('Failed to send estimate email');
    }
  }
}
