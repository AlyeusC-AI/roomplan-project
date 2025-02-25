import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await user(req);
    const { id } = await params;
    const { photoKeys, roomId: roomPublicId } = await req.json();

    if (!photoKeys || !Array.isArray(photoKeys) || photoKeys.length === 0) {
      return NextResponse.json(
        { error: "Invalid photo keys provided" },
        { status: 400 }
      );
    }

    if (!roomPublicId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    // Get the project first
    const { data: project, error: projectError } = await supabaseServiceRole
      .from("Project")
      .select("id")
      .eq("publicId", id)
      .single();

    if (projectError || !project) {
      console.error("Error fetching project:", projectError);
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get the room's actual ID
    const { data: room, error: roomError } = await supabaseServiceRole
      .from("Room")
      .select("id")
      .eq("publicId", roomPublicId)
      .single();

    if (roomError || !room) {
      console.error("Error fetching room:", roomError);
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Get the images
    const { data: images, error: fetchError } = await supabaseServiceRole
      .from("Image")
      .select("id, key")
      .in("key", photoKeys);

    if (fetchError) {
      console.error("Error fetching images:", fetchError);
      throw fetchError;
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: "No images found with the provided keys" },
        { status: 404 }
      );
    }

    // Update or create inferences for each image
    const imageIds = images.map((img) => img.id);

    // First, get existing inferences
    const { data: existingInferences, error: inferencesFetchError } =
      await supabaseServiceRole
        .from("Inference")
        .select("id, imageId")
        .in("imageId", imageIds);

    if (inferencesFetchError) {
      console.error(
        "Error fetching existing inferences:",
        inferencesFetchError
      );
      throw inferencesFetchError;
    }

    // Prepare updates and inserts
    const existingImageIds =
      existingInferences?.map((inf) => inf.imageId) || [];
    const imagesToUpdate = images.filter((img) =>
      existingImageIds.includes(img.id)
    );
    const imagesToInsert = images.filter(
      (img) => !existingImageIds.includes(img.id)
    );

    // Update existing inferences
    if (imagesToUpdate.length > 0) {
      const { error: updateError } = await supabaseServiceRole
        .from("Inference")
        .update({ roomId: room.id })
        .in(
          "imageId",
          imagesToUpdate.map((img) => img.id)
        );

      if (updateError) {
        console.error("Error updating inferences:", updateError);
        throw updateError;
      }
    }

    // Insert new inferences
    if (imagesToInsert.length > 0) {
      const { error: insertError } = await supabaseServiceRole
        .from("Inference")
        .insert(
          imagesToInsert.map((img) => ({
            imageId: img.id,
            roomId: room.id,
            projectId: project.id,
            publicId: crypto.randomUUID(),
          }))
        );

      if (insertError) {
        console.error("Error inserting inferences:", insertError);
        throw insertError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PUT /api/v1/projects/[id]/images/room:", error);
    return NextResponse.json(
      { error: "Failed to assign room to images" },
      { status: 500 }
    );
  }
}
