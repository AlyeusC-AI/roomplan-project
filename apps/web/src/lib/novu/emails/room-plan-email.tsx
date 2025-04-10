import { Html, Head, Body, Container, Section, Column, Text, Img, Button } from '@react-email/components';
import { Resvg } from '@resvg/resvg-js';

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
  console.log("🚀 ~ svgToPngBase64 ~ svg:", svg)
  // Create a new Resvg instance
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 800,
    },
    background: '#ffffff',
  });

  // Render the SVG to PNG
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  // Convert to base64
  return `data:image/png;base64,${pngBuffer.toString('base64')}`;
};

export const RoomPlanEmailTemplate = async ({ organization, project, roomPlanSVG }: RoomPlanEmailProps) => {
  console.log("🚀 ~ RoomPlanEmailTemplate ~ roomPlanSVG:", roomPlanSVG)
  // Convert SVG to PNG and use it in the email
  const roomPlanImage = await svgToPngBase64(roomPlanSVG);
  console.log("🚀 ~ RoomPlanEmailTemplate ~ roomPlanImage:", roomPlanImage)

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