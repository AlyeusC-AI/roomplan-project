import { Html, Head, Body, Container, Section, Column, Text, Img, Button } from '@react-email/components';

interface RoomPlanEmailProps {
  organization: {
    name: string;
    phone: string;
    email: string;
    requestor: string;
  };
  project: {
    name: string;
    address: string;
    clientName: string;
  };
  roomPlanSVG: string;
}

const svgToPngBase64 = async (svg: string): Promise<string> => {
  // Extract viewBox dimensions from SVG
  const re = /<svg viewBox="[\d\.\-]*\s[\d\.\-]*\s([\d\.\-]*)\s([\d\.\-]*)">/;
  const match = svg.match(re);
  if (!match) {
    throw new Error('Invalid SVG format');
  }
  
  const width = Math.floor(parseFloat(match[1]) * 1.5);
  const height = Math.floor(parseFloat(match[2]) * 1.5);

  // Create HTML content with SVG
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
              margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh;
            }
            svg, img { width: 100%; height: 100%; }
        </style>
    </head>
    <body>${svg}</body>
    </html>
  `;

  // Create canvas and convert SVG to PNG
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  const img = document.createElement('img');
  img.width = width;
  img.height = height;
  
  // Convert SVG to base64 PNG
  const svg64 = btoa(svg);
  const b64Start = 'data:image/svg+xml;base64,';
  const url = b64Start + svg64;

  return new Promise((resolve) => {
    img.onload = function() {
      ctx.beginPath();
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const pngBase64 = canvas.toDataURL('image/png');
      resolve(pngBase64);
    };
    img.src = url;
  });
};

export const RoomPlanEmailTemplate = async ({ organization, project, roomPlanSVG }: RoomPlanEmailProps) => {
  // Convert SVG to PNG and use it in the email
  const roomPlanImage = await svgToPngBase64(roomPlanSVG);

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', backgroundColor: '#ffffff' }}>
          <Section>
            <Column>
              <Img
                src="https://www.restoregeek.app/images/brand/servicegeek.png"
                alt="ServiceGeek"
                width="200"
                style={{ margin: '0 auto', display: 'block' }}
              />
            </Column>
          </Section>

          <Section style={{ marginTop: '20px' }}>
            <Column>
              <Text style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: '#333' }}>
                Room Plan
              </Text>
            </Column>
          </Section>

          <Section style={{ marginTop: '20px' }}>
            <Column>
              <Img
                src={roomPlanImage}
                alt="Room Plan"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </Column>
          </Section>

          <Section style={{ marginTop: '30px' }}>
            <Column>
              <Text style={{ fontSize: '16px', color: '#333' }}>
                <strong>Project Details:</strong>
              </Text>
              <Text style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                Project Name: {project.name}
              </Text>
              <Text style={{ fontSize: '14px', color: '#666' }}>
                Project Address: {project.address}
              </Text>
              <Text style={{ fontSize: '14px', color: '#666' }}>
                Client Name: {project.clientName}
              </Text>
            </Column>
          </Section>

          <Section style={{ marginTop: '30px' }}>
            <Column>
              <Text style={{ fontSize: '16px', color: '#333' }}>
                <strong>Organization Details:</strong>
              </Text>
              <Text style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                Company: {organization.name}
              </Text>
              <Text style={{ fontSize: '14px', color: '#666' }}>
                Phone: {organization.phone}
              </Text>
              <Text style={{ fontSize: '14px', color: '#666' }}>
                Email: {organization.email}
              </Text>
              <Text style={{ fontSize: '14px', color: '#666' }}>
                Requestor: {organization.requestor}
              </Text>
            </Column>
          </Section>

          <Section style={{ marginTop: '30px', textAlign: 'center' }}>
            <Column>
              <Text style={{ fontSize: '12px', color: '#999' }}>
                This email was sent from ServiceGeek
              </Text>
            </Column>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}; 