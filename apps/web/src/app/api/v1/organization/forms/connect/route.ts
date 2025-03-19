import { createClient } from "@lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { user as getUser } from "@lib/supabase/get-user";
import { z } from "zod";

// POST /api/v1/organization/forms/connect
export async function POST(req: NextRequest) {
  try {
    const [, user] = await getUser(req);
    const client = await createClient();
    const body = await req.json();
    
    // Validate request body
    const validatedData = z.object({
      formIds: z.array(z.number()),
      projectId: z.number()
    }).parse(body);
    
    const organizationId: string = user?.user_metadata.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const org = await client.from("Organization").select("id").eq("publicId", organizationId).single();

    if (org.error) throw org.error;

    // Verify project belongs to organization
    const { data: project, error: projectError } = await client
      .from("Project")
      .select("id")
      .eq("id", validatedData.projectId)
      .eq("organizationId", org.data.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found or does not belong to organization" },
        { status: 404 }
      );
    }

    // Verify all forms belong to organization
    const { data: forms, error: formsError } = await client
      .from("Form")
      .select("id")
      .in("id", validatedData.formIds)
      .eq("orgId", org.data.id);

    if (formsError) throw formsError;

    if (!forms || forms.length !== validatedData.formIds.length) {
      return NextResponse.json(
        { error: "One or more forms not found or do not belong to organization" },
        { status: 404 }
      );
    }

    // Get existing connections for this project
    const { data: existingConnections, error: connectionsError } = await client
      .from("formProjects")
      .select("formId")
      .eq("projectId", validatedData.projectId);

    if (connectionsError) throw connectionsError;

    // Find connections to delete (existing but not in the new list)
    const existingFormIds = new Set(existingConnections?.map(conn => conn.formId) || []);
    const formsToDelete = Array.from(existingFormIds).filter(id => !validatedData.formIds.includes(id!));

    // Find forms to connect (in the new list but not existing)
    const formsToConnect = validatedData.formIds.filter(id => !existingFormIds.has(id));

    // Start a transaction
    const { data: connections, error: insertError } = await client
      .from("formProjects")
      .upsert(
        validatedData.formIds.map(formId => ({
          formId,
          projectId: validatedData.projectId
        })),
        { onConflict: 'formId,projectId' }
      )
      .select();

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      connected: connections,
      deleted: formsToDelete.length,
      skipped: validatedData.formIds.length - formsToConnect.length
    });
  } catch (error) {
    console.error("Error upserting form-project connections:", error);
    return NextResponse.json(
      { error: "Failed to upsert form-project connections" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/organization/forms/connect
export async function DELETE(req: NextRequest) {
  try {
    const [, user] = await getUser(req);
    const client = await createClient();
    const body = await req.json();
    
    // Validate request body
    const validatedData = z.object({
      formIds: z.array(z.number()),
      projectId: z.number()
    }).parse(body);
    
    const organizationId: string = user?.user_metadata.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const org = await client.from("Organization").select("id").eq("publicId", organizationId).single();

    if (org.error) throw org.error;

    // Verify project belongs to organization
    const { data: project, error: projectError } = await client
      .from("Project")
      .select("id")
      .eq("id", validatedData.projectId)
      .eq("organizationId", org.data.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found or does not belong to organization" },
        { status: 404 }
      );
    }

    // Get existing connections
    const { data: existingConnections, error: connectionsError } = await client
      .from("formProjects")
      .select("formId")
      .eq("projectId", validatedData.projectId)
      .in("formId", validatedData.formIds);

    if (connectionsError) throw connectionsError;

    // Filter out forms that are not connected
    const existingFormIds = new Set(existingConnections?.map(conn => conn.formId) || []);
    const formsToDelete = validatedData.formIds.filter(id => existingFormIds.has(id));

    if (formsToDelete.length === 0) {
      return NextResponse.json(
        { error: "No forms are connected to this project" },
        { status: 400 }
      );
    }

    // Delete connections
    const { error: deleteError } = await client
      .from("formProjects")
      .delete()
      .eq("projectId", validatedData.projectId)
      .in("formId", formsToDelete);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      deleted: formsToDelete.length,
      skipped: validatedData.formIds.length - formsToDelete.length
    });
  } catch (error) {
    console.error("Error disconnecting forms from project:", error);
    return NextResponse.json(
      { error: "Failed to disconnect forms from project" },
      { status: 500 }
    );
  }
} 