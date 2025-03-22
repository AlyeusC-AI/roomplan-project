import { format } from "date-fns";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { Form } from "@/app/(logged-in)/forms/types";

interface FormResponse {
  id: number;
  created_at: string;
  date: string;
  formId: number;
  projectId: number;
  form: Form;
  fields: {
    id: number;
    formResponseId: number;
    formFieldId: number;
    value: string;
    field: {
      id: number;
      name: string;
      type: string;
      isRequired: boolean;
    };
  }[];
}

interface ImageData {
  url: string;
  name?: string;
  size?: number;
  type?: string;
  fileId?: string;
  filePath?: string;
}

// Function to convert image URL to base64
const getImageAsBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return '';
  }
};

// Function to load required scripts
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
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
          h: 2,
          lineColor: '#e2e8f0'
        }
      ]
    },
    {
      stack: content,
      margin: [0, 15, 0, 15]
    }
  ]
});

// PDF styles definition
const pdfStyles = {
  header: {
    fontSize: 28,
    bold: true
  },
  subheader: {
    fontSize: 22,
    bold: true,
    color: '#1e293b',
    margin: [0, 0, 0, 5] as [number, number, number, number]
  },
  sectionHeader: {
    fontSize: 18,
    bold: true,
    color: '#1e293b',
    fillColor: '#f8fafc',
    margin: [0, 0, 0, 15] as [number, number, number, number]
  },
  responseId: {
    fontSize: 14,
    color: '#64748b'
  },
  meta: {
    fontSize: 13,
    color: '#64748b',
    italics: true
  },
  label: {
    fontSize: 14,
    bold: true,
    color: '#334155',
    margin: [0, 0, 0, 4] as [number, number, number, number]
  },
  typeBadge: {
    fontSize: 10,
    color: '#64748b',
    fillColor: '#f1f5f9',
    margin: [0, 2, 0, 2] as [number, number, number, number]
  },
  value: {
    fontSize: 15,
    color: '#0f172a',
    lineHeight: 1.4
  },
  emptyValue: {
    fontSize: 14,
    color: '#94a3b8',
    italics: true
  },
  error: {
    fontSize: 14,
    color: '#ef4444',
    italics: true
  },
  link: {
    fontSize: 14,
    color: '#2563eb',
    decoration: 'underline'
  },
  fileIcon: {
    fontSize: 20,
    color: '#2563eb'
  },
  fileHint: {
    fontSize: 12,
    color: '#64748b',
    italics: true
  },
  bullet: {
    fontSize: 16,
    color: '#64748b'
  },
  listItem: {
    fontSize: 15,
    color: '#0f172a',
    lineHeight: 1.4
  },
  checkmark: {
    fontSize: 16,
    color: '#22c55e',
    bold: true
  },
  signatureLabel: {
    fontSize: 12,
    color: '#64748b',
    alignment: 'center'
  }
} as const;

