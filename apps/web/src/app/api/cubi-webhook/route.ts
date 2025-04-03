import { supabaseServiceRole } from "@lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

const cubiKey = process.env.CUBICASA_API_KEY;

export async function POST(request: NextRequest) {
  if (!cubiKey) {
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }

  try {
    const body = await request.json();

    const { ticket_id, event, model_id } = body;

    if (event === "delivered") {
      await supabaseServiceRole
        .from("Room")
        .update({ cubiModelId: model_id })
        .eq("cubiTicketId", ticket_id);

      const cubiUrl = `https://api.cubi.casa/exporter/floorplan/${model_id}`;

      const cubiRes = await fetch(cubiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": cubiKey,
        },
        body: JSON.stringify({}),
      }).then((res) => res.json());

      const images = cubiRes["0"]["png"];
      await supabaseServiceRole
        .from("Room")
        .update({
          cubiRoomPlan: images.join(","),
          roomPlanSVG: images[0],
        })
        .eq("cubiTicketId", ticket_id);
    }
  } catch (error) {
    console.error(error);
  }
  return NextResponse.json({ status: "finished" }, { status: 200 });
}
