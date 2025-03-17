import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const limit = parseInt(searchParams.get("limit") ?? "10");
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const searchText = searchParams.get("query");

  const [, authUser] = await user(req);

  if (!authUser) {
    console.error("Session does not exist.");
    return NextResponse.json(
      { status: "Session does not exist" },
      { status: 500 }
    );
  }

  console.log(authUser);

  try {
    const organization = await supabaseServiceRole
      .from("Organization")
      .select("id")
      .eq("publicId", authUser.user_metadata.organizationId)
      .single();

    if (!organization.data) {
      console.error("Organization not found.");
      return NextResponse.json(
        { status: "Organization not found" },
        { status: 500 }
      );
    }

    let projectsRaw: PostgrestSingleResponse<FlatProject[]> | null = null;

    if (!searchText || searchText?.length === 0) {
      projectsRaw = await supabaseServiceRole
        .from("Project")
        .select("*", { count: "exact" })
        .limit(limit)
        .range(offset, offset + limit - 1)
        .order("createdAt", { ascending: false })
        .eq("organizationId", organization.data.id);
    } else {
      projectsRaw = await supabaseServiceRole
        .from("Project")
        .select("*", { count: "exact" })
        .limit(limit)
        .order("createdAt", { ascending: false })
        .range(offset, offset + limit - 1)
        .textSearch("name", searchText, {
          type: "phrase",
          config: "english",
        })
        .eq("organizationId", organization.data.id);
    }

    console.log("projectsRaw", projectsRaw);

    const projects: Project[] = (projectsRaw?.data ?? []).map((project) => {
      return {
        ...project,
        images: [],
        assignees: [],
      };
    });

    for (const project of projects) {
      const images = await supabaseServiceRole
        .from("Image")
        .select("*")
        .eq("projectId", project.id);

      const assignees = await supabaseServiceRole
        .from("UserToProject")
        .select("*, User (firstName, lastName, email)")
        .eq("projectId", project.id);

      project.assignees = assignees.data ?? [];

      const formattedImages: Image[] = (images.data ?? []).map((image) => ({
        ...image,
        url: supabaseServiceRole.storage
          .from("media")
          .getPublicUrl(decodeURIComponent(image.key)).data.publicUrl,
      }));

      console.log("formattedImages", formattedImages);

      project.images = formattedImages;
    }

    return NextResponse.json({
      status: "ok",
      projects,
      total: projectsRaw?.count ?? 0,
    });
    // let projects;
    // if (queryId) {
    //   projects = await listProjectsForauthUser(org.id, queryId, limit, offset);
    //   projects = projects.filter((p) =>
    //     p.projectAssignees.find((u) => u.authUserId === queryId)
    //   );
    // } else {
    //   projects = await listProjects(org.id, limit, offset);
    //   projects = projects?.projects;
    // }
    // console.log("projects", projects);
    // return NextResponse.json({
    //   status: "ok",
    //   projects,
    //   orgId: org.publicId,
    //   teamMembers: superjson.serialize(org.authUsers).json,
    // });
  } catch (err) {
    console.error("err", err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const [, authUser] = await user(req);

  const body: { location: AddressType; name: string } = await req.json();

  try {
    const { data } = await supabaseServiceRole
      .from("Organization")
      .select("id")
      .eq("publicId", authUser.user_metadata.organizationId)
      .single();

    const { data: projectData } = await supabaseServiceRole
      .from("Project")
      .insert({
        publicId: v4(),
        name: body.name,
        clientName: body.name,
        location: body.location.formattedAddress,
        lat: `${body.location.lat}`,
        lng: `${body.location.lng}`,
        organizationId: data!.id,
        status: "active",
      })
      .select("*")
      .single();

    await supabaseServiceRole.from("UserToProject").insert({
      projectId: projectData!.id,
      userId: authUser.id,
    });

    return NextResponse.json(
      { status: "ok", projectId: projectData?.publicId, project: projectData },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await user(req);

  const projectId = (await params).id;

  try {
    await supabaseServiceRole
      .from("Project")
      .update({ isDeleted: true })
      .eq("publicId", projectId);

    return NextResponse.redirect("/projects");
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
