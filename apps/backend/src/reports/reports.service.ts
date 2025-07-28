import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Report, ReportStatus, MemberStatus } from '@prisma/client';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { PdfGeneratorService } from './pdf-generator.service';
import { SpaceController } from '../space/space.controller';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private pdfGeneratorService: PdfGeneratorService,
    private spaceController: SpaceController,
  ) {}

  async create(
    createReportDto: CreateReportDto,
    userId: string,
  ): Promise<Report> {
    // Verify user has access to the project
    const project = await this.prisma.project.findUnique({
      where: { id: createReportDto.projectId },
      include: { organization: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: project.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this project');
    }

    // Create the report
    const report = await this.prisma.report.create({
      data: {
        ...createReportDto,
        createdById: userId,
        status: ReportStatus.GENERATING, // Start in generating status
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Automatically generate PDF in the background
    this.generatePDFInBackground(report.id, userId).catch((error) => {
      console.error('Failed to generate PDF in background:', error);
    });

    return report;
  }

  async findAll(projectId: string, userId: string): Promise<Report[]> {
    // Verify user has access to the project
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { organization: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: project.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return this.prisma.report.findMany({
      where: { projectId },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string): Promise<Report> {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        project: {
          include: { organization: true },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Verify user has access to the project
    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: report.project.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this report');
    }

    return report;
  }

  async update(
    id: string,
    updateReportDto: UpdateReportDto,
    userId: string,
  ): Promise<Report> {
    const report = await this.findOne(id, userId);

    return this.prisma.report.update({
      where: { id },
      data: updateReportDto,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);

    await this.prisma.report.delete({
      where: { id },
    });
  }

  async generatePDF(reportId: string, userId: string): Promise<Buffer> {
    const report = await this.findOne(reportId, userId);

    if (report.status === ReportStatus.GENERATING) {
      throw new BadRequestException('Report is already being generated');
    }

    // Update status to generating
    await this.prisma.report.update({
      where: { id: reportId },
      data: { status: ReportStatus.GENERATING },
    });

    try {
      // Generate PDF using the PDF generator service
      const pdfBuffer = await this.pdfGeneratorService.generateProjectPDF(
        report.projectId,
        reportId,
        report.type,
      );

      // Upload PDF to DigitalOcean Spaces
      const fileName = `report-${reportId}.pdf`;
      const { publicUrl } = await this.uploadPDFToSpace(pdfBuffer, fileName);

      // Update status to completed and save file URL
      await this.prisma.report.update({
        where: { id: reportId },
        data: {
          status: ReportStatus.COMPLETED,
          fileUrl: publicUrl,
          fileSize: pdfBuffer.length,
          generatedAt: new Date(),
        },
      });

      return pdfBuffer;
    } catch (error) {
      // Update status to failed
      await this.prisma.report.update({
        where: { id: reportId },
        data: { status: ReportStatus.FAILED },
      });

      throw error;
    }
  }

  private async generatePDFInBackground(
    reportId: string,
    userId: string,
  ): Promise<void> {
    try {
      // Get the report to access projectId and type
      const report = await this.prisma.report.findUnique({
        where: { id: reportId },
        select: { projectId: true, type: true },
      });

      if (!report) {
        throw new Error('Report not found');
      }

      // Generate PDF using the PDF generator service
      const pdfBuffer = await this.pdfGeneratorService.generateProjectPDF(
        report.projectId,
        reportId,
        report.type,
      );

      // Upload PDF to DigitalOcean Spaces
      const fileName = `report-${reportId}.pdf`;
      const { publicUrl } = await this.uploadPDFToSpace(pdfBuffer, fileName);

      // Update status to completed and save file URL
      await this.prisma.report.update({
        where: { id: reportId },
        data: {
          status: ReportStatus.COMPLETED,
          fileUrl: publicUrl,
          fileSize: pdfBuffer.length,
          generatedAt: new Date(),
        },
      });
    } catch (error) {
      // Update status to failed
      await this.prisma.report.update({
        where: { id: reportId },
        data: { status: ReportStatus.FAILED },
      });

      console.error('Background PDF generation failed:', error);
    }
  }

  private async uploadPDFToSpace(
    pdfBuffer: Buffer,
    fileName: string,
  ): Promise<{ publicUrl: string }> {
    try {
      // Get signed URL for PDF upload
      const { signedUrl, publicUrl } =
        await this.spaceController.getAuthToken(fileName);

      // Upload the PDF using the signed URL
      const response = await fetch(signedUrl, {
        method: 'PUT',
        body: pdfBuffer,
        headers: {
          'Content-Type': 'application/pdf',
          'x-amz-acl': 'public-read',
          'Cache-Control': 'public, max-age=31536000',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to upload PDF to DigitalOcean Spaces: ${response.statusText} - ${errorText}`,
        );
      }

      return { publicUrl };
    } catch (error) {
      console.error('Error uploading PDF to Space:', error);
      throw new Error(`Failed to upload PDF: ${error.message}`);
    }
  }
}
