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
  Res,
} from '@nestjs/common';
import { FormsService } from './forms.service';
import {
  Form,
  FormResponse,
  FormSection,
  FormField,
  FormProject,
} from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { CreateFormResponseDto } from './dto/create-form-response.dto';
import { CreateFormSectionDto } from './dto/create-form-section.dto';
import { UpdateFormSectionDto } from './dto/update-form-section.dto';
import { CreateFormFieldDto } from './dto/create-form-field.dto';
import { UpdateFormFieldDto } from './dto/update-form-field.dto';
import { CreateFormProjectDto } from './dto/create-form-project.dto';
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
import { Response } from 'express';
import { format } from 'date-fns';

@ApiTags('forms')
@ApiBearerAuth()
@Controller('forms')
@UseGuards(JwtAuthGuard)
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new form' })
  @ApiBody({ type: CreateFormDto })
  @ApiResponse({
    status: 201,
    description: 'The form has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(
    @Body() createFormDto: CreateFormDto,
    @Request() req: RequestWithUser,
  ): Promise<Form> {
    return this.formsService.create(createFormDto, req.user.userId);
  }

  @Get('organization/:organizationId')
  @ApiOperation({ summary: 'Get all forms for an organization' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all forms for the organization.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Param('organizationId') organizationId: string,
    @Request() req: RequestWithUser,
  ): Promise<Form[]> {
    return this.formsService.findAll(organizationId, req.user.userId);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get forms for a project based on loss type' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Return forms matching project loss type.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  findFormsByProject(
    @Param('projectId') projectId: string,
    @Request() req: RequestWithUser,
  ): Promise<Form[]> {
    return this.formsService.findFormsByProject(projectId, req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get form by id' })
  @ApiParam({ name: 'id', description: 'Form ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the form.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Form not found.' })
  findOne(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<Form> {
    return this.formsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update form' })
  @ApiParam({ name: 'id', description: 'Form ID' })
  @ApiBody({ type: UpdateFormDto })
  @ApiResponse({
    status: 200,
    description: 'The form has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Form not found.' })
  update(
    @Param('id') id: string,
    @Body() updateFormDto: UpdateFormDto,
    @Request() req: RequestWithUser,
  ): Promise<Form> {
    return this.formsService.update(id, updateFormDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete form' })
  @ApiParam({ name: 'id', description: 'Form ID' })
  @ApiResponse({
    status: 200,
    description: 'The form has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Form not found.' })
  remove(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<Form> {
    return this.formsService.remove(id, req.user.userId);
  }

  // Form Response endpoints
  @Post('response')
  @ApiOperation({ summary: 'Create a new form response' })
  @ApiBody({ type: CreateFormResponseDto })
  @ApiResponse({
    status: 201,
    description: 'The form response has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  createResponse(
    @Body() createFormResponseDto: CreateFormResponseDto,
    @Request() req: RequestWithUser,
  ): Promise<FormResponse> {
    return this.formsService.createResponse(
      createFormResponseDto,
      req.user.userId,
    );
  }

  @Get('project/:projectId/responses')
  @ApiOperation({ summary: 'Get all form responses for a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all form responses for the project.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  getProjectResponses(
    @Param('projectId') projectId: string,
    @Request() req: RequestWithUser,
  ): Promise<FormResponse[]> {
    return this.formsService.getProjectResponses(projectId, req.user.userId);
  }

  @Get('response/:id')
  @ApiOperation({ summary: 'Get form response by id' })
  @ApiParam({ name: 'id', description: 'Form Response ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the form response.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Form response not found.' })
  getResponse(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<FormResponse> {
    return this.formsService.getResponse(id, req.user.userId);
  }

  @Patch('response/:id')
  @ApiOperation({ summary: 'Update form response' })
  @ApiParam({ name: 'id', description: 'Form Response ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fields: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              fieldId: { type: 'string' },
              value: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The form response has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Form response not found.' })
  updateResponse(
    @Param('id') id: string,
    @Body('fields') fields: { fieldId: string; value?: string }[],
    @Request() req: RequestWithUser,
  ): Promise<FormResponse> {
    return this.formsService.updateResponse(id, fields, req.user.userId);
  }

  @Delete('response/:id')
  @ApiOperation({ summary: 'Delete form response' })
  @ApiParam({ name: 'id', description: 'Form Response ID' })
  @ApiResponse({
    status: 200,
    description: 'The form response has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Form response not found.' })
  removeResponse(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<FormResponse> {
    return this.formsService.removeResponse(id, req.user.userId);
  }

  // Form Section endpoints
  @Post(':formId/sections')
  @ApiOperation({ summary: 'Create a new form section' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiBody({ type: CreateFormSectionDto })
  @ApiResponse({
    status: 201,
    description: 'The form section has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Form not found.' })
  createSection(
    @Param('formId') formId: string,
    @Body() createFormSectionDto: CreateFormSectionDto,
    @Request() req: RequestWithUser,
  ): Promise<FormSection> {
    return this.formsService.createSection(
      formId,
      createFormSectionDto,
      req.user.userId,
    );
  }

  @Patch(':formId/sections/:sectionId')
  @ApiOperation({ summary: 'Update a form section' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiParam({ name: 'sectionId', description: 'Section ID' })
  @ApiBody({ type: UpdateFormSectionDto })
  @ApiResponse({
    status: 200,
    description: 'The form section has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Form or section not found.' })
  updateSection(
    @Param('formId') formId: string,
    @Param('sectionId') sectionId: string,
    @Body() updateFormSectionDto: UpdateFormSectionDto,
    @Request() req: RequestWithUser,
  ): Promise<FormSection> {
    return this.formsService.updateSection(
      formId,
      sectionId,
      updateFormSectionDto,
      req.user.userId,
    );
  }

  @Delete(':formId/sections/:sectionId')
  @ApiOperation({ summary: 'Delete a form section' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiParam({ name: 'sectionId', description: 'Section ID' })
  @ApiResponse({
    status: 200,
    description: 'The form section has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Form or section not found.' })
  deleteSection(
    @Param('formId') formId: string,
    @Param('sectionId') sectionId: string,
    @Request() req: RequestWithUser,
  ): Promise<FormSection> {
    return this.formsService.deleteSection(formId, sectionId, req.user.userId);
  }

  // Form Field endpoints
  @Post(':formId/fields')
  @ApiOperation({ summary: 'Create a new form field' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiBody({ type: CreateFormFieldDto })
  @ApiResponse({
    status: 201,
    description: 'The form field has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Form not found.' })
  createField(
    @Param('formId') formId: string,
    @Body() createFormFieldDto: CreateFormFieldDto,
    @Request() req: RequestWithUser,
  ): Promise<FormField> {
    return this.formsService.createField(
      formId,
      createFormFieldDto,
      req.user.userId,
    );
  }

  @Patch(':formId/fields/:fieldId')
  @ApiOperation({ summary: 'Update a form field' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiParam({ name: 'fieldId', description: 'Field ID' })
  @ApiBody({ type: UpdateFormFieldDto })
  @ApiResponse({
    status: 200,
    description: 'The form field has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Form or field not found.' })
  updateField(
    @Param('formId') formId: string,
    @Param('fieldId') fieldId: string,
    @Body() updateFormFieldDto: UpdateFormFieldDto,
    @Request() req: RequestWithUser,
  ): Promise<FormField> {
    return this.formsService.updateField(
      formId,
      fieldId,
      updateFormFieldDto,
      req.user.userId,
    );
  }

  @Delete(':formId/fields/:fieldId')
  @ApiOperation({ summary: 'Delete a form field' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiParam({ name: 'fieldId', description: 'Field ID' })
  @ApiResponse({
    status: 200,
    description: 'The form field has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Form or field not found.' })
  deleteField(
    @Param('formId') formId: string,
    @Param('fieldId') fieldId: string,
    @Request() req: RequestWithUser,
  ): Promise<FormField> {
    return this.formsService.deleteField(formId, fieldId, req.user.userId);
  }

  // Form Project endpoints
  @Post('projects/:projectId/forms')
  @ApiOperation({ summary: 'Add a form to a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiBody({ type: CreateFormProjectDto })
  @ApiResponse({
    status: 201,
    description: 'The form has been successfully added to the project.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Form or project not found.' })
  addFormToProject(
    @Param('projectId') projectId: string,
    @Body() createFormProjectDto: CreateFormProjectDto,
    @Request() req: RequestWithUser,
  ): Promise<FormProject> {
    return this.formsService.addProjectToForm(
      createFormProjectDto.formId,
      projectId,
      req.user.userId,
    );
  }

  @Delete('projects/:projectId/forms/:formId')
  @ApiOperation({ summary: 'Remove a form from a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiResponse({
    status: 200,
    description: 'The form has been successfully removed from the project.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Form or project not found.' })
  removeFormFromProject(
    @Param('projectId') projectId: string,
    @Param('formId') formId: string,
    @Request() req: RequestWithUser,
  ): Promise<FormProject> {
    return this.formsService.removeProjectFromForm(
      formId,
      projectId,
      req.user.userId,
    );
  }

  @Get('projects/:projectId/forms')
  @ApiOperation({ summary: 'Get all forms associated with a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all forms associated with the project.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  getProjectForms(
    @Param('projectId') projectId: string,
    @Request() req: RequestWithUser,
  ): Promise<FormProject[]> {
    return this.formsService.getFormProjects(projectId, req.user.userId);
  }

  @Post('project/:projectId/responses/generate-pdf')
  @ApiOperation({ summary: 'Generate PDF for form responses' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        responseIds: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Project or responses not found.' })
  async generatePdf(
    @Param('projectId') projectId: string,
    @Body('responseIds') responseIds: string[],
    @Request() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.formsService.generatePdf(
      projectId,
      responseIds,
      req.user.userId,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="form-responses-${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
    });

    res.send(pdfBuffer);
  }
}
