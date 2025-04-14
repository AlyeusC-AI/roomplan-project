import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function PATCH(req: NextRequest) {
  const [, authUser] = await user(req);
  const body = await req.json();

  try {
    if (!body.body) {
      return NextResponse.json({ status: "failed" }, { status: 400 });
    }

    const noteRes = await supabaseServiceRole
      .from("Notes")
      .update({
        body: body.body,
      })
      .eq("publicId", body.noteId)
      .select("*")
      .single();

    console.log(noteRes);

    const { data: userData } = await supabaseServiceRole
      .from("User")
      .select("*")
      .eq("id", authUser.id)
      .single();
    const result = await supabaseServiceRole.from("NotesAuditTrail").insert({
      notesId: noteRes.data!.id,
      action: "updated",
      body: body.body,
      userId: authUser.id,
      userName: `${userData?.firstName} ${userData?.lastName}`,
    });

    console.log(result);

    return NextResponse.json(
      { status: "ok", note: noteRes.data },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [, authUser] = await user(req);

  const { id } = await params;

  const { body, roomId } = await req.json();

  try {
    const project = await supabaseServiceRole
      .from("Project")
      .select("id")
      .eq("publicId", id)
      .single();

    const room = await supabaseServiceRole
      .from("Room")
      .select("id")
      .eq("publicId", roomId)
      .single();

    const { data: result, error } = await supabaseServiceRole
      .from("Notes")
      .insert({
        projectId: project.data!.id,
        body: body,
        roomId: room.data!.id,
        publicId: uuidv4(),
      })
      .select("*")
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    const { data: userData } = await supabaseServiceRole
      .from("User")
      .select("*")
      .eq("id", authUser.id)
      .single();

    await supabaseServiceRole.from("NotesAuditTrail").insert({
      notesId: result!.id,
      action: "created",
      body: body,
      userId: authUser.id,
      userName: `${userData?.firstName} ${userData?.lastName}`,
    });

    return NextResponse.json(
      { status: "ok", note: result.data },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const [, authUser] = await user(req);
  const body = await req.json();

  try {
    const note = await supabaseServiceRole
      .from("Notes")
      .update({
        isDeleted: true,
      })
      .eq("publicId", body.noteId)
      .select("body")
      .single();
    const { data: userData } = await supabaseServiceRole
      .from("User")
      .select("*")
      .eq("id", authUser.id)
      .single();

    await supabaseServiceRole.from("NotesAuditTrail").insert({
      notesId: body.noteId,
      action: "deleted",
      body: note.data!.body,
      userId: authUser.id,
      userName: `${userData?.firstName} ${userData?.lastName}`,
    });
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

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

    const notes = await supabaseServiceRole
      .from("Room")
      .select("*, Notes(*, NotesAuditTrail(*), NoteImage(*))")
      .eq("projectId", project.data!.id)
      .eq("isDeleted", false)
      .eq("Notes.isDeleted", false)
      .order("createdAt", { ascending: false });

    return NextResponse.json(
      { status: "ok", notes: notes.data },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
