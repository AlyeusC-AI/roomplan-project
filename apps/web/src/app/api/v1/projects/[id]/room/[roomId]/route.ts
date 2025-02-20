import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { createClient } from "@lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";


export async function DELETE(req: NextRequest) {
    const supabase = await createClient();
  
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("Session does not exist.");
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }
    const { roomId } = await req.json();
  
    console.log("🚀 ~ DELETE ~ roomId:", roomId)
    try {
      const room = await supabaseServiceRole
        .from("Room")
        .select("name, id")
        .eq("publicId", roomId);
        console.log("🚀 ~ DELETE ~ room:", room)

      const { name, id: roomRawId } = room.data![0];
  
      await supabaseServiceRole
        .from("Detection")
        .update({ isDeleted: true })
        .eq("roomId", roomRawId);
  
      await supabaseServiceRole
        .from("Inference")
        .update({ isDeleted: true })
        .eq("roomId", roomRawId);
  
      await supabaseServiceRole
        .from("Room")
        .update({ isDeleted: true, name: `${roomId}-${name}` })
        .eq("publicId", roomId);
  
      await supabaseServiceRole
        .from("Image")
        .update({ isDeleted: true })
        .eq("roomId", roomRawId);
  
      return NextResponse.json({ status: "ok" });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }
  }