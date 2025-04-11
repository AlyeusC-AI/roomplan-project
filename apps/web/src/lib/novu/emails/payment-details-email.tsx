import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface PaymentDetailsEmailProps {
  organization: {
    name: string;
    email: string;
  };
  project: {
    name: string;
    address: string;
  };
  paymentUrl: string;
}

export const PaymentDetailsEmailTemplate = ({
  organization,
  project,
  paymentUrl,
}: PaymentDetailsEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Payment Notification for ESX Analysis</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Payment Notification</Heading>
          <Text style={text}>
            A payment has been processed for the following ESX analysis:
          </Text>
          <Section style={boxInfos}>
            <Text style={text}>
              <strong>Organization:</strong> {organization.name}
            </Text>
            <Text style={text}>
              <strong>Project:</strong> {project.name}
            </Text>
            <Text style={text}>
              <strong>Address:</strong> {project.address}
            </Text>
          </Section>
          <Text style={text}>
            The payment has been successfully processed through Stripe. You can view the payment details through the Stripe dashboard.
          </Text>
          <Text style={text}>
            Please proceed with the ESX analysis for this project.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PaymentDetailsEmailTemplate;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const boxInfos = {
  padding: "24px",
  border: "1px solid #e6ebf1",
  borderRadius: "5px",
  margin: "20px 0",
};

const text = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
}; 