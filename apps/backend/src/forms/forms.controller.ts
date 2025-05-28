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
} from '@nestjs/common';
import { FormsService } from './forms.service';
import { Form, FormResponse, FormSection, FormField } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { CreateFormResponseDto } from './dto/create-form-response.dto';
import { CreateFormSectionDto } from './dto/create-form-section.dto';
import { UpdateFormSectionDto } from './dto/update-form-section.dto';
import { CreateFormFieldDto } from './dto/create-form-field.dto';
import { UpdateFormFieldDto } from './dto/update-form-field.dto';
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
}
