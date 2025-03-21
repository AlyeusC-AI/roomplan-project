import { supabaseServiceRole } from "@lib/supabase/admin";
import { createClient } from "@lib/supabase/client";
import { user as getUser } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const [, user] = await getUser(req);
  const {id:projectId} = await params;
  console.log("🚀 ~ projectId:", projectId)
  const client = await createClient();

  try {
    // Get project to verify it exists and get its damage type
    const { data: project } = await supabaseServiceRole
      .from("Project")
      .select("*")
      .eq("publicId", projectId)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

  
  

    // Get forms that match the project's damage type
    const { data: forms, error: formsError } = await supabaseServiceRole
      .from("Form")
      .select(`
        *,
        sections: FormSection (
          *,
          fields:FormField (
            *,
            options: FormOption (*)
          )
        )
      `)
      .order("created_at", { ascending: false })
      .eq("orgId", project.organizationId)
      .contains("damageTypes", [project.damageType]);

    if (formsError) throw formsError;

    // Return empty array if no forms found
    return NextResponse.json({ forms: forms || [] });
  } catch (error) {
    console.error("Error fetching forms:", error);
    return NextResponse.json(
      { error: "Failed to fetch forms" },
      { status: 500 }
    );
  }
} 