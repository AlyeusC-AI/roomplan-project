import { supabaseServiceRole } from "@lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { user as getUser } from "@lib/supabase/get-user";
import { z } from "zod";
import { Resend } from "resend";
import { Database } from "@/types/database";

const resend = new Resend(process.env.RESEND_API_KEY!);

const sendEmailSchema = z.object({
  documentId: z.number(),
  projectId: z.number(),
});

type Organization = Database["public"]["Tables"]["Organization"]["Row"];

export async function POST(req: NextRequest) {
  try {
    const [, user] = await getUser(req);
    const body = await req.json();

    // Validate request body
    const validatedData = sendEmailSchema.parse(body);

    const organizationId: string = user?.user_metadata.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Get organization details
    const { data: organization, error: orgError } = await supabaseServiceRole
      .from("Organization")
      .select("*")
      .eq("publicId", organizationId)
      .single();

    if (orgError) {
      console.error("Error fetching organization:", orgError);
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Get document details
    const { data: document, error: documentError } = await supabaseServiceRole
      .from("Document")
      .select("*")
      .eq("id", validatedData.documentId)
      .single();

    if (documentError) throw documentError;

    // Get project details
    const { data: project, error: projectError } = await supabaseServiceRole
      .from("Project")
      .select("*")
      .eq("id", validatedData.projectId)
      .single();

    if (projectError) {
      console.error("Error fetching project:", projectError);
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project?.clientEmail) {
      return NextResponse.json(
        { error: "Project client email is required" },
        { status: 400 }
      );
    }

    // const previewLink = `https://www.restoregeek.app/documents/${document.publicId}?projectId=${project.publicId}`;
    const previewLink = `https://www.restoregeek.app/certificate?id=${document.publicId}&isCustomer=true&type=${JSON.parse(document.json as string).type}`;

    console.log("🚀 ~ POST ~ previewLink:", previewLink);
    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "RestoreGeek <team@servicegeek.io>",
      to: project.clientEmail,
      subject: `Document: ${document.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h1 style="color: #1a1a1a; margin-bottom: 20px;">Document Shared with You</h1>
            
            <div style="margin-bottom: 20px;">
              <p style="color: #4a5568; margin-bottom: 10px;">Hello,</p>
              <p style="color: #4a5568; margin-bottom: 10px;">
                ${organization.name} has shared a document with you for the project "${project.name}".
              </p>
            </div>

            <div style="background-color: white; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <h2 style="color: #2d3748; margin-bottom: 10px;">${document.name}</h2>
              <p style="color: #4a5568; margin-bottom: 15px;">Click the button below to view the document:</p>
              <a href="${previewLink}" 
                 style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                View Document
              </a>
            </div>

            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #718096; font-size: 14px;">
                If you have any questions, please contact ${organization.name} at ${organization.phoneNumber}.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending document via email:", error);
    return NextResponse.json(
      { error: "Failed to send document via email" },
      { status: 500 }
    );
  }
}
