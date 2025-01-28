import { createClient } from "@lib/supabase/server";
import createCost from "@servicegeek/db/queries/cost/createCost";
import deleteCost from "@servicegeek/db/queries/cost/deleteCost";
import updateCost from "@servicegeek/db/queries/cost/updateCost";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
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
  const body = await req.json();
  const id = (await params).id;
  if (Array.isArray(id) || !id) {
    return NextResponse.json(
      { status: "failed", reason: "invalid query param" },
      { status: 400 }
    );
  }

  try {
    const { type, costData, costId } = body;

    await updateCost(user.id, id, type, costId, {
      name: costData.name,
      actualCost: costData.actualCost,
      estimatedCost: costData.estimatedCost,
    });

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!user || !session?.access_token) {
    console.error("Session does not exist.");
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }

  const { type } = await req.json();
  const id = (await params).id;
  if (Array.isArray(id) || !id) {
    return NextResponse.json(
      { status: "failed", reason: "invalid query param" },
      { status: 400 }
    );
  }

  try {
    const cost = await createCost(user.id, id, type);

    return NextResponse.json(
      { status: "ok", cost: { id: cost?.id } },
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
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!user || !session?.access_token) {
    console.error("Session does not exist.");
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }

  const id = (await params).id;
  if (Array.isArray(id) || !id) {
    return NextResponse.json(
      { status: "failed", reason: "invalid query param" },
      { status: 400 }
    );
  }

  try {
    const { type, costId } = await req.json();

    await deleteCost(user.id, id, type, costId);
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
