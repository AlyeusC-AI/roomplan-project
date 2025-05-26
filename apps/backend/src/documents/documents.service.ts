import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Document, Role, MemberStatus } from '@prisma/client';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(
    createDocumentDto: CreateDocumentDto,
    userId: string,
  ): Promise<Document> {
    // Check if user is a member of the project's organization
    const project = await this.prisma.project.findUnique({
      where: { id: createDocumentDto.projectId },
      include: { organization: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: project.organizationId,
        userId: userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to create documents in this project',
      );
    }

    return this.prisma.document.create({
      data: createDocumentDto,
    });
  }

  async findAll(projectId: string, userId: string): Promise<Document[]> {
    // Check if user is a member of the project's organization
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { organization: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: project.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to view documents in this project',
      );
    }

    return this.prisma.document.findMany({
      where: {
        projectId,
      },
    });
  }

  async findOne(id: string): Promise<Document> {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
  ): Promise<Document> {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.document.update({
      where: { id },
      data: updateDocumentDto,
    });
  }

  async remove(id: string, userId: string): Promise<Document> {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Check if user is a member of the project's organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: document.project.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to delete documents in this project',
      );
    }

    return this.prisma.document.delete({
      where: { id },
    });
  }

  async sendEmail(documentId: string, userId: string): Promise<void> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        project: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!document.project.clientEmail) {
      throw new BadRequestException('Project client email is required');
    }

    // Check if user is a member of the project's organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: document.project.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to send documents in this project',
      );
    }

    const previewLink = `https://www.restoregeek.app/certificate?id=${document.id}&isCustomer=true&type=${document.type}`;

    await this.emailService.sendDocumentEmail({
      to: document.project.clientEmail,
      documentName: document.name || 'Document',
      projectName: document.project.name,
      organizationName: document.project.organization.name,
      organizationPhone: document.project.organization.phoneNumber || '',
      previewLink,
    });
  }
}
