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

export const RoomPlanEmailTemplate = ({ organization, project, roomPlanSVG }: RoomPlanEmailProps) => {
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
              <div dangerouslySetInnerHTML={{ __html: roomPlanSVG }} />
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