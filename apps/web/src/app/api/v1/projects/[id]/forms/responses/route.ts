import { supabaseServiceRole } from "@lib/supabase/admin";
import { createClient } from "@lib/supabase/client";
import { user as getUser } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [, user] = await getUser(req);
  const {id:projectId} = await params;
  const client = await createClient();

  try {
    // Get project to verify it exists
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

    // Get all form responses for this project
    const { data: responses, error: responsesError } = await supabaseServiceRole
      .from("FormResponse")
      .select(`
        *,
        form:Form (
          *,
          sections:FormSection (
            *,
            fields:FormField (
              *,
              options:FormOption (*)
            )
          )
        ),
        fields:FormResponseField (
          *,
          field:FormField (*)
        )
      `)
      .eq("projectId", project.id)
      .order("created_at", { ascending: false });

    if (responsesError) throw responsesError;

    return NextResponse.json({ responses: responses || [] });
  } catch (error) {
    console.error("Error fetching form responses:", error);
    return NextResponse.json(
      { error: "Failed to fetch form responses" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const [, user] = await getUser(req);
  const projectId = params.id;
  const body = await req.json();

  try {
    // Get project to verify it exists
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

    // Create form response
    const { data: formResponse, error: formResponseError } = await supabaseServiceRole
      .from("FormResponse")
      .insert({
        formId: body.formId,
        projectId: project.id,
        date: new Date().toISOString(),
      })
      .select()
      .single();

    if (formResponseError) throw formResponseError;

    // Create form response fields
    const formResponseFields = Object.entries(body.data).map(([fieldId, value]) => ({
      formResponseId: formResponse.id,
      formFieldId: parseInt(fieldId),
      value: typeof value === "object" ? JSON.stringify(value) : String(value),
    }));

    const { error: fieldsError } = await supabaseServiceRole
      .from("FormResponseField")
      .insert(formResponseFields);

    if (fieldsError) throw fieldsError;

    return NextResponse.json({ status: "success", response: formResponse });
  } catch (error) {
    console.error("Error submitting form:", error);
    return NextResponse.json(
      { error: "Failed to submit form" },
      { status: 500 }
    );
  }
} 