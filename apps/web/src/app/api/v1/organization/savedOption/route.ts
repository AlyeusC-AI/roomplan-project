import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { user as getUser } from "@lib/supabase/get-user";
import { SupabaseClient, User } from "@supabase/supabase-js";
// Types
export const SavedOptionType = z.enum([
  "carrier",
  "wallMaterial",
  "floorMaterial",
]);
export type SavedOptionType = z.infer<typeof SavedOptionType>;

export interface SavedOption {
  publicId: string;
  label: string;
  value?: string;
  type: SavedOptionType;
  organizationId: number;
  createdAt?: string;
  updatedAt?: string;
}

// Validation Schemas
const SavedOptionApiPatchBodySchema = z.object({
  publicId: z.string().uuid(),
  label: z.string().min(1),
  value: z.string().optional(),
});

const SavedOptionApiPostBodySchema = z.object({
  label: z.string().min(1),
  type: SavedOptionType,
});

const SavedOptionApiDeleteBodySchema = z.object({
  publicId: z.string().uuid(),
});

// Type exports
export type SavedOptionApiPatchBody = z.infer<
  typeof SavedOptionApiPatchBodySchema
>;
export type SavedOptionApiPostBody = z.infer<
  typeof SavedOptionApiPostBodySchema
>;
export type SavedOptionApiDeleteBody = z.infer<
  typeof SavedOptionApiDeleteBodySchema
>;

// Helper functions
async function updateSavedOption(
  supabase: SupabaseClient,
  userId: string,
  publicId: string,
  label: string,
  value?: string,
  user?: User,
  
) {

  if (!user?.user_metadata?.organizationId) {
    return { failed: true, error: "No organization ID found" };
  }
  const { data: organization } = await supabase
    .from("Organization")
    .select("id")
    .eq("publicId", user.user_metadata.organizationId)
    .single();

  const { data, error } = await supabase
    .from("OrganizationSavedOption")
    .update({ label, value })
    .eq("organizationId", organization?.id!)
    .eq("publicId", publicId)
    .select()
    .single();

  if (error) {
    return { failed: true, error };
  }

  return { failed: false, result: data };
}

async function deleteSavedOption(
  supabase: SupabaseClient,
  user: User,
  publicId: string) {

  if (!user?.user_metadata?.organizationId) {
    return { failed: true, error: "No organization ID found" };
  }
  const { data: organization } = await supabase
    .from("Organization")
    .select("id")
    .eq("publicId", user.user_metadata.organizationId)
    .single();

  const { error } = await supabase
    .from("OrganizationSavedOption")
    .delete()
    .eq("organizationId", organization?.id!)
    .eq("publicId", publicId);

  if (error) {
    return { failed: true, error };
  }

  return { failed: false };
}

async function getSavedOptions(supabase: SupabaseClient, user: User, type: SavedOptionType) {

  if (!user?.user_metadata?.organizationId) {
    return { failed: true, error: "No organization ID found" };
  }
  const { data: organization } = await supabase
    .from("Organization")
    .select("id")
    .eq("publicId", user.user_metadata.organizationId)
    .single();

  const { data, error } = await supabase
    .from("OrganizationSavedOption")
    .select()
    .eq("organizationId", organization?.id!)
    .eq("type", type)
    .order("createdAt", { ascending: true });

  if (error) {
    return { failed: true, error };
  }

  return { failed: false, result: data };
}

// Error handling helper
function handleApiError(error: unknown) {
  console.error(error);
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { status: "failed", reason: "Invalid input", errors: error.errors },
      { status: 400 }
    );
  }
  if (error instanceof Error) {
    return NextResponse.json(
      { status: "failed", reason: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json(
    { status: "failed", reason: "An unexpected error occurred" },
    { status: 500 }
  );
}

// API Routes
export async function PATCH(req: NextRequest) {

  try {
   
    const [supabase,user] = await getUser(req); 
    if (!user) {
      return NextResponse.json(
        { status: "failed", reason: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = SavedOptionApiPatchBodySchema.parse(await req.json());
    const result = await updateSavedOption(
      supabase,
      user.id,
      body.publicId,
      body.label,
      body.value,
      user
    );

    if (result.failed) {
      return NextResponse.json(
        {
          status: "failed",
          reason: "Failed to update option",
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { status: "ok", option: result.result },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {

  try {
    const [supabase,user] = await getUser(req); 

    if (!user) {
      return NextResponse.json(
        { status: "failed", reason: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!user.user_metadata?.organizationId) {
      return NextResponse.json(
        { status: "failed", reason: "No organization ID found" },
        { status: 400 }
      );
    }

    const body = SavedOptionApiPostBodySchema.parse(await req.json());

    const { data: organization } = await supabase
      .from("Organization")
      .select("id")
      .eq("publicId", user.user_metadata.organizationId)
      .single();

    const { data, error } = await supabase
      .from("OrganizationSavedOption")
      .insert({
        type: body.type,
        organizationId: organization?.id!,
        label: body.label,
        publicId: uuidv4(),
        value: body.label, // Using label as value by default
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { status: "failed", reason: "Failed to create option", error },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: "ok", option: data }, { status: 201 });
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error)
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {

  try {
    const [supabase,user] = await getUser(req); 

    if (!user) {
      return NextResponse.json(
        { status: "failed", reason: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = SavedOptionApiDeleteBodySchema.parse(await req.json());
    const result = await deleteSavedOption(supabase,user, body.publicId);

    if (result.failed) {
      return NextResponse.json(
        {
          status: "failed",
          reason: "Failed to delete option",
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {

  try {
    const [supabase,user] = await getUser(req); 

    if (!user) {
      return NextResponse.json(
        { status: "failed", reason: "Unauthorized" },
        { status: 401 }
      );
    }

    const type = req.nextUrl.searchParams.get("type");
    if (!type) {
      return NextResponse.json(
        { status: "failed", reason: "Missing type parameter" },
        { status: 400 }
      );
    }

    const validatedType = SavedOptionType.parse(type);
    const result = await getSavedOptions(supabase,user, validatedType);
    console.log("🚀 ~ GET ~ result:", result);

    if (result.failed) {
      return NextResponse.json(
        {
          status: "failed",
          reason: "Failed to fetch options",
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { status: "ok", options: result.result },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
