// TODO: Integrate with images

import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await user(req);

    const { id } = await params;

    const project = await supabaseServiceRole
      .from("Project")
      .select("id")
      .eq("publicId", id)
      .single();

    // const search = req.nextUrl.searchParams;

    const { data: images, error } = await supabaseServiceRole
      .from("Image")
      .select(
        `
        *,
        ImageNote (
          *,
          User (
            id,
            firstName,
            lastName,
            email
          )
        ),
        Inference (
          publicId,
          Room (
            publicId,
            name
          )
        )
      `
      )
      .eq("projectId", project.data!.id)
      .eq("isDeleted", false);
    // .eq("includeInReport", input.onlySelected)
    // .order("createdAt", { ascending: input.sortDirection !== "desc" })
    // .in("inference.room.name", input.rooms || []);

    if (error) {
      console.error(error);
      throw error;
    }

    const imageKeys = images.map((i) => decodeURIComponent(i.key));
    const { data } = await supabaseServiceRole.storage
      .from("project-images")
      .createSignedUrls(imageKeys, 1800);

    const { data: mediaData } = await supabaseServiceRole.storage
      .from("media")
      .createSignedUrls(imageKeys, 1800);
    const arr =
      data && mediaData
        ? [...data, ...mediaData]
        : data
          ? data
          : mediaData
            ? mediaData
            : [];
    const urlMap = arr.reduce<{
      [imageKey: string]: string;
    }>((p, c) => {
      if (c.error) return p;
      if (!c.path) return p;
      return {
        [c.path]: c.signedUrl,
        ...p,
      };
    }, {});

    return NextResponse.json({ images, urlMap });
  } catch {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await user(req);

    const { id, ...props } = await req.json();

    const { data, error } = await supabaseServiceRole
      .from("Image")
      .update(props)
      .eq("publicId", id);

    if (error) {
      console.error(error);
      throw error;
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const [, authUser] = await user(req);

    const { body, imageId } = await req.json();

    console.log({ body, imageId });

    const { data, error } = await supabaseServiceRole
      .from("ImageNote")
      .insert({ body, imageId, userId: authUser.id })
      .select("*")
      .single();

    if (error) {
      console.error(error);
      throw error;
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