export async function generatePDF(responses: FormResponse[], title: string): Promise<void> {
  try {
    // Load required scripts
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js');

    const content: any[] = [
      {
        canvas: [
          {
            type: 'rect',
            x: -40,
            y: -40,
            w: 595,
            h: 80,
            color: '#2563eb'
          }
        ],
        margin: [0, 0, 0, 0]
      },
      {
        text: title,
        style: 'header',
        alignment: 'center',
        margin: [0, -70, 0, 20],
        color: '#ffffff'
      }
    ];

    // Generate content for each response
    for (const [index, response] of responses.entries()) {
      if (index > 0) {
        content.push({ text: '', pageBreak: 'before' });
      }

      // Response header
      content.push({
        stack: [
          {
            text: response.form.name,
            style: 'subheader',
            margin: [0, 0, 0, 10]
          },
          {
            columns: [
              {
                text: `Response #${response.id}`,
                style: 'responseId',
                width: 'auto'
              },
              {
                text: `Submitted on ${format(new Date(response.date), 'MMMM d, yyyy')} at ${format(new Date(response.date), 'h:mm a')}`,
                style: 'meta',
                alignment: 'right'
              }
            ],
            margin: [0, 0, 0, 20]
          }
        ]
      });

      const fields = [];
      for (const field of response.fields) {
        const fieldContent = [];

        // Field header with type badge
        fieldContent.push({
          columns: [
            {
              text: field.field.name,
              style: 'label',
              width: 'auto'
            }
          ]
        });

        try {
          let fieldType = field.field.type.toLowerCase();

          switch (fieldType) {
            case 'image': {
              try {
                let imageData: ImageData | ImageData[] = typeof field.value === 'string' 
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
                          alignment: 'center'
                        };
                      }
                      return null;
                    } catch (error) {
                      console.error('Error processing image:', error);
                      return null;
                    }
                  });

                  const processedImages = await Promise.all(imagePromises);
                  const validImages = processedImages.filter(img => img !== null);

                  if (validImages.length > 0) {
                    // Calculate grid layout
                    const imagesPerRow = 2; // Fixed 2 columns for better PDF layout
                    const rows = Math.ceil(validImages.length / imagesPerRow);
                    
                    // Create grid rows
                    const gridRows = [];
                    for (let i = 0; i < rows; i++) {
                      const rowImages = validImages.slice(i * imagesPerRow, (i + 1) * imagesPerRow);
                      gridRows.push({
                        columns: rowImages.map((img, index) => ({
                          stack: [
                            img,
                            {
                              text: `Image ${i * imagesPerRow + index + 1}`,
                              style: 'meta',
                              alignment: 'center',
                              margin: [0, 0, 0, 10]
                            }
                          ],
                          width: '*',
                          margin: [0, 0, 10, 0]
                        }))
                      });
                    }

                    fieldContent.push({
                      stack: [
                        {
                          text: 'Images',
                          style: 'label',
                          margin: [0, 0, 0, 5]
                        },
                        ...gridRows
                      ],
                      margin: [0, 15, 0, 15]
                    });
                  } else {
                    fieldContent.push({ text: 'No images could be loaded', style: 'error' });
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
                          alignment: 'center'
                        },
                        {
                          text: 'Image',
                          style: 'meta',
                          alignment: 'center',
                          margin: [0, 0, 0, 10]
                        }
                      ]
                    });
                  } else {
                    fieldContent.push({
                      text: '(Image could not be loaded)',
                      style: 'error',
                      margin: [0, 10, 0, 10]
                    });
                  }
                }
              } catch (error) {
                console.error('Error processing image:', error);
                fieldContent.push({ text: 'No image uploaded', style: 'emptyValue' });
              }
              break;
            }

            case 'signature': {
              try {
                let signatureUrl = field.value;
                
                // Try parsing as JSON first
                try {
                  const signatureData = JSON.parse(field.value);
                  if (signatureData.url) {
                    signatureUrl = signatureData.url;
                  }
                } catch {
                  // If not JSON, assume it's a direct base64 or URL string
                  if (field.value.startsWith('data:image')) {
                    // If it's already a base64 string, use it directly
                    fieldContent.push({
                      stack: [
                        {
                          image: field.value,
                          width: 200,
                          margin: [0, 15, 0, 5],
                          alignment: 'center'
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
                              lineColor: '#94a3b8'
                            }
                          ]
                        },
                        {
                          text: 'Digital Signature',
                          style: 'signatureLabel',
                          margin: [0, 5, 0, 0]
                        }
                      ],
                      alignment: 'center'
                    });
                    break;
                  }
                }

                // If we have a URL, fetch and convert to base64
                if (signatureUrl && !signatureUrl.startsWith('data:image')) {
                  const base64Signature = await getImageAsBase64(signatureUrl);
                  if (base64Signature) {
                    fieldContent.push({
                      stack: [
                        {
                          image: base64Signature,
                          width: 200,
                          margin: [0, 15, 0, 5],
                          alignment: 'center'
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
                              lineColor: '#94a3b8'
                            }
                          ]
                        },
                        {
                          text: 'Digital Signature',
                          style: 'signatureLabel',
                          margin: [0, 5, 0, 0]
                        }
                      ],
                      alignment: 'center'
                    });
                  }
                }
              } catch (error) {
                console.error('Error generating signature:', error);
                fieldContent.push({ text: 'No signature provided', style: 'emptyValue' });
              }
              break;
            }

            case 'file': {
              try {
                const fileData = JSON.parse(field.value);
                if (fileData.url) {
                  fieldContent.push({
                    columns: [
                      {
                        stack: [
                          {
                            text: '📎',
                            style: 'fileIcon'
                          }
                        ],
                        width: 'auto',
                        margin: [0, 0, 10, 0]
                      },
                      {
                        stack: [
                          {
                            text: fileData.name || 'Attached file',
                            link: fileData.url,
                            style: 'link'
                          },
                          {
                            text: 'Click to download',
                            style: 'fileHint'
                          }
                        ]
                      }
                    ],
                    margin: [0, 5, 0, 5]
                  });
                }
              } catch {
                fieldContent.push({ text: 'No file attached', style: 'emptyValue' });
              }
              break;
            }

            case 'list':
            case 'checkbox': {
              try {
                const items = JSON.parse(field.value);
                if (Array.isArray(items) && items.length > 0) {
                  fieldContent.push({
                    margin: [10, 5, 0, 5],
                    stack: items.map((item, i) => ({
                      columns: [
                        {
                          text: '•',
                          width: 15,
                          style: 'bullet'
                        },
                        {
                          text: item,
                          style: 'listItem'
                        }
                      ],
                      margin: [0, i === 0 ? 0 : 2, 0, 0]
                    }))
                  });
                } else {
                  fieldContent.push({ text: 'No items selected', style: 'emptyValue' });
                }
              } catch {
                fieldContent.push({ text: field.value, style: 'value' });
              }
              break;
            }

            case 'date': {
              try {
                const date = new Date(field.value);
                const displayValue = format(date, 'MMMM d, yyyy');
                fieldContent.push({
                  columns: [
                    {
                      text: '📅',
                      width: 'auto',
                      margin: [0, 0, 10, 0]
                    },
                    {
                      text: displayValue,
                      style: 'value'
                    }
                  ],
                  margin: [0, 5, 0, 5]
                });
              } catch {
                fieldContent.push({ text: field.value, style: 'value' });
              }
              break;
            }

            case 'time': {
              try {
                const date = new Date(field.value);
                const displayValue = format(date, 'h:mm a');
                fieldContent.push({
                  columns: [
                    {
                      text: '🕒',
                      width: 'auto',
                      margin: [0, 0, 10, 0]
                    },
                    {
                      text: displayValue,
                      style: 'value'
                    }
                  ],
                  margin: [0, 5, 0, 5]
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
                    margin: [0, 0, 10, 0]
                  },
                  {
                    text: field.value || 'No option selected',
                    style: field.value ? 'value' : 'emptyValue'
                  }
                ],
                margin: [0, 5, 0, 5]
              });
              break;
            }

            case 'number': {
              const num = parseFloat(field.value);
              fieldContent.push({
                text: isNaN(num) ? 'No number provided' : num.toLocaleString(),
                style: isNaN(num) ? 'emptyValue' : 'value',
                margin: [0, 5, 0, 5]
              });
              break;
            }

            default: {
              fieldContent.push({
                text: field.value || 'No response provided',
                style: field.value ? 'value' : 'emptyValue',
                margin: [0, 5, 0, 5]
              });
            }
          }
        } catch (error) {
          fieldContent.push({
            text: 'Error displaying field',
            style: 'error'
          });
        }

        fields.push(createFieldContainer(fieldContent));
      }

      // Add section for fields
      content.push(
        {
          stack: [
            {
              text: 'Response Details',
              style: 'sectionHeader',
              margin: [0, 20, 0, 20]
            },
            ...fields
          ]
        }
      );
    }

    const docDefinition: TDocumentDefinitions = {
      content,
      styles: pdfStyles,
      defaultStyle: {
        fontSize: 12,
        lineHeight: 1.2,
        color: '#0f172a'
      },
      pageMargins: [40, 40, 40, 60],
      footer: (currentPage: number, pageCount: number) => ({
        columns: [
          {
            text: format(new Date(), 'MMMM d, yyyy'),
            alignment: 'left',
            style: 'meta',
            margin: [40, 0, 0, 0]
          },
          {
            text: `Page ${currentPage} of ${pageCount}`,
            alignment: 'right',
            style: 'meta',
            margin: [0, 0, 40, 0]
          }
        ],
        margin: [0, 20, 0, 0]
      })
    };

    if (typeof window !== 'undefined' && (window as any).pdfMake) {
      const pdfDoc = (window as any).pdfMake.createPdf(docDefinition);
      pdfDoc.download(`form-responses-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } else {
      throw new Error('PDF generator not loaded');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
} 