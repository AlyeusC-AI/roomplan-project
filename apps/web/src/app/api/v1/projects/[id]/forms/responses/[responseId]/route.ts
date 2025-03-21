import { supabaseServiceRole } from "@lib/supabase/admin";
import { createClient } from "@lib/supabase/client";
import { user as getUser } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; responseId: string }> }
) {
  try {
    const [, user] = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data } = await request.json();
    const {id:projectId, responseId} = await params;

    // Verify project exists and user has access
    const { data: project, error: projectError } = await supabaseServiceRole
      .from("Project")
      .select("*")
      .eq("publicId", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Update form response fields
    const { error: updateError } = await supabaseServiceRole
      .from("FormResponseField")
      .upsert(
        Object.entries(data).map(([fieldId, value]) => ({
          formResponseId: parseInt(responseId),
          formFieldId: parseInt(fieldId),
          value: value as string,
        }))
      );

    if (updateError) {
      console.error("Error updating form response fields:", updateError);
      return NextResponse.json(
        { error: "Failed to update form response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating form response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 