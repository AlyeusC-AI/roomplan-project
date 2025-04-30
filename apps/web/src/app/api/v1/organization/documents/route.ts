import { supabaseServiceRole } from "@lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { user as getUser } from "@lib/supabase/get-user";
import { z } from "zod";

const createDocumentSchema = z.object({
  name: z.string(),
  projectId: z.string(),
  // url: z.string(),
  json: z.string(),
});

const updateDocumentSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  // url: z.string().optional(),
  json: z.string().optional(),
});

const deleteDocumentSchema = z.object({
  id: z.number(),
});

// GET /api/v1/organization/documents
export async function GET(req: NextRequest) {
  try {
    const [, user] = await getUser(req);

    const searchParams = req.nextUrl.searchParams;
    const projectId = searchParams.get("projectId");
    console.log("🚀 ~ GET ~ projectId:", projectId);

    const organizationId: string = user?.user_metadata.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const org = await supabaseServiceRole
      .from("Organization")
      .select("id")
      .eq("publicId", organizationId)
      .single();

    if (org.error) throw org.error;

    // Get documents for the organization
    const { data: documents, error } = await (projectId
      ? supabaseServiceRole
          .from("Document")
          .select(
            `
        *
      `
          )
          .order("created_at", { ascending: false })

          .eq("projectId", projectId)
      : supabaseServiceRole
          .from("Document")
          .select(
            `
        *
      `
          )
          .order("created_at", { ascending: false })
          .eq("orgId", org.data.id)
          .is("projectId", null));
    if (error) throw error;

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

// POST /api/v1/organization/documents
export async function POST(req: NextRequest) {
  try {
    const [, user] = await getUser(req);
    const body = await req.json();

    // Validate request body
    const validatedData = createDocumentSchema.parse(body);

    const organizationId: string = user?.user_metadata.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const org = await supabaseServiceRole
      .from("Organization")
      .select("id")
      .eq("publicId", organizationId)
      .single();

    if (org.error) throw org.error;

    const project = await supabaseServiceRole
      .from("Project")
      .select("id")
      .eq("publicId", validatedData.projectId)
      .single();

    if (project.error) throw project.error;

    // Start a transaction
    const { data: document, error: documentError } = await supabaseServiceRole
      .from("Document")
      .insert({
        name: validatedData.name,
        url: "",
        projectId: project.data.id,
        json: validatedData.json,
        orgId: org.data.id,
      })
      .select()
      .single();

    if (documentError) throw documentError;

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}

// PUT /api/v1/organization/documents
export async function PUT(req: NextRequest) {
  try {
    const [, user] = await getUser(req);
    const body = await req.json();

    // Validate request body
    const validatedData = updateDocumentSchema.parse(body);

    // Update form
    const { data: updatedDocument, error: updateError } =
      await supabaseServiceRole
        .from("Document")
        .update({
          name: validatedData.name,
          url: "",
          json: validatedData.json,
        })
        .eq("id", validatedData.id)
        .select()
        .single();

    if (updateError) throw updateError;

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/organization/documents
export async function DELETE(req: NextRequest) {
  try {
    const [, user] = await getUser(req);
    const body = await req.json();

    // Validate request body
    const validatedData = deleteDocumentSchema.parse(body);

    // Delete the form and all related data
    const { error } = await supabaseServiceRole
      .from("Document")
      .delete()
      .eq("id", validatedData.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting form:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
