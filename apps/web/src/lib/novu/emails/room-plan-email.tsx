import { Html, Head, Body, Container, Section, Column, Text, Img, Button } from '@react-email/components';
import ImageKit from 'imagekit';

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

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
});

 const svgToPngBase64 = async (svg: string): Promise<string> => {
  // Convert SVG to base64
  const svgBase64 = Buffer.from(svg).toString('base64');
  const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`;

  // Upload the SVG to ImageKit
  const uploadResponse = await imagekit.upload({
    file: svgDataUrl,
    fileName: 'room-plan.svg',
  });
  console.log("🚀 ~ svgToPngBase64 ~ uploadResponse:", uploadResponse)

  // Generate a transformed URL for PNG version
  const pngUrl = imagekit.url({
    path: uploadResponse.filePath,
    transformation: [{
      width: 800,
      height: 600,
      crop: 'at_max',
      format: 'png',
    }],
  });

  return pngUrl;
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