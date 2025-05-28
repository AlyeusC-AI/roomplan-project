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
} from '@prisma/client';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { CreateFormResponseDto } from './dto/create-form-response.dto';
import { CreateFormSectionDto } from './dto/create-form-section.dto';
import { UpdateFormSectionDto } from './dto/update-form-section.dto';
import { CreateFormFieldDto } from './dto/create-form-field.dto';
import { UpdateFormFieldDto } from './dto/update-form-field.dto';

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
        sections: {
          include: {
            fields: true,
          },
        },
      },
    });
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
}
