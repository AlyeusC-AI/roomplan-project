import { createClient } from "@lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { user as getUser } from "@lib/supabase/get-user";
import { z } from "zod";
import { supabaseServiceRole } from "@lib/supabase/admin";

// POST /api/v1/organization/forms/connect
export async function POST(req: NextRequest) {
  try {
    const [, user] = await getUser(req);
    const body = await req.json();
    
    // Validate request body
    const validatedData = z.object({
      formId: z.number(),
      projectId: z.string()
    }).parse(body);
    console.log("🚀 ~ POST ~ validatedData:", validatedData)
    
    const organizationId: string = user?.user_metadata.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const org = await supabaseServiceRole.from("Organization").select("id").eq("publicId", organizationId).single();

    if (org.error) throw org.error;

    // Verify project belongs to organization
    const { data: project, error: projectError } = await supabaseServiceRole
      .from("Project")
      .select("id")
      .eq("publicId", validatedData.projectId)
      .eq("organizationId", org.data.id)
      .single();
      console.log("🚀 ~ POST ~ project:", project)
      console.log("🚀 ~ POST ~ projectError:", projectError)

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found or does not belong to organization" },
        { status: 404 }
      );
    }

    // Verify all forms belong to organization
    const { data: forms, error: formsError } = await supabaseServiceRole
      .from("Form")
      .select("id")
      .eq("id", validatedData.formId)
      .eq("orgId", org.data.id);

    if (formsError) throw formsError;

    if (!forms ) {
      return NextResponse.json(
        { error: "One or more forms not found or do not belong to organization" },
        { status: 404 }
      );
    }

    // Get existing connections for this project
    const { data: existingConnections, error: connectionsError } = await supabaseServiceRole
      .from("formProjects")
      .select("formId")
      .eq("projectId", project.id)
      .eq("formId", validatedData.formId);

    if (connectionsError) throw connectionsError;

    if (existingConnections.length > 0) {
      return NextResponse.json(
        { error: "Form already connected to project" },
        { status: 400 }
      );
    }

 
    // Start a transaction
    const { data: connections, error: insertError } = await supabaseServiceRole
      .from("formProjects")
      .insert(
        {
          formId: validatedData.formId,
          projectId: project.id
        }
      )
      .select();

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      connected: connections,
    
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
    const body = await req.json();
    
    // Validate request body
    const validatedData = z.object({
      formId: z.number(),
      projectId: z.string()
    }).parse(body);
    
    const organizationId: string = user?.user_metadata.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const org = await supabaseServiceRole.from("Organization").select("id").eq("publicId", organizationId).single();

    if (org.error) throw org.error;

    // Verify project belongs to organization
    const { data: project, error: projectError } = await supabaseServiceRole
      .from("Project")
      .select("id")
      .eq("publicId", validatedData.projectId)
      .eq("organizationId", org.data.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found or does not belong to organization" },
        { status: 404 }
      );
    }

    // Get existing connections
    const { data: existingConnections, error: connectionsError } = await supabaseServiceRole
      .from("formProjects")
      .select("formId")
      .eq("projectId", project.id)
      .eq("formId", validatedData.formId);

    if (connectionsError) throw connectionsError;

   
    if (existingConnections.length === 0) {
      return NextResponse.json(
        { error: "Form not connected to project" },
        { status: 400 }
      );
    }

    // Delete connections
    const { error: deleteError } = await supabaseServiceRole
      .from("formProjects")
      .delete()
      .eq("projectId", project.id)
      .eq("formId", validatedData.formId);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error disconnecting forms from project:", error);
    return NextResponse.json(
      { error: "Failed to disconnect forms from project" },
      { status: 500 }
    );
  }
} 

// GET /api/v1/organization/forms/connections
export async function GET(req: NextRequest) {
  try {
    const [, user] = await getUser(req);
    const { searchParams } = new URL(req.url);
      const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const organizationId: string = user?.user_metadata.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      )
    }

    const org = await supabaseServiceRole.from("Organization").select("id").eq("publicId", organizationId).single();

    if (org.error) throw org.error;
    
    const { data: project, error: projectError } = await supabaseServiceRole
      .from("Project")
      .select("id")
      .eq("publicId", projectId)
      .eq("organizationId", org.data.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found or does not belong to organization" },
        { status: 404 }
      );
    }

        const { data: connections, error: connectionsError } = await supabaseServiceRole
      .from("formProjects")
      .select("formId, projectId")
      .eq("projectId", project.id);
    if (connectionsError) throw connectionsError; 
    
    return NextResponse.json({
      connections
    });
  } catch (error) {
    console.error("Error fetching form connections:", error);
    return NextResponse.json({ error: "Failed to fetch form connections" }, { status: 500 });
  }
}
