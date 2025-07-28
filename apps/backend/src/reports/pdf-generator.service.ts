import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PdfGeneratorService {
  constructor(private prisma: PrismaService) {}

  async generateProjectPDF(
    projectId: string,
    reportId: string,
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
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const html = this.generateHTML(project);
    return this.convertHTMLToPDF(html);
  }

  private generateHTML(project: any): string {
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
            }
            
            .pdf {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .pdf-reset {
              font-size: 16px;
            }
            
            .first-page {
              page-break-after: always;
              padding: 40px;
              background: white;
            }
            
            .new-page {
              page-break-before: always;
              padding: 40px;
            }
            
            .header-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
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
              font-size: 28px;
              font-weight: bold;
              margin: 0 0 20px 0;
              color: #2563eb;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              padding: 4px 0;
            }
            
            .label {
              font-weight: 600;
              color: #374151;
            }
            
            .value {
              color: #6b7280;
            }
            
            .key-info {
              margin-top: 20px;
            }
            
            .property-image {
              max-width: 200px;
              text-align: center;
            }
            
            .property-image img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
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
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 16px;
            }
            
            .mt-4 {
              margin-top: 16px;
            }
            
            .mb-8 {
              margin-bottom: 32px;
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
                        <img src="${projectInfo.mainImage}" alt="Property" class="pdf" style="max-width: 200px; height: auto; border-radius: 8px;" />
                      </div>
                    `
                        : ''
                    }
                  </div>
                </div>
                
                <!-- Project Details -->
                <div class="pdf columns-section" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0;">
                  <div class="pdf info-column">
                    <h3 class="pdf column-title" style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #1f2937;">Project Details</h3>
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
                    <h3 class="pdf column-title" style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #1f2937;">Insurance Details</h3>
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
                    <h3 class="pdf column-title" style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #1f2937;">Customer Information</h3>
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
                  <h3 class="pdf section-title" style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #1f2937;">Loss Summary</h3>
                  <p class="pdf description-text" style="font-size: 14px; line-height: 1.6; color: #4b5563;">
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
                      <div class="pdf grid-3-columns">
                        ${room.images
                          .map(
                            (image: any) => `
                          <div style="text-align: center;">
                            <img src="${image.url}" alt="Room photo" style="max-width: 100%; height: auto; border-radius: 8px;" />
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
                                <div style="text-align: center;">
                                  <img src="${image.url}" alt="Note image" style="max-width: 100%; height: auto; border-radius: 8px;" />
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
      headless: 'new',
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
      });

      return pdf;
    } finally {
      await browser.close();
    }
  }
}
