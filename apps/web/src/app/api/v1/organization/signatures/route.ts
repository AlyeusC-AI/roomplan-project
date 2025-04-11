import { supabaseServiceRole } from "@lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { user as getUser } from "@lib/supabase/get-user";
import { z } from "zod";

const createSignatureSchema = z.object({
  name: z.string(),
  sign: z.string(),
});

const updateSignatureSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  sign: z.string().optional(),
});

const deleteSignatureSchema = z.object({
  id: z.number()
});

// GET /api/v1/organization/signatures
export async function GET(req: NextRequest) {
  try {
    const [, user] = await getUser(req);

    const organizationId: string = user?.user_metadata.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const org = await supabaseServiceRole.from("Organization").select("id").eq("publicId", organizationId).single();

    if (org.error) throw org.error;

    // Get signatures for the organization
    const { data: signatures, error } = await supabaseServiceRole
      .from("Signature")
      .select(`
        *
      `).order("created_at", { ascending: false })
      .eq("orgId", org.data.id);

    if (error) throw error;

    return NextResponse.json(signatures);
  } catch (error) {
    console.error("Error fetching signatures:", error);
    return NextResponse.json(
      { error: "Failed to fetch signatures" },
      { status: 500 }
    );
  }
}

// POST /api/v1/organization/signatures
export async function POST(req: NextRequest) {
  try {
    const [, user] = await getUser(req);
    const body = await req.json();
    
    // Validate request body
    const validatedData = createSignatureSchema.parse(body);
    
    const organizationId: string = user?.user_metadata.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const org = await supabaseServiceRole.from("Organization").select("id").eq("publicId", organizationId).single();

    if (org.error) throw org.error;

    // Create new signature
    const { data: signature, error: signatureError } = await supabaseServiceRole
      .from("Signature")
      .insert({
        name: validatedData.name,
        sign: validatedData.sign,
        orgId: org.data.id,
      })
      .select()
      .single();

    if (signatureError) throw signatureError;

    return NextResponse.json(signature);
  } catch (error) {
    console.error("Error creating signature:", error);
    return NextResponse.json(
      { error: "Failed to create signature" },
      { status: 500 }
    );
  }
}

// PUT /api/v1/organization/signatures
export async function PUT(req: NextRequest) {
  try {
    const [, user] = await getUser(req);
    const body = await req.json();
    
    // Validate request body
    const validatedData = updateSignatureSchema.parse(body);

    // Update signature
    const { data: updatedSignature, error: updateError } = await supabaseServiceRole
      .from("Signature")
      .update({
        name: validatedData.name,
        sign: validatedData.sign
      })
      .eq("id", validatedData.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(updatedSignature);
  } catch (error) {
    console.error("Error updating signature:", error);
    return NextResponse.json(
      { error: "Failed to update signature" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/organization/signatures
export async function DELETE(req: NextRequest) {
  try {
    const [, user] = await getUser(req);
    const body = await req.json();
    
    // Validate request body
    const validatedData = deleteSignatureSchema.parse(body);

    // Delete the signature
    const { error } = await supabaseServiceRole
      .from("Signature")
      .delete()
      .eq("id", validatedData.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting signature:", error);
    return NextResponse.json(
      { error: "Failed to delete signature" },
      { status: 500 }
    );
  }
} 