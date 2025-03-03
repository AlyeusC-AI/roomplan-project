import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";

export async function GET(req: NextRequest) {
  try {
    const [, authUser] = await user(req);

    const org = await supabaseServiceRole
      .from("Organization")
      .select("id")
      .eq("publicId", authUser.user_metadata.organizationId)
      .single();

    // Get all equipment from the organization
    const equipment = await supabaseServiceRole
      .from("Equipment")
      .select("*")
      .eq("organizationId", org.data!.id);
    console.log("🚀 ~ GET ~ equipment:", equipment)

    // Get all equipment IDs that are currently assigned to projects and not deleted
    const assignedEquipment = await supabaseServiceRole
      .from("ProjectEquipment")
      .select("equipmentId")
      .eq("isDeleted", false)
      .in("equipmentId", (equipment.data || []).map(e => e.id));
    console.log("🚀 ~ GET ~ assignedEquipment:", assignedEquipment)

    // Filter to get only equipment that is not in assignedEquipment
    const availableEquipment = equipment.data?.filter(
      e => !assignedEquipment.data?.some(ae => ae.equipmentId === e.id)
    );
    console.log("🚀 ~ GET ~ availableEquipment:", availableEquipment)

    return NextResponse.json({ equipment: availableEquipment });
  } catch (error) {
    console.error("Error fetching available equipment:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

