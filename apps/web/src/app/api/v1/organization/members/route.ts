import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const [, authUser] = await user(req);
    console.log("🚀 ~ GET ~ authUser:", authUser)

    if (!authUser) {
      console.error("Session does not exist.");
      return NextResponse.json(
        { status: "Session does not exist" },
        { status: 500 }
      );
    }
    let organizationId = authUser.user_metadata.organizationId;
    if(isNaN(Number(authUser.user_metadata.organizationId))) {
      const { data: organization } = await supabaseServiceRole
        .from("Organization")
        .select("id")
        .eq("publicId", authUser.user_metadata.organizationId)
        .single();
      organizationId = organization?.id;
    }

    const data = await supabaseServiceRole
      .from("UserToOrganization")
      .select("*,User(*)")
      .eq("organizationId", organizationId)
      .eq("isDeleted", false)
      .neq("User.isDeleted", true)
      .neq("User.isSupportUser", true);
      // .neq("isSupportUser", true);
      console.log("🚀 ~ GET ~ data:", data)

    return NextResponse.json({ status: "ok", members: data.data?.filter((member)=>member.User).map((member)=>({
      ...member,
      ...member.User
    })) || [] });
  } catch {
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
