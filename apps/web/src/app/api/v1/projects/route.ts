import { supabaseServiceRole } from "@lib/supabase/admin";
import { createClient } from "@lib/supabase/server";
import createProject from "@servicegeek/db/queries/project/createProject";
import deleteProject from "@servicegeek/db/queries/project/deleteProject";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const searchParams = req.nextUrl.searchParams;

  const limit = parseInt(searchParams.get("limit") ?? "10");
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const searchText = searchParams.get("searchText");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Session does not exist.");
    return NextResponse.json(
      { status: "Session does not exist" },
      { status: 500 }
    );
  }

  try {
    const organization = await supabase
      .from("Organization")
      .select("id")
      .eq("publicId", user.user_metadata.organizationId)
      .single();

    if (!organization.data) {
      console.error("Organization not found.");
      return NextResponse.json(
        { status: "Organization not found" },
        { status: 500 }
      );
    }

    const projectsRaw = await supabaseServiceRole
      .from("Project")
      .select("*", { count: "exact" })
      .limit(limit)
      .range(offset * limit, (offset + 1) * limit)
      .eq("organizationId", organization.data.id);

    console.log("projectsRaw", projectsRaw);

    const projects: Project[] = (projectsRaw.data ?? []).map((project) => {
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
      total: projectsRaw.count,
    });
    // let projects;
    // if (queryId) {
    //   projects = await listProjectsForUser(org.id, queryId, limit, offset);
    //   projects = projects.filter((p) =>
    //     p.projectAssignees.find((u) => u.userId === queryId)
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
    //   teamMembers: superjson.serialize(org.users).json,
    // });
  } catch (err) {
    console.error("err", err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("Session does not exist.");
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
  const body = await req.json();

  try {
    const { publicId, failed, reason } = await createProject(user.id, {
      name: body.name,
      location: body.location,
    });
    if (failed) {
      return NextResponse.json({ status: "failed", reason }, { status: 500 });
    }

    return NextResponse.json(
      { status: "ok", projectId: publicId },
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
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("Session does not exist.");
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }

  const projectId = (await params).id;
  if (Array.isArray(projectId) || !projectId) {
    return NextResponse.json(
      { status: "failed", reason: "invalid query param" },
      { status: 400 }
    );
  }

  try {
    const { failed, reason } = await deleteProject(user.id, projectId);
    if (failed) {
      return NextResponse.json({ status: "failed", reason }, { status: 500 });
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
