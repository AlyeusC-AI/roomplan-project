import { NextResponse } from "next/server";

export interface HubspotTicket {
  hs_pipeline: string;
  hs_pipeline_stage: string;
  hs_ticket_priority: string;
  subject: string;
  client_address: string;
  subscription_status: string;
  report_type: string;
  customer_name: string;
  customer_email: string;
  support_email: string;
  project_id: string;
}

export async function POST() {
  // const {
  //   project,
  //   client_address,
  //   customer_name,
  //   subscription_status,
  //   support_email,
  //   customer_email,
  //   report_type,
  // } = await req.json();

  // const properties = {
  //   hs_pipeline: "29443907",
  //   hs_pipeline_stage: "67521057",
  //   hs_ticket_priority: "HIGH",
  //   subject: client_address,
  //   client_address: client_address || "",
  //   subscription_status: subscription_status || "",
  //   report_type: report_type || "",
  //   support_email: support_email || "",
  //   customer_email: customer_email || "",
  //   customer_name: customer_name || "",
  //   project_id: project || "",
  // };

  try {
    // const apiResponse = await hubspotClient.crm.tickets.basicApi.create(
    //   SimplePublicObjectInputForCreate
    // );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}
