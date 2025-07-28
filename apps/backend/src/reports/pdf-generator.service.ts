import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PdfGeneratorService {
  constructor(private prisma: PrismaService) {}

  async generateProjectPDF(
    projectId: string,
    reportId: string,
    reportType?: string,
  ): Promise<Buffer> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        organization: true,
        rooms: {
          include: {
            images: {
              where: { showInReport: true },
              orderBy: { order: 'asc' },
            },
            notes: {
              include: {
                images: true,
              },
            },
            roomReading: {
              include: {
                wallReadings: true,
                genericRoomReading: true,
              },
              orderBy: { date: 'desc' },
              take: 1,
            },
          },
        },
        equipmentProject: {
          include: {
            equipment: {
              include: {
                category: true,
              },
            },
            room: true,
            statusChanges: {
              include: {
                changedByUser: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
              orderBy: {
                changedAt: 'asc',
              },
            },
          },
        },
        costs: true,
        ProjectMaterial: {
          include: {
            material: true,
            wallReadings: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const html = this.generateHTML(project, reportType);
    return this.convertHTMLToPDF(html);
  }

  private generateHTML(project: any, reportType?: string): string {
    const orgInfo = project.organization;
    const projectInfo = project;
    const rooms = project.rooms;

    // Generate different HTML based on report type
    switch (reportType) {
      case 'EQUIPMENT':
        return this.generateEquipmentReportHTML(project);
      case 'MOISTURE_READINGS':
        return this.generateMoistureReportHTML(project);
      case 'ROOM_DETAILS':
        return this.generateRoomDetailsReportHTML(project);
      case 'MATERIAL_ANALYSIS':
        return this.generateMaterialAnalysisReportHTML(project);
      case 'COST_BREAKDOWN':
        return this.generateCostBreakdownReportHTML(project);
      case 'CUSTOM':
        return this.generateCustomReportHTML(project);
      default:
        return this.generateProjectSummaryReportHTML(project);
    }
  }

  private generateCommonHeader(project: any, reportTitle: string): string {
    const orgInfo = project.organization;
    const projectInfo = project;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${reportTitle} - ${projectInfo.name}</title>
          <style>
            /* PDF Styles */
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 0;
              color: #333;
              line-height: 1.6;
              background-color: #ffffff;
            }
            
            .pdf {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .pdf-reset {
              font-size: 16px;
            }
            
            .first-page {
              page-break-after: always;
              padding: 2rem;
              background-color: #ffffff;
              min-height: 100vh;
              width: 800px;
              margin: 0 auto;
              position: relative;
            }
            
            .new-page {
              page-break-before: always;
              padding: 40px;
            }
            
            .header-section {
              position: relative;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin: 20px;
              padding: 20px;
              background-color: #f8f9fa;
              border-radius: 8px;
            }
            
            .header-section-border {
              border: 2px solid #1a3d6c;
              border-radius: 8px;
            }
            
            .header-left {
              flex: 1;
            }
            
            .header-right {
              text-align: right;
            }
            
            .logo-section {
              margin-bottom: 20px;
            }
            
            .org-logo {
              max-width: 50px;
              max-height: 50px;
            }
            
            .report-title-section h1 {
              font-size: 24px;
              font-weight: 600;
              color: #1a3d6c;
              margin: 0;
            }
            
            .info-row {
              display: flex;
              flex-direction: column;
              gap: 4px;
              margin-bottom: 12px;
            }
            
            .info-row:last-child {
              margin-bottom: 0;
            }
            
            .label {
              font-size: 12px;
              color: #666;
              font-weight: 500;
            }
            
            .value {
              font-size: 14px;
              color: #000;
              font-weight: 400;
            }
            
            .key-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              margin-top: 20px;
            }
            
            .property-image {
              width: 200px;
              height: 200px;
              overflow: hidden;
              border-radius: 4px;
              z-index: 1;
            }
            
            .property-image a {
              height: 200px;
            }
            
            .property-image img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              cursor: pointer;
            }
            
            .clickable-image {
              cursor: pointer;
              transition: opacity 0.2s;
            }
            
            .clickable-image:hover {
              opacity: 0.8;
            }
            
            .image-link {
              text-decoration: none;
              color: inherit;
              display: inline-block;
              border: 2px solid transparent;
              border-radius: 8px;
              transition: border-color 0.2s;
            }
            
            .image-link:hover {
              border-color: #2563eb;
            }
            
            .link-text {
              color: #2563eb;
              text-decoration: underline;
              cursor: pointer;
            }
            
            .link-text:hover {
              color: #1d4ed8;
            }
            
            .room-section-title {
              font-size: 24px;
              font-weight: bold;
              margin: 20px 0 15px 0;
              color: #1f2937;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 10px;
            }
            
            .room-section-subtitle {
              font-size: 20px;
              font-weight: 600;
              margin: 15px 0 10px 0;
              color: #374151;
            }
            
            .section-spacing {
              margin: 20px 0;
            }
            
            .major-break {
              page-break-before: always;
            }
            
            .title-spacing {
              margin-top: 30px;
            }
            
            .avoid-break {
              page-break-inside: avoid;
            }
            
            .grid-3-columns {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 1rem;
            }
            
            .photo-grid {
              display: flex;
              flex-direction: column;
              gap: 1rem;
            }
            
            .photo-row {
              display: flex;
              justify-content: space-between;
              gap: 1rem;
              min-height: 200px;
            }
            
            .photo-item {
              position: relative;
              flex: 1;
              min-width: 0;
            }
            
            .image-div {
              width: 100%;
              overflow: hidden;
              margin-bottom: 1rem;
            }
            
            .image-div img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              object-position: center;
            }
            
            .mt-4 {
              margin-top: 16px;
            }
            
            .mb-8 {
              margin-bottom: 32px;
            }
            
            .columns-section {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 20px;
              margin: 40px 0;
            }
            
            .info-column {
              background-color: #f8f9fa;
              padding: 16px;
              border-radius: 6px;
              border: 1px solid #e9ecef;
            }
            
            .column-title {
              font-size: 16px;
              font-weight: 600;
              color: #1a3d6c;
              margin: 0 0 16px 0;
              padding-bottom: 8px;
              border-bottom: 2px solid #1a3d6c;
            }
            
            .damage-section {
              background-color: #f8f9fa;
              padding: 16px;
              border-radius: 6px;
              border: 1px solid #e9ecef;
              margin-bottom: 20px;
            }
            
            .section-title {
              font-size: 16px;
              font-weight: 600;
              color: #1a3d6c;
              margin: 0 0 12px 0;
              padding-bottom: 8px;
              border-bottom: 2px solid #1a3d6c;
            }
            
            .description-text {
              font-size: 14px;
              line-height: 1.5;
              color: #333;
              margin: 0;
              white-space: pre-line;
            }
            
            .notes-body {
              font-size: 14px;
              line-height: 1.5;
              color: #4b5563;
            }
            
            .readings-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            
            .readings-table th,
            .readings-table td {
              border: 1px solid #d1d5db;
              padding: 8px 12px;
              text-align: left;
            }
            
            .readings-table th {
              background-color: #f9fafb;
              font-weight: 600;
            }
            
            .weather-section {
              margin: 20px 0;
              padding: 20px;
              background-color: #f8fafc;
              border-radius: 8px;
            }
            
            .weather-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
              gap: 15px;
              margin-top: 15px;
            }
            
            .weather-item {
              text-align: center;
              padding: 10px;
              background: white;
              border-radius: 6px;
              border: 1px solid #e5e7eb;
            }
            
            .weather-label {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 5px;
            }
            
            .weather-value {
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
            }
            
            .dimensions-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
              gap: 10px;
              margin: 15px 0;
            }
            
            .dimension-item {
              text-align: center;
              padding: 10px;
              background: #f8fafc;
              border-radius: 6px;
            }
            
            .dimension-label {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 3px;
            }
            
            .dimension-value {
              font-size: 14px;
              font-weight: 600;
              color: #1f2937;
            }
            
            .affected-areas {
              margin: 15px 0;
              padding: 15px;
              background: #fef2f2;
              border-left: 4px solid #ef4444;
              border-radius: 4px;
            }
            
            .affected-areas h4 {
              margin: 0 0 10px 0;
              color: #dc2626;
              font-size: 16px;
            }
            
            .area-item {
              margin: 8px 0;
              padding: 8px;
              background: white;
              border-radius: 4px;
              border: 1px solid #fecaca;
            }
            
            .area-label {
              font-weight: 600;
              color: #991b1b;
            }
            
            .area-value {
              color: #7f1d1d;
              margin-left: 10px;
            }
            
            .page-count {
              position: fixed;
              bottom: 20px;
              right: 20px;
              font-size: 12px;
              color: #6b7280;
            }
            
            @media print {
              .page-count {
                position: fixed;
                bottom: 20px;
                right: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="pdf pdf-reset">
            <div class="page-count">Page 1</div>
            
            <!-- Title Page -->
            <div class="pdf first-page">
              <div class="pdf" style="display: flex; flex-direction: row; justify-content: space-between;">
                <div class="pdf logo-section header-left">
                  ${orgInfo.logo ? `<img src="${orgInfo.logo}" alt="Organization Logo" class="pdf org-logo" style="width: 50px; height: 50px;" />` : ''}
                </div>
                <div class="pdf header-right">
                  <div class="pdf info-row">
                    <span class="pdf label">Date Reported</span>
                    <span class="pdf value">${new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div class="pdf report-container">
                <div class="pdf header-section-border">
                  <div class="pdf header-section">
                    <div class="pdf header-left">
                      <div class="pdf report-title-section">
                        <h1 class="pdf">${orgInfo.name}</h1>
                      </div>
                      <div class="pdf info-row">
                        <span class="pdf label">Address</span>
                        <span class="pdf value">${projectInfo.location || 'N/A'}</span>
                      </div>
                      
                      <div class="pdf key-info">
                        <div class="pdf info-row">
                          <span class="pdf label">Type of Loss</span>
                          <span class="pdf value">${projectInfo.lossType ? projectInfo.lossType.charAt(0).toUpperCase() + projectInfo.lossType.slice(1) : 'N/A'}</span>
                        </div>
                        <div class="pdf info-row">
                          <span class="pdf label">Category</span>
                          <span class="pdf value">${projectInfo.catCode || 'N/A'}</span>
                        </div>
                        <div class="pdf info-row">
                          <span class="pdf label">Date of Loss</span>
                          <span class="pdf value">${projectInfo.dateOfLoss ? new Date(projectInfo.dateOfLoss).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div class="pdf info-row">
                          <span class="pdf label">Insurance Company</span>
                          <span class="pdf value">${projectInfo.insuranceCompanyName || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    ${
                      projectInfo.mainImage
                        ? `
                      <div class="pdf property-image">
                        <a href="${projectInfo.mainImage}" target="_blank" class="pdf image-link">
                          <img src="${projectInfo.mainImage}" alt="Property" class="pdf clickable-image" style="max-width: 200px; height: auto; border-radius: 8px;" />
                        </a>
                      </div>
                    `
                        : ''
                    }
                  </div>
                </div>
                
                <!-- Project Details -->
                <div class="pdf columns-section">
                  <div class="pdf info-column">
                    <h3 class="pdf column-title">Project Details</h3>
                    <div class="pdf info-row">
                      <span class="pdf label">Project Manager</span>
                      <span class="pdf value">${projectInfo.managerName || 'N/A'}</span>
                    </div>
                    <div class="pdf info-row">
                      <span class="pdf label">Project Status</span>
                      <span class="pdf value">${projectInfo.status?.label || 'N/A'}</span>
                    </div>
                    <div class="pdf info-row">
                      <span class="pdf label">Assignment #</span>
                      <span class="pdf value">${projectInfo.assignmentNumber || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div class="pdf info-column">
                    <h3 class="pdf column-title">Insurance Details</h3>
                    <div class="pdf info-row">
                      <span class="pdf label">Policy Number</span>
                      <span class="pdf value">${projectInfo.policyNumber || 'N/A'}</span>
                    </div>
                    <div class="pdf info-row">
                      <span class="pdf label">Claim #</span>
                      <span class="pdf value">${projectInfo.insuranceClaimId || 'N/A'}</span>
                    </div>
                    <div class="pdf info-row">
                      <span class="pdf label">Adjuster</span>
                      <span class="pdf value">${projectInfo.adjusterName || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div class="pdf info-column">
                    <h3 class="pdf column-title">Customer Information</h3>
                    <div class="pdf info-row">
                      <span class="pdf label">Client Phone</span>
                      <span class="pdf value">${projectInfo.clientPhoneNumber || 'N/A'}</span>
                    </div>
                    <div class="pdf info-row">
                      <span class="pdf label">Client Email</span>
                      <span class="pdf value">${projectInfo.clientEmail || 'N/A'}</span>
                    </div>
                    <div class="pdf info-row">
                      <span class="pdf label">Adjuster Email</span>
                      <span class="pdf value">${projectInfo.adjusterEmail || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Damage Description -->
                <div class="pdf damage-section">
                  <h3 class="pdf section-title">Loss Summary</h3>
                  <p class="pdf description-text">
                    ${projectInfo.claimSummary || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
    `;
  }

  private generateProjectSummaryReportHTML(project: any): string {
    const orgInfo = project.organization;
    const projectInfo = project;
    const rooms = project.rooms;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Project Report - ${projectInfo.name}</title>
          <style>
            /* PDF Styles */
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 0;
              color: #333;
              line-height: 1.6;
              background-color: #ffffff;
            }
            
            .pdf {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .pdf-reset {
              font-size: 16px;
            }
            
            .first-page {
              page-break-after: always;
              padding: 2rem;
              background-color: #ffffff;
              min-height: 100vh;
              width: 800px;
              margin: 0 auto;
              position: relative;
            }
            
            .new-page {
              page-break-before: always;
              padding: 40px;
            }
            
            .header-section {
              position: relative;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin: 20px;
              padding: 20px;
              background-color: #f8f9fa;
              border-radius: 8px;
            }
            
            .header-section-border {
              border: 2px solid #1a3d6c;
              border-radius: 8px;
            }
            
            .header-left {
              flex: 1;
            }
            
            .header-right {
              text-align: right;
            }
            
            .logo-section {
              margin-bottom: 20px;
            }
            
            .org-logo {
              max-width: 50px;
              max-height: 50px;
            }
            
            .report-title-section h1 {
              font-size: 24px;
              font-weight: 600;
              color: #1a3d6c;
              margin: 0;
            }
            
            .info-row {
              display: flex;
              flex-direction: column;
              gap: 4px;
              margin-bottom: 12px;
            }
            
            .info-row:last-child {
              margin-bottom: 0;
            }
            
            .label {
              font-size: 12px;
              color: #666;
              font-weight: 500;
            }
            
            .value {
              font-size: 14px;
              color: #000;
              font-weight: 400;
            }
            
            .key-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              margin-top: 20px;
            }
            
            .property-image {
              width: 200px;
              height: 200px;
              overflow: hidden;
              border-radius: 4px;
              z-index: 1;
            }
            
            .property-image a {
              height: 200px;
            }
            
            .property-image img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              cursor: pointer;
            }
            
            .clickable-image {
              cursor: pointer;
              transition: opacity 0.2s;
            }
            
            .clickable-image:hover {
              opacity: 0.8;
            }
            
            .image-link {
              text-decoration: none;
              color: inherit;
              display: inline-block;
              border: 2px solid transparent;
              border-radius: 8px;
              transition: border-color 0.2s;
            }
            
            .image-link:hover {
              border-color: #2563eb;
            }
            
            .link-text {
              color: #2563eb;
              text-decoration: underline;
              cursor: pointer;
            }
            
            .link-text:hover {
              color: #1d4ed8;
            }
            
            .room-section-title {
              font-size: 24px;
              font-weight: bold;
              margin: 20px 0 15px 0;
              color: #1f2937;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 10px;
            }
            
            .room-section-subtitle {
              font-size: 20px;
              font-weight: 600;
              margin: 15px 0 10px 0;
              color: #374151;
            }
            
            .section-spacing {
              margin: 20px 0;
            }
            
            .major-break {
              page-break-before: always;
            }
            
            .title-spacing {
              margin-top: 30px;
            }
            
            .avoid-break {
              page-break-inside: avoid;
            }
            
            .grid-3-columns {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 1rem;
            }
            
            .photo-grid {
              display: flex;
              flex-direction: column;
              gap: 1rem;
            }
            
            .photo-row {
              display: flex;
              justify-content: space-between;
              gap: 1rem;
              min-height: 200px;
            }
            
            .photo-item {
              position: relative;
              flex: 1;
              min-width: 0;
            }
            
            .image-div {
              width: 100%;
              overflow: hidden;
              margin-bottom: 1rem;
            }
            
            .image-div img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              object-position: center;
            }
            
            .mt-4 {
              margin-top: 16px;
            }
            
            .mb-8 {
              margin-bottom: 32px;
            }
            
            .columns-section {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 20px;
              margin: 40px 0;
            }
            
            .info-column {
              background-color: #f8f9fa;
              padding: 16px;
              border-radius: 6px;
              border: 1px solid #e9ecef;
            }
            
            .column-title {
              font-size: 16px;
              font-weight: 600;
              color: #1a3d6c;
              margin: 0 0 16px 0;
              padding-bottom: 8px;
              border-bottom: 2px solid #1a3d6c;
            }
            
            .damage-section {
              background-color: #f8f9fa;
              padding: 16px;
              border-radius: 6px;
              border: 1px solid #e9ecef;
            }
            
            .section-title {
              font-size: 16px;
              font-weight: 600;
              color: #1a3d6c;
              margin: 0 0 12px 0;
              padding-bottom: 8px;
              border-bottom: 2px solid #1a3d6c;
            }
            
            .description-text {
              font-size: 14px;
              line-height: 1.5;
              color: #333;
              margin: 0;
              white-space: pre-line;
            }
            
            .notes-body {
              font-size: 14px;
              line-height: 1.5;
              color: #4b5563;
            }
            
            .readings-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            
            .readings-table th,
            .readings-table td {
              border: 1px solid #d1d5db;
              padding: 8px 12px;
              text-align: left;
            }
            
            .readings-table th {
              background-color: #f9fafb;
              font-weight: 600;
            }
            
            .weather-section {
              margin: 20px 0;
              padding: 20px;
              background-color: #f8fafc;
              border-radius: 8px;
            }
            
            .weather-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
              gap: 15px;
              margin-top: 15px;
            }
            
            .weather-item {
              text-align: center;
              padding: 10px;
              background: white;
              border-radius: 6px;
              border: 1px solid #e5e7eb;
            }
            
            .weather-label {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 5px;
            }
            
            .weather-value {
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
            }
            
            .dimensions-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
              gap: 10px;
              margin: 15px 0;
            }
            
            .dimension-item {
              text-align: center;
              padding: 10px;
              background: #f8fafc;
              border-radius: 6px;
            }
            
            .dimension-label {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 3px;
            }
            
            .dimension-value {
              font-size: 14px;
              font-weight: 600;
              color: #1f2937;
            }
            
            .affected-areas {
              margin: 15px 0;
              padding: 15px;
              background: #fef2f2;
              border-left: 4px solid #ef4444;
              border-radius: 4px;
            }
            
            .affected-areas h4 {
              margin: 0 0 10px 0;
              color: #dc2626;
              font-size: 16px;
            }
            
            .area-item {
              margin: 8px 0;
              padding: 8px;
              background: white;
              border-radius: 4px;
              border: 1px solid #fecaca;
            }
            
            .area-label {
              font-weight: 600;
              color: #991b1b;
            }
            
            .area-value {
              color: #7f1d1d;
              margin-left: 10px;
            }
            
            .page-count {
              position: fixed;
              bottom: 20px;
              right: 20px;
              font-size: 12px;
              color: #6b7280;
            }
            
            @media print {
              .page-count {
                position: fixed;
                bottom: 20px;
                right: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="pdf pdf-reset">
            <div class="page-count">Page 1</div>
            
            <!-- Title Page -->
            <div class="pdf first-page">
              <div class="pdf" style="display: flex; flex-direction: row; justify-content: space-between;">
                <div class="pdf logo-section header-left">
                  ${orgInfo.logo ? `<img src="${orgInfo.logo}" alt="Organization Logo" class="pdf org-logo" style="width: 50px; height: 50px;" />` : ''}
                </div>
                <div class="pdf header-right">
                  <div class="pdf info-row">
                    <span class="pdf label">Date Reported</span>
                    <span class="pdf value">${new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div class="pdf report-container">
                <div class="pdf header-section-border">
                  <div class="pdf header-section">
                    <div class="pdf header-left">
                      <div class="pdf report-title-section">
                        <h1 class="pdf">${orgInfo.name}</h1>
                      </div>
                      <div class="pdf info-row">
                        <span class="pdf label">Address</span>
                        <span class="pdf value">${projectInfo.location || 'N/A'}</span>
                      </div>
                      
                      <div class="pdf key-info">
                        <div class="pdf info-row">
                          <span class="pdf label">Type of Loss</span>
                          <span class="pdf value">${projectInfo.lossType ? projectInfo.lossType.charAt(0).toUpperCase() + projectInfo.lossType.slice(1) : 'N/A'}</span>
                        </div>
                        <div class="pdf info-row">
                          <span class="pdf label">Category</span>
                          <span class="pdf value">${projectInfo.catCode || 'N/A'}</span>
                        </div>
                        <div class="pdf info-row">
                          <span class="pdf label">Date of Loss</span>
                          <span class="pdf value">${projectInfo.dateOfLoss ? new Date(projectInfo.dateOfLoss).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div class="pdf info-row">
                          <span class="pdf label">Insurance Company</span>
                          <span class="pdf value">${projectInfo.insuranceCompanyName || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    ${
                      projectInfo.mainImage
                        ? `
                      <div class="pdf property-image">
                        <a href="${projectInfo.mainImage}" target="_blank" class="pdf image-link">
                          <img src="${projectInfo.mainImage}" alt="Property" class="pdf clickable-image" style="max-width: 200px; height: auto; border-radius: 8px;" />
                        </a>
                      </div>
                    `
                        : ''
                    }
                  </div>
                </div>
                
                <!-- Project Details -->
                <div class="pdf columns-section">
                  <div class="pdf info-column">
                    <h3 class="pdf column-title">Project Details</h3>
                    <div class="pdf info-row">
                      <span class="pdf label">Project Manager</span>
                      <span class="pdf value">${projectInfo.managerName || 'N/A'}</span>
                    </div>
                    <div class="pdf info-row">
                      <span class="pdf label">Project Status</span>
                      <span class="pdf value">${projectInfo.status?.label || 'N/A'}</span>
                    </div>
                    <div class="pdf info-row">
                      <span class="pdf label">Assignment #</span>
                      <span class="pdf value">${projectInfo.assignmentNumber || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div class="pdf info-column">
                    <h3 class="pdf column-title">Insurance Details</h3>
                    <div class="pdf info-row">
                      <span class="pdf label">Policy Number</span>
                      <span class="pdf value">${projectInfo.policyNumber || 'N/A'}</span>
                    </div>
                    <div class="pdf info-row">
                      <span class="pdf label">Claim #</span>
                      <span class="pdf value">${projectInfo.insuranceClaimId || 'N/A'}</span>
                    </div>
                    <div class="pdf info-row">
                      <span class="pdf label">Adjuster</span>
                      <span class="pdf value">${projectInfo.adjusterName || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div class="pdf info-column">
                    <h3 class="pdf column-title">Customer Information</h3>
                    <div class="pdf info-row">
                      <span class="pdf label">Client Phone</span>
                      <span class="pdf value">${projectInfo.clientPhoneNumber || 'N/A'}</span>
                    </div>
                    <div class="pdf info-row">
                      <span class="pdf label">Client Email</span>
                      <span class="pdf value">${projectInfo.clientEmail || 'N/A'}</span>
                    </div>
                    <div class="pdf info-row">
                      <span class="pdf label">Adjuster Email</span>
                      <span class="pdf value">${projectInfo.adjusterEmail || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Damage Description -->
                <div class="pdf damage-section">
                  <h3 class="pdf section-title">Loss Summary</h3>
                  <p class="pdf description-text">
                    ${projectInfo.claimSummary || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Weather Reporting -->
            ${
              projectInfo.temperature ||
              projectInfo.humidity ||
              projectInfo.wind
                ? `
              <div class="pdf new-page">
                <h2 class="pdf room-section-title">Weather Conditions</h2>
                <div class="pdf weather-section">
                  <div class="pdf weather-grid">
                    ${
                      projectInfo.temperature
                        ? `
                      <div class="pdf weather-item">
                        <div class="pdf weather-label">Temperature</div>
                        <div class="pdf weather-value">${projectInfo.temperature}°F</div>
                      </div>
                    `
                        : ''
                    }
                    ${
                      projectInfo.humidity
                        ? `
                      <div class="pdf weather-item">
                        <div class="pdf weather-label">Humidity</div>
                        <div class="pdf weather-value">${projectInfo.humidity}%</div>
                      </div>
                    `
                        : ''
                    }
                    ${
                      projectInfo.wind
                        ? `
                      <div class="pdf weather-item">
                        <div class="pdf weather-label">Wind</div>
                        <div class="pdf weather-value">${projectInfo.wind}</div>
                      </div>
                    `
                        : ''
                    }
                  </div>
                </div>
              </div>
            `
                : ''
            }
            
            <!-- Rooms -->
            ${rooms
              .map(
                (room: any, index: number) => `
              <div class="pdf" key="${room.id}">
                <div class="pdf new-page">
                  <h2 class="pdf room-section-title">${room.name}</h2>
                  
                  ${
                    room.images && room.images.length > 0
                      ? `
                    <div class="pdf section-spacing">
                      <h3 class="pdf room-section-subtitle">Overview Photos</h3>
                      <p style="font-size: 12px; color: #6b7280; margin-bottom: 10px; font-style: italic;">Click on any image to view it in full size</p>
                      <div class="pdf grid-3-columns">
                        ${room.images
                          .map(
                            (image: any) => `
                          <div class="pdf photo-item">
                            <div class="pdf image-div">
                              <a href="${image.url}" target="_blank" class="pdf image-link">
                                <img src="${image.url}" alt="Room photo" class="pdf clickable-image" />
                              </a>
                            </div>
                          </div>
                        `,
                          )
                          .join('')}
                      </div>
                    </div>
                  `
                      : ''
                  }
                  
                  ${
                    room.length || room.width || room.height
                      ? `
                    <div class="pdf section-spacing">
                      <h3 class="pdf room-section-subtitle">Dimensions & Details</h3>
                      <div class="pdf dimensions-grid">
                        ${
                          room.length
                            ? `
                          <div class="pdf dimension-item">
                            <div class="pdf dimension-label">Length</div>
                            <div class="pdf dimension-value">${room.length} ft</div>
                          </div>
                        `
                            : ''
                        }
                        ${
                          room.width
                            ? `
                          <div class="pdf dimension-item">
                            <div class="pdf dimension-label">Width</div>
                            <div class="pdf dimension-value">${room.width} ft</div>
                          </div>
                        `
                            : ''
                        }
                        ${
                          room.height
                            ? `
                          <div class="pdf dimension-item">
                            <div class="pdf dimension-label">Height</div>
                            <div class="pdf dimension-value">${room.height} ft</div>
                          </div>
                        `
                            : ''
                        }
                        ${
                          room.totalSqft
                            ? `
                          <div class="pdf dimension-item">
                            <div class="pdf dimension-label">Total Sq Ft</div>
                            <div class="pdf dimension-value">${room.totalSqft} sq ft</div>
                          </div>
                        `
                            : ''
                        }
                      </div>
                    </div>
                  `
                      : ''
                  }
                  
                  ${
                    room.roomReading && room.roomReading.length > 0
                      ? `
                    <div class="pdf section-spacing">
                      <h3 class="pdf room-section-subtitle">Readings</h3>
                      <table class="pdf readings-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Humidity</th>
                            <th>Temperature</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${room.roomReading
                            .map(
                              (reading: any) => `
                            <tr>
                              <td>${new Date(reading.date).toLocaleDateString()}</td>
                              <td>${reading.humidity || 'N/A'}%</td>
                              <td>${reading.temperature || 'N/A'}°F</td>
                            </tr>
                          `,
                            )
                            .join('')}
                        </tbody>
                      </table>
                    </div>
                  `
                      : ''
                  }
                  
                  ${
                    room.notes && room.notes.length > 0
                      ? `
                    <div class="pdf section-spacing">
                      <h3 class="pdf room-section-subtitle">Notes</h3>
                      <p style="font-size: 12px; color: #6b7280; margin-bottom: 10px; font-style: italic;">Click on any image to view it in full size</p>
                      ${room.notes
                        .map(
                          (note: any) => `
                        <div class="pdf mb-8">
                          <div>${new Date(note.createdAt).toLocaleDateString()}</div>
                          <p class="pdf notes-body">${note.body}</p>
                          ${
                            note.images && note.images.length > 0
                              ? `
                            <div class="pdf grid-3-columns mt-4">
                              ${note.images
                                .map(
                                  (image: any) => `
                                <div class="pdf photo-item">
                                  <div class="pdf image-div">
                                    <a href="${image.url}" target="_blank" class="pdf image-link">
                                      <img src="${image.url}" alt="Note image" class="pdf clickable-image" />
                                    </a>
                                  </div>
                                </div>
                              `,
                                )
                                .join('')}
                            </div>
                          `
                              : ''
                          }
                        </div>
                      `,
                        )
                        .join('')}
                    </div>
                  `
                      : ''
                  }
                </div>
              </div>
            `,
              )
              .join('')}
          </div>
        </body>
      </html>
    `;
  }

  private async convertHTMLToPDF(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in',
        },
        // Enable native PDF features like clickable links
        preferCSSPageSize: false,
        displayHeaderFooter: false,
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private generateEquipmentReportHTML(project: any): string {
    const equipment = project.equipmentProject;

    return (
      this.generateCommonHeader(project, 'Equipment Report') +
      `
            <!-- Equipment Report Content -->
            <div class="pdf new-page">
              <h2 class="pdf room-section-title">Equipment Report</h2>
              
              <!-- Equipment by Category -->
              ${this.generateEquipmentByCategory(equipment)}
              
              <!-- Equipment Timeline Summary -->
              <div class="pdf damage-section">
                <h3 class="pdf section-title">Equipment Timeline Summary</h3>
                ${this.generateEquipmentTimelineSummary(equipment)}
              </div>
            </div>
          </div>
        </body>
      </html>
    `
    );
  }

  private generateEquipmentByCategory(equipment: any[]): string {
    // Group equipment by category
    const equipmentByCategory = equipment.reduce((acc: any, eq: any) => {
      const categoryName = eq.equipment.category?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(eq);
      return acc;
    }, {});

    return Object.entries(equipmentByCategory)
      .map(
        ([categoryName, categoryEquipment]: [string, any[]]) => `
        <div class="pdf damage-section" style="margin-bottom: 20px;">
          <h3 class="pdf section-title">${categoryName}</h3>
          <table class="pdf readings-table">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Quantity</th>
                <th>Current Status</th>
                <th>Room</th>
                <th>Placed</th>
                <th>Activated</th>
                <th>Removed</th>
              </tr>
            </thead>
            <tbody>
              ${categoryEquipment
                .map((eq: any) => {
                  const placedChange = eq.statusChanges?.find(
                    (c: any) => c.newStatus === 'PLACED',
                  );
                  const activatedChange = eq.statusChanges?.find(
                    (c: any) => c.newStatus === 'ACTIVE',
                  );
                  const removedChange = eq.statusChanges?.find(
                    (c: any) => c.newStatus === 'REMOVED',
                  );

                  return `
                    <tr>
                      <td>${eq.equipment.name}</td>
                      <td>${eq.quantity}</td>
                      <td>${eq.status}</td>
                      <td>${eq.room?.name || 'Project'}</td>
                      <td>${placedChange ? new Date(placedChange.changedAt).toLocaleDateString() : 'N/A'}</td>
                      <td>${activatedChange ? new Date(activatedChange.changedAt).toLocaleDateString() : 'N/A'}</td>
                      <td>${removedChange ? new Date(removedChange.changedAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
          </table>
        </div>
      `,
      )
      .join('');
  }

  private generateEquipmentTimelineSummary(equipment: any[]): string {
    // Collect all status changes across all equipment and sort by date
    const allChanges = equipment
      .flatMap((eq: any) =>
        eq.statusChanges.map((change: any) => ({
          ...change,
          equipmentName: eq.equipment.name,
          equipmentQuantity: eq.quantity,
          roomName: eq.room?.name || 'Project',
        })),
      )
      .sort(
        (a: any, b: any) =>
          new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime(),
      );

    if (allChanges.length === 0) {
      return '<p class="pdf description-text">No equipment status changes recorded.</p>';
    }

    return `
      <table class="pdf readings-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Equipment</th>
            <th>Room</th>
            <th>Status Change</th>
          </tr>
        </thead>
        <tbody>
          ${allChanges
            .map(
              (change: any) => `
            <tr>
              <td>${new Date(change.changedAt).toLocaleString()}</td>
              <td>${change.equipmentName} (Qty: ${change.equipmentQuantity})</td>
              <td>${change.roomName}</td>
              <td>
                ${change.oldStatus ? change.oldStatus : 'Initial'} → ${change.newStatus}
              </td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  private generateMoistureReportHTML(project: any): string {
    const rooms = project.rooms;

    return (
      this.generateCommonHeader(project, 'Moisture Readings Report') +
      `
            <!-- Moisture Readings Report Content -->
            <div class="pdf new-page">
              <h2 class="pdf room-section-title">Moisture Readings Report</h2>
              
              ${rooms
                .map(
                  (room: any) => `
                <div class="pdf damage-section">
                  <h3 class="pdf section-title">${room.name}</h3>
                  ${
                    room.roomReading && room.roomReading.length > 0
                      ? `
                    <table class="pdf readings-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Humidity (%)</th>
                          <th>Temperature (°F)</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${room.roomReading
                          .map(
                            (reading: any) => `
                          <tr>
                            <td>${new Date(reading.date).toLocaleDateString()}</td>
                            <td>${reading.humidity || 'N/A'}</td>
                            <td>${reading.temperature || 'N/A'}</td>
                          </tr>
                        `,
                          )
                          .join('')}
                      </tbody>
                    </table>
                  `
                      : '<p class="pdf description-text">No moisture readings available for this room.</p>'
                  }
                </div>
              `,
                )
                .join('')}
            </div>
          </div>
        </body>
      </html>
    `
    );
  }

  private generateRoomDetailsReportHTML(project: any): string {
    // For now, use the same as project summary but focused on room details
    return this.generateProjectSummaryReportHTML(project);
  }

  private generateMaterialAnalysisReportHTML(project: any): string {
    const materials = project.ProjectMaterial;

    return (
      this.generateCommonHeader(project, 'Material Analysis Report') +
      `
            <!-- Material Analysis Report Content -->
            <div class="pdf new-page">
              <h2 class="pdf room-section-title">Material Analysis Report</h2>
              
              <div class="pdf damage-section">
                <h3 class="pdf section-title">Material Analysis</h3>
                <table class="pdf readings-table">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Moisture Content (%)</th>
                      <th>Dry Goal (%)</th>
                      <th>Compliant</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${materials
                      .map(
                        (material: any) => `
                      <tr>
                        <td>${material.material.name}</td>
                        <td>${material.moistureContent || 'N/A'}</td>
                        <td>${material.dryGoal || 'N/A'}</td>
                        <td>${material.isDryStandardCompliant ? 'Yes' : 'No'}</td>
                      </tr>
                    `,
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
    );
  }

  private generateCostBreakdownReportHTML(project: any): string {
    const costs = project.costs;

    return (
      this.generateCommonHeader(project, 'Cost Breakdown Report') +
      `
            <!-- Cost Breakdown Report Content -->
            <div class="pdf new-page">
              <h2 class="pdf room-section-title">Cost Breakdown Report</h2>
              
              <div class="pdf damage-section">
                <h3 class="pdf section-title">Cost Breakdown</h3>
                <table class="pdf readings-table">
                  <thead>
                    <tr>
                      <th>Cost Item</th>
                      <th>Type</th>
                      <th>Estimated Cost</th>
                      <th>Actual Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${costs
                      .map(
                        (cost: any) => `
                      <tr>
                        <td>${cost.name}</td>
                        <td>${cost.type}</td>
                        <td>$${cost.estimatedCost || 'N/A'}</td>
                        <td>$${cost.actualCost || 'N/A'}</td>
                      </tr>
                    `,
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
    );
  }

  private generateCustomReportHTML(project: any): string {
    // For now, use the same as project summary
    return this.generateProjectSummaryReportHTML(project);
  }
}
