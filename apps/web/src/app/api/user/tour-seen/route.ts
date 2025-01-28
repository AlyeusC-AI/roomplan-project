import { createClient } from "@lib/supabase/server";
import { prisma } from "@servicegeek/db";

import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Session does not exist.");
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }

  const body = await req.json();

  console.log("body", body);
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        productTourData: body,
      },
    });
  } catch (err) {
    console.error("err", err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}
