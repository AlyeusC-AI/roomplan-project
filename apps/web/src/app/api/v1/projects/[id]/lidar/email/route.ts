import { NextRequest, NextResponse } from "next/server";
import { user } from "@lib/supabase/get-user";
import { supabaseServiceRole } from "@lib/supabase/admin";
import { Resend } from "resend";
import { RoomPlanEmailTemplate } from "@lib/novu/emails/room-plan-email";
import { Database } from "@/types/database";

const resend = new Resend(process.env.RESEND_API_KEY);

type Organization = Database["public"]["Tables"]["Organization"]["Row"];
type Project = Database["public"]["Tables"]["Project"]["Row"];
type Room = Database["public"]["Tables"]["Room"]["Row"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [_, authenticatedUser] = await user(req);
    const id = (await params).id;
    const body = await req.json();
    const roomId = body.roomId;

    // Get project details
    const { data: project, error: projectError } = await supabaseServiceRole
      .from("Project")
      .select("*")
      .eq("publicId", id)
      .single();

    if (projectError) {
      console.error("Error fetching project:", projectError);
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get organization details
    const { data: organization, error: orgError } = await supabaseServiceRole
      .from("Organization")
      .select("*")
      .eq("publicId", authenticatedUser.user_metadata.organizationId)
      .single();

    if (orgError) {
      console.error("Error fetching organization:", orgError);
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const { data: owner, error: ownerError } = await supabaseServiceRole
      .from("UserToOrganization")
      .select("*, User(*)")
      .eq("role", "owner")
      .eq("organizationId", organization.id)
      .single();

    if (ownerError) {
      console.error("Error fetching owner:", ownerError);
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    // Get room details
    const { data: room, error: roomError } = await supabaseServiceRole
      .from("Room")
      .select("*")
      .eq("publicId", roomId)
      .single();

    if (roomError) {
      console.error("Error fetching room:", roomError);
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (!room.roomPlanSVG) {
      return NextResponse.json({ error: "Room plan SVG not found" }, { status: 404 });
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "RestoreGeek <team@servicegeek.io>",
      to: "Files@restoregeek.io",
      subject: `Room Plan for ${project.name}`,
      react: RoomPlanEmailTemplate({
        organization: {
          name: organization.name,
          phone: organization.phoneNumber || "Not provided",
          email: owner.User?.email || "Not provided",
          requestor: authenticatedUser.email || "Not provided",
        },
        project: {
          name: project.name,
          address: project.location || "Not provided",
          clientName: project.clientName,
        },
        roomPlanSVG: room.roomPlanSVG,
      }),
    });

    if (error) {
      console.error("Error sending email:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 