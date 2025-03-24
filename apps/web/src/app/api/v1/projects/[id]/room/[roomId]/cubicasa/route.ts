import { user } from "@lib/supabase/get-user";
import { supabaseServiceRole } from "@lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

const cubiKey = process.env.CUBICASA_API_KEY;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; roomId: string } }
) {
  if (!cubiKey) {
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
  try {
    await user(req);
    const { roomId } = params;
    const room = await supabaseServiceRole
      .from("Room")
      .select("name, id")
      .eq("publicId", roomId)
      .single();

    if (!room.data) {
      return NextResponse.json(
        { status: "failed", reason: "room-not-found" },
        { status: 404 }
      );
    }

    const fileKey = `room-${room.data?.id}.zip`;

    const url = supabaseServiceRole.storage
      .from("cubi-zip-file")
      .getPublicUrl(fileKey).data.publicUrl;

    const cubiPayload = {
      conversion_type: "t3",
      priority: "ultrafast",
      webhook_url: "https://www.restoregeek.app/api/cubi-webhook",
      source_url: [url],
      external_id: `${room.data?.id}`,
      address: {
        formatted_address: "6 Inverness Ct E Suite 240, Englewood, CO 80112",
        suite: "6",
      },
    };

    const result = await fetch("https://api.cubi.casa/conversion/ticket", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": cubiKey,
      },
      body: JSON.stringify(cubiPayload),
    }).then((res) => res.json());

    await supabaseServiceRole
      .from("Room")
      .update({
        cubiTicketId: result.id,
      })
      .eq("id", room.data?.id);

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
