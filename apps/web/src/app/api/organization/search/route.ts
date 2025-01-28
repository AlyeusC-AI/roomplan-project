import { default as getRestorationXUser } from "@servicegeek/db/queries/user/getUser";
import { prisma } from "@servicegeek/db";

import { createClient } from "@lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabaseClient = await createClient();

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user) {
    console.error("Session does not exist.");
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }

  const searchTerm = req.nextUrl.searchParams.get("search");
  if (Array.isArray(searchTerm) || !searchTerm) {
    return NextResponse.json(
      { status: "failed", reason: "invalid query param" },
      { status: 400 }
    );
  }

  try {
    const servicegeekUser = await getRestorationXUser(user.id);
    const org = servicegeekUser?.org?.organization;
    if (!org?.id) {
      console.error("err", "no org");
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }
    const search = searchTerm
      .split(" ")
      .map((s) => `${s.trim()}:*`)
      .join(" | ");

    const results = await prisma.project.findMany({
      where: {
        isDeleted: false,
        organizationId: org.id,
        name: {
          search,
        },
        location: {
          search,
        },
        clientEmail: {
          search,
        },
        clientPhoneNumber: {
          search,
        },
        companyName: {
          search,
        },
        assignmentNumber: {
          search,
        },
        managerName: {
          search,
        },
        adjusterEmail: {
          search,
        },
        adjusterName: {
          search,
        },
        adjusterPhoneNumber: {
          search,
        },
        insuranceCompanyName: {
          search,
        },
        insuranceClaimId: {
          search,
        },
        claimSummary: {
          search,
        },
      },
      select: {
        publicId: true,
        name: true,
        location: true,
        clientEmail: true,
        clientPhoneNumber: true,
        companyName: true,
        managerName: true,
        adjusterEmail: true,
        adjusterName: true,
        adjusterPhoneNumber: true,
        insuranceCompanyName: true,
        insuranceClaimId: true,
        claimSummary: true,
        status: true,
      },
    });

    return NextResponse.json({ results }, { status: 200 });
  } catch (err) {
    console.error("err", err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
