import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Form,
  Role,
  MemberStatus,
  LossType,
  FormResponse,
  FormSection,
  FormField,
  FormProject,
} from '@prisma/client';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { CreateFormResponseDto } from './dto/create-form-response.dto';
import { CreateFormSectionDto } from './dto/create-form-section.dto';
import { UpdateFormSectionDto } from './dto/update-form-section.dto';
import { CreateFormFieldDto } from './dto/create-form-field.dto';
import { UpdateFormFieldDto } from './dto/update-form-field.dto';
import { CreateFormProjectDto } from './dto/create-form-project.dto';
import { format } from 'date-fns';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
// @ts-ignore
pdfMake.addVirtualFileSystem(pdfFonts);
interface ImageData {
  url: string;
  name?: string;
  size?: number;
  type?: string;
  fileId?: string;
  filePath?: string;
}

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  async create(createFormDto: CreateFormDto, userId: string): Promise<Form> {
    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: createFormDto.organizationId,
        userId: userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to create forms in this organization',
      );
    }

    return this.prisma.form.create({
      data: createFormDto,
    });
  }

  async findAll(organizationId: string, userId: string): Promise<Form[]> {
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
        'You do not have permission to view forms in this organization',
      );
    }

    return this.prisma.form.findMany({
      where: {
        organizationId,
      },
      include: {
        fields: true,
        sections: {
          include: {
            fields: true,
          },
        },
      },
    });
  }

  async findFormsByProject(projectId: string, userId: string): Promise<Form[]> {
    // Get project with its loss type
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
        'You do not have permission to view forms in this project',
      );
    }

    // Get forms that match the project's loss type
    return this.prisma.form.findMany({
      where: {
        organizationId: project.organizationId,
        OR: [
          {
            lossTypes: {
              has: project.lossType as LossType,
            },
          },
          {
            projects: {
              some: {
                projectId: projectId,
              },
            },
          },
        ],
      },
      include: {
        projects: {
          where: {
            projectId: projectId,
          },
        },
        sections: {
          include: {
            fields: true,
          },
        },
      },
    });
    //
  }

  async findOne(id: string, userId: string): Promise<Form> {
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: {
        fields: true,
        sections: {
          include: {
            fields: true,
          },
        },
      },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: form.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to view this form',
      );
    }

    return form;
  }

  async update(
    id: string,
    updateFormDto: UpdateFormDto,
    userId: string,
  ): Promise<Form> {
    const form = await this.prisma.form.findUnique({
      where: { id },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: form.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to update forms in this organization',
      );
    }

    return this.prisma.form.update({
      where: { id },
      data: updateFormDto,
    });
  }

  async remove(id: string, userId: string): Promise<Form> {
    const form = await this.prisma.form.findUnique({
      where: { id },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    // Check if user is a member of the organization with appropriate role
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: form.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to delete forms in this organization',
      );
    }

    return this.prisma.form.delete({
      where: { id },
    });
  }

  // Form Response methods
  async createResponse(
    createFormResponseDto: CreateFormResponseDto,
    userId: string,
  ): Promise<FormResponse> {
    // Get form to check organization
    const form = await this.prisma.form.findUnique({
      where: { id: createFormResponseDto.formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    // Get project to check organization
    const project = await this.prisma.project.findUnique({
      where: { id: createFormResponseDto.projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user has permission
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: form.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to create form responses in this organization',
      );
    }

    // Create form response with its fields
    return this.prisma.formResponse.create({
      data: {
        formId: createFormResponseDto.formId,
        projectId: createFormResponseDto.projectId,
        formResponseFields: {
          create: createFormResponseDto.fields.map((field) => ({
            fieldId: field.fieldId,
            value: field.value,
          })),
        },
      },
      include: {
        formResponseFields: {
          include: {
            field: true,
          },
        },
      },
    });
  }

  async getProjectResponses(
    projectId: string,
    userId: string,
  ): Promise<FormResponse[]> {
    // Get project to check organization
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
        'You do not have permission to view form responses in this project',
      );
    }

    return this.prisma.formResponse.findMany({
      where: {
        projectId,
      },
      include: {
        form: true,
        formResponseFields: {
          include: {
            field: true,
          },
        },
      },
    });
  }

  async getResponse(id: string, userId: string): Promise<FormResponse> {
    const response = await this.prisma.formResponse.findUnique({
      where: { id },
      include: {
        form: true,
        formResponseFields: {
          include: {
            field: true,
          },
        },
      },
    });

    if (!response) {
      throw new NotFoundException('Form response not found');
    }

    // Check if user has permission
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: response.form.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to view this form response',
      );
    }

    return response;
  }

  async updateResponse(
    id: string,
    fields: { fieldId: string; value?: string }[],
    userId: string,
  ): Promise<FormResponse> {
    const response = await this.prisma.formResponse.findUnique({
      where: { id },
      include: {
        form: true,
      },
    });

    if (!response) {
      throw new NotFoundException('Form response not found');
    }

    // Check if user has permission
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: response.form.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to update this form response',
      );
    }

    // Update form response fields
    await this.prisma.formResponseField.deleteMany({
      where: { formResponseId: id },
    });

    return this.prisma.formResponse.update({
      where: { id },
      data: {
        formResponseFields: {
          create: fields.map((field) => ({
            fieldId: field.fieldId,
            value: field.value,
          })),
        },
      },
      include: {
        formResponseFields: {
          include: {
            field: true,
          },
        },
      },
    });
  }

  async removeResponse(id: string, userId: string): Promise<FormResponse> {
    const response = await this.prisma.formResponse.findUnique({
      where: { id },
      include: {
        form: true,
      },
    });

    if (!response) {
      throw new NotFoundException('Form response not found');
    }

    // Check if user has permission
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: response.form.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to delete this form response',
      );
    }

    return this.prisma.formResponse.delete({
      where: { id },
      include: {
        formResponseFields: {
          include: {
            field: true,
          },
        },
      },
    });
  }

  // Form Section methods
  async createSection(
    formId: string,
    createFormSectionDto: CreateFormSectionDto,
    userId: string,
  ): Promise<FormSection> {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    // Check if user has permission
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: form.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to create sections in this form',
      );
    }

    return this.prisma.formSection.create({
      data: {
        ...createFormSectionDto,
        formId,
      },
      include: {
        fields: true,
      },
    });
  }

  async updateSection(
    formId: string,
    sectionId: string,
    updateFormSectionDto: UpdateFormSectionDto,
    userId: string,
  ): Promise<FormSection> {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const section = await this.prisma.formSection.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    // Check if user has permission
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: form.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to update sections in this form',
      );
    }

    return this.prisma.formSection.update({
      where: { id: sectionId },
      data: updateFormSectionDto,
      include: {
        fields: true,
      },
    });
  }

  async deleteSection(
    formId: string,
    sectionId: string,
    userId: string,
  ): Promise<FormSection> {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const section = await this.prisma.formSection.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    // Check if user has permission
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: form.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to delete sections in this form',
      );
    }

    return this.prisma.formSection.delete({
      where: { id: sectionId },
    });
  }

  // Form Field methods
  async createField(
    formId: string,
    createFormFieldDto: CreateFormFieldDto,
    userId: string,
  ): Promise<FormField> {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    // Check if user has permission
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: form.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to create fields in this form',
      );
    }

    return this.prisma.formField.create({
      data: {
        ...createFormFieldDto,
        formId,
      },
    });
  }

  async updateField(
    formId: string,
    fieldId: string,
    updateFormFieldDto: UpdateFormFieldDto,
    userId: string,
  ): Promise<FormField> {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const field = await this.prisma.formField.findUnique({
      where: { id: fieldId },
    });

    if (!field) {
      throw new NotFoundException('Field not found');
    }

    // Check if user has permission
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: form.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to update fields in this form',
      );
    }

    return this.prisma.formField.update({
      where: { id: fieldId },
      data: updateFormFieldDto,
    });
  }

  async deleteField(
    formId: string,
    fieldId: string,
    userId: string,
  ): Promise<FormField> {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const field = await this.prisma.formField.findUnique({
      where: { id: fieldId },
    });

    if (!field) {
      throw new NotFoundException('Field not found');
    }

    // Check if user has permission
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: form.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to delete fields in this form',
      );
    }

    return this.prisma.formField.delete({
      where: { id: fieldId },
    });
  }

  // Form Project methods
  async addProjectToForm(
    formId: string,
    projectId: string,
    userId: string,
  ): Promise<FormProject> {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user has permission
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: form.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to add projects to this form',
      );
    }

    // Check if project belongs to the same organization
    if (project.organizationId !== form.organizationId) {
      throw new BadRequestException(
        'Project does not belong to the same organization',
      );
    }

    return this.prisma.formProject.create({
      data: {
        formId,
        projectId,
      },
    });
  }

  async removeProjectFromForm(
    formId: string,
    projectId: string,
    userId: string,
  ): Promise<FormProject> {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const formProject = await this.prisma.formProject.findUnique({
      where: {
        formId_projectId: {
          formId,
          projectId,
        },
      },
    });

    if (!formProject) {
      throw new NotFoundException('Form-Project relationship not found');
    }

    // Check if user has permission
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: form.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to remove projects from this form',
      );
    }

    return this.prisma.formProject.delete({
      where: {
        formId_projectId: {
          formId,
          projectId,
        },
      },
    });
  }

  async getFormProjects(
    projectId: string,
    userId: string,
  ): Promise<FormProject[]> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
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
        'You do not have permission to view projects for this form',
      );
    }

    return this.prisma.formProject.findMany({
      where: { projectId },
      include: {
        form: true,
      },
    });
  }

  async generatePdf(
    projectId: string,
    responseIds: string[],
    userId: string,
  ): Promise<Buffer> {
    // Get project and organization
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
      include: {
        user: true,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to generate PDFs for this project',
      );
    }

    // Get form responses
    const responses = await this.prisma.formResponse.findMany({
      where: {
        id: { in: responseIds },
        projectId,
      },
      include: {
        form: true,
        formResponseFields: {
          include: {
            field: true,
          },
        },
      },
    });

    if (responses.length === 0) {
      throw new NotFoundException('No form responses found');
    }

    // PDF styles definition
    const pdfStyles = {
      header: {
        fontSize: 18,
        bold: true,
        color: '#1e293b',
      },
      formTitle: {
        fontSize: 28,
        bold: true,
        color: '#4666f9',
        margin: [0, 10, 0, 20],
      },
      formId: {
        fontSize: 20,
        color: '#475569',
        margin: [0, 0, 0, 8],
      },
      address: {
        fontSize: 13,
        color: '#64748b',
        margin: [0, 0, 0, 20],
      },
      submitterLabel: {
        fontSize: 13,
        color: '#64748b',
        alignment: 'right',
      },
      submitterInfo: {
        fontSize: 13,
        color: '#64748b',
        alignment: 'right',
        margin: [0, 0, 0, 4],
      },
      formName: {
        fontSize: 20,
        bold: true,
        color: '#1e293b',
        margin: [0, 0, 0, 5],
      },
      responseId: {
        fontSize: 15,
        color: '#64748b',
        italics: true,
      },
      submissionMeta: {
        fontSize: 13,
        color: '#64748b',
        italics: true,
        alignment: 'right',
      },
      divider: {
        fontSize: 1,
        color: '#e2e8f0',
      },
      sectionHeader: {
        fontSize: 16,
        bold: true,
        color: '#1e293b',
        fillColor: '#f1f5f9',
        margin: [0, 0, 0, 15],
      },
      label: {
        fontSize: 14,
        bold: true,
        color: '#ffffff',
        margin: [0, 0, 0, 4],
      },
      typeBadge: {
        fontSize: 10,
        color: '#64748b',
        fillColor: '#f1f5f9',
        margin: [0, 2, 0, 2],
      },
      value: {
        fontSize: 15,
        color: '#0f172a',
        lineHeight: 1.4,
        margin: [0, 20, 0, 0],
      },
      emptyValue: {
        fontSize: 14,
        color: '#94a3b8',
        italics: true,
        margin: [0, 20, 0, 0],
      },
      error: {
        fontSize: 14,
        color: '#ef4444',
        italics: true,
      },
      link: {
        fontSize: 14,
        color: '#2563eb',
        decoration: 'underline',
      },
      fileIcon: {
        fontSize: 20,
        color: '#2563eb',
      },
      fileHint: {
        fontSize: 12,
        color: '#64748b',
        italics: true,
      },
      bullet: {
        fontSize: 16,
        color: '#64748b',
      },
      listItem: {
        fontSize: 15,
        color: '#0f172a',
        lineHeight: 1.4,
      },
      checkmark: {
        fontSize: 16,
        color: '#22c55e',
        bold: true,
      },
      signatureLabel: {
        fontSize: 12,
        color: '#64748b',
        alignment: 'center',
      },
    };

    // Function to convert image URL to base64
    const getImageAsBase64 = async (url: string): Promise<string> => {
      try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        return `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`;
      } catch (error) {
        console.error('Error converting image to base64:', error);
        return '';
      }
    };

    // Function to create field container
    const createFieldContainer = (content: any[]) => ({
      stack: [
        {
          canvas: [
            {
              type: 'rect',
              x: 0,
              y: 0,
              w: 515,
              h: 40,
              color: '#2563eb',
            },
          ],
        },
        {
          margin: [15, -30, 15, 15],
          stack: content,
        },
      ],
      margin: [0, 0, 0, 35],
    });

    // Generate content for each response
    const content: any[] = [];

    for (const [index, response] of responses.entries()) {
      if (index > 0) {
        content.push({ text: '', pageBreak: 'before' });
      }

      // Header with organization name
      content.push({
        stack: [
          // Top section with org name
          {
            columns: [
              {
                text: project.organization.name,
                style: 'header',
                margin: [0, 0, 0, 0],
              },
            ],
            margin: [0, 0, 0, 5],
          },
          // Title
          {
            text: response.form.name,
            style: 'formTitle',
          },
          // Separator line
          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 0,
                x2: 515,
                y2: 0,
                lineWidth: 0.5,
                lineColor: '#e2e8f0',
              },
            ],
            margin: [0, 0, 0, 15],
          },
          // Form details section
          {
            columns: [
              {
                width: '50%',
                stack: [
                  {
                    text: `Form #${response.id.toString().padStart(8, '0')}`,
                    style: 'formId',
                  },
                  {
                    text: project.location || '',
                    style: 'address',
                  },
                ],
              },
              {
                width: '50%',
                stack: [
                  {
                    text: 'Submitter:',
                    style: 'submitterLabel',
                  },
                  {
                    text: member.user.email,
                    style: 'submitterInfo',
                  },
                  {
                    text: `Submission Date: ${format(new Date(response.createdAt), 'MMMM d, yyyy')}`,
                    style: 'submitterInfo',
                  },
                  {
                    text: `Time: ${format(new Date(response.createdAt), 'h:mm a')}`,
                    style: 'submitterInfo',
                  },
                ],
              },
            ],
          },
          // Bottom separator line
          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 0,
                x2: 515,
                y2: 0,
                lineWidth: 0.5,
                lineColor: '#e2e8f0',
              },
            ],
            margin: [0, 15, 0, 20],
          },
        ],
      });

      const fields: any[] = [];
      for (const field of response.formResponseFields) {
        const fieldContent: any[] = [];

        // Field header with type badge
        fieldContent.push({
          columns: [
            {
              text: field.field.name,
              style: 'label',
              width: 'auto',
            },
          ],
        });

        try {
          let fieldType = field.field.type.toLowerCase();

          switch (fieldType) {
            case 'image': {
              try {
                let imageData: ImageData | ImageData[] =
                  typeof field.value === 'string'
                    ? JSON.parse(field.value)
                    : field.value;

                if (Array.isArray(imageData)) {
                  // Handle multiple images
                  const imagePromises = imageData.map(async (img) => {
                    try {
                      const base64Image = await getImageAsBase64(img.url);
                      if (base64Image) {
                        return {
                          image: base64Image,
                          width: 200,
                          margin: [0, 5, 0, 5],
                          alignment: 'center',
                        };
                      }
                      return null;
                    } catch (error) {
                      console.error('Error processing image:', error);
                      return null;
                    }
                  });

                  const processedImages = await Promise.all(imagePromises);
                  const validImages = processedImages.filter(
                    (img) => img !== null,
                  );

                  if (validImages.length > 0) {
                    // Calculate grid layout
                    const imagesPerRow = 2;
                    const rows = Math.ceil(validImages.length / imagesPerRow);

                    // Create grid rows
                    const gridRows: any[] = [];
                    for (let i = 0; i < rows; i++) {
                      const rowImages = validImages.slice(
                        i * imagesPerRow,
                        (i + 1) * imagesPerRow,
                      );
                      gridRows.push({
                        columns: rowImages.map((img, index) => ({
                          stack: [
                            img,
                            {
                              text: `Image ${i * imagesPerRow + index + 1}`,
                              style: 'meta',
                              alignment: 'center',
                              margin: [0, 0, 0, 10],
                            },
                          ],
                          width: '*',
                          margin: [0, 0, 10, 0],
                        })),
                      });
                    }

                    fieldContent.push({
                      stack: [
                        {
                          text: 'Images',
                          style: 'label',
                          margin: [0, 0, 0, 5],
                        },
                        ...gridRows,
                      ],
                      margin: [0, 15, 0, 15],
                    });
                  } else {
                    fieldContent.push({
                      text: 'No images could be loaded',
                      style: 'error',
                    });
                  }
                } else if (imageData.url) {
                  // Handle single image
                  const base64Image = await getImageAsBase64(imageData.url);
                  if (base64Image) {
                    fieldContent.push({
                      stack: [
                        {
                          image: base64Image,
                          width: 300,
                          margin: [0, 15, 0, 5],
                          alignment: 'center',
                        },
                        {
                          text: 'Image',
                          style: 'meta',
                          alignment: 'center',
                          margin: [0, 0, 0, 10],
                        },
                      ],
                    });
                  } else {
                    fieldContent.push({
                      text: '(Image could not be loaded)',
                      style: 'error',
                      margin: [0, 10, 0, 10],
                    });
                  }
                }
              } catch (error) {
                console.error('Error processing image:', error);
                fieldContent.push({
                  text: 'No image uploaded',
                  style: 'emptyValue',
                });
              }
              break;
            }

            case 'signature': {
              try {
                let signatureUrl = field.value;

                try {
                  const signatureData = JSON.parse(field.value || '');
                  if (signatureData.url) {
                    signatureUrl = signatureData.url;
                  }
                } catch {
                  if (field.value?.startsWith('data:image')) {
                    fieldContent.push({
                      stack: [
                        {
                          image: field.value,
                          width: 200,
                          margin: [0, 15, 0, 5],
                          alignment: 'center',
                        },
                        {
                          canvas: [
                            {
                              type: 'line',
                              x1: 150,
                              y1: 0,
                              x2: 350,
                              y2: 0,
                              lineWidth: 1,
                              lineColor: '#94a3b8',
                            },
                          ],
                        },
                        {
                          text: 'Digital Signature',
                          style: 'signatureLabel',
                          margin: [0, 5, 0, 0],
                        },
                      ],
                      alignment: 'center',
                    });
                    break;
                  }
                }

                if (signatureUrl && !signatureUrl.startsWith('data:image')) {
                  const base64Signature = await getImageAsBase64(signatureUrl);
                  if (base64Signature) {
                    fieldContent.push({
                      stack: [
                        {
                          image: base64Signature,
                          width: 200,
                          margin: [0, 15, 0, 5],
                          alignment: 'center',
                        },
                        {
                          canvas: [
                            {
                              type: 'line',
                              x1: 150,
                              y1: 0,
                              x2: 350,
                              y2: 0,
                              lineWidth: 1,
                              lineColor: '#94a3b8',
                            },
                          ],
                        },
                        {
                          text: 'Digital Signature',
                          style: 'signatureLabel',
                          margin: [0, 5, 0, 0],
                        },
                      ],
                      alignment: 'center',
                    });
                  }
                }
              } catch (error) {
                console.error('Error generating signature:', error);
                fieldContent.push({
                  text: 'No signature provided',
                  style: 'emptyValue',
                });
              }
              break;
            }

            case 'file': {
              try {
                const fileData = JSON.parse(field.value || '');
                if (fileData.url) {
                  fieldContent.push({
                    columns: [
                      {
                        stack: [
                          {
                            text: '📎',
                            style: 'fileIcon',
                          },
                        ],
                        width: 'auto',
                        margin: [0, 0, 10, 0],
                      },
                      {
                        stack: [
                          {
                            text: fileData.name || 'Attached file',
                            link: fileData.url,
                            style: 'link',
                          },
                          {
                            text: 'Click to download',
                            style: 'fileHint',
                          },
                        ],
                      },
                    ],
                    margin: [0, 5, 0, 5],
                  });
                }
              } catch {
                fieldContent.push({
                  text: 'No file attached',
                  style: 'emptyValue',
                });
              }
              break;
            }

            case 'list':
            case 'checkbox': {
              try {
                const items = JSON.parse(field.value || '');
                if (Array.isArray(items) && items.length > 0) {
                  fieldContent.push({
                    margin: [10, 5, 0, 5],
                    stack: items.map((item, i) => ({
                      columns: [
                        {
                          text: '•',
                          width: 15,
                          style: 'bullet',
                        },
                        {
                          text: item,
                          style: 'listItem',
                        },
                      ],
                      margin: [0, i === 0 ? 0 : 2, 0, 0],
                    })),
                  });
                } else {
                  fieldContent.push({
                    text: 'No items selected',
                    style: 'emptyValue',
                  });
                }
              } catch {
                fieldContent.push({ text: field.value, style: 'value' });
              }
              break;
            }

            case 'date': {
              try {
                const date = new Date(field.value || '');
                const displayValue = format(date, 'MMMM d, yyyy');
                fieldContent.push({
                  columns: [
                    {
                      text: '📅',
                      width: 'auto',
                      margin: [0, 0, 10, 0],
                    },
                    {
                      text: displayValue,
                      style: 'value',
                    },
                  ],
                  margin: [0, 5, 0, 5],
                });
              } catch {
                fieldContent.push({ text: field.value, style: 'value' });
              }
              break;
            }

            case 'time': {
              try {
                const date = new Date(field.value || '');
                const displayValue = format(date, 'h:mm a');
                fieldContent.push({
                  columns: [
                    {
                      text: '🕒',
                      width: 'auto',
                      margin: [0, 0, 10, 0],
                    },
                    {
                      text: displayValue,
                      style: 'value',
                    },
                  ],
                  margin: [0, 5, 0, 5],
                });
              } catch {
                fieldContent.push({ text: field.value, style: 'value' });
              }
              break;
            }

            case 'radio':
            case 'select': {
              fieldContent.push({
                columns: [
                  {
                    text: '✓',
                    width: 'auto',
                    style: 'checkmark',
                    margin: [0, 0, 10, 0],
                  },
                  {
                    text: field.value || 'No option selected',
                    style: field.value ? 'value' : 'emptyValue',
                  },
                ],
                margin: [0, 5, 0, 5],
              });
              break;
            }

            case 'number': {
              const num = parseFloat(field.value || '');
              fieldContent.push({
                text: isNaN(num) ? 'No number provided' : num.toLocaleString(),
                style: isNaN(num) ? 'emptyValue' : 'value',
                margin: [0, 5, 0, 5],
              });
              break;
            }

            default: {
              fieldContent.push({
                text: field.value || 'No response provided',
                style: field.value ? 'value' : 'emptyValue',
                margin: [0, 5, 0, 5],
              });
            }
          }
        } catch (error) {
          fieldContent.push({
            text: 'Error displaying field',
            style: 'error',
          });
        }

        fields.push(createFieldContainer(fieldContent));
      }

      // Add section for fields
      content.push({
        stack: [
          {
            text: 'Response Details',
            style: 'sectionHeader',
            margin: [0, 20, 0, 20],
          },
          ...fields,
        ],
      });
    }

    const docDefinition: TDocumentDefinitions = {
      content,
      styles: pdfStyles as any,
      defaultStyle: {
        fontSize: 12,
        lineHeight: 1.2,
        color: '#0f172a',
      },
      pageMargins: [40, 40, 40, 60],
      footer: (currentPage: number, pageCount: number) => ({
        columns: [
          {
            text: format(new Date(), 'MMMM d, yyyy'),
            alignment: 'left',
            style: 'meta',
            margin: [40, 0, 0, 0],
          },
          {
            text: `Page ${currentPage} of ${pageCount}`,
            alignment: 'right',
            style: 'meta',
            margin: [0, 0, 40, 0],
          },
        ],
        margin: [0, 20, 0, 0],
      }),
    };

    // Generate PDF
    const pdfDoc = pdfMake.createPdf(docDefinition);
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      pdfDoc.getBuffer((buffer: Buffer) => {
        resolve(buffer);
      });
    });

    return pdfBuffer;
  }
}
