import { createClient } from "@lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

const createInvitation = async (userId: string, email: string) => {
  const supabaseClient = await createClient();

  // Get organization details
  const { data: haloUser } = await supabaseClient
    .from("User")
    .select("*")
    .eq("id", userId)
    .single();
  console.log("🚀 ~ POST ~ haloUser:", haloUser);

  // Get organization details
  const { data: organization } = await supabaseClient
    .from("Organization")
    .select("*")
    .eq("publicId", haloUser?.organizationId!)
    .single();
  console.log("🚀 ~ POST ~ org:organization", organization);
  const organizationId = organization?.id;
  if (!organizationId) return { failed: true, reason: "no-org" };

  const isAdmin =
    haloUser?.accessLevel === "owner" || haloUser?.accessLevel === "admin";
  if (!isAdmin) return { failed: true, reason: "not-allowed" };

  if (organization.subscriptionPlan == "early_bird") {
    return {
      failed: true,
      reason: "please upgrade to a paid plan to invite users",
    };
  }
  const { data: existingMember } = await supabaseClient
    .from("UserToOrganization")
    .select("*")
    .eq("organizationId", organizationId)
    .eq("isDeleted", false)
    .eq("user.email", email)
    .eq("user.isDeleted", false)
    .single();
  console.log("🚀 ~ POST ~ existingMember:", existingMember);
  // await prisma.userToOrganization.findFirst({
  //   where: {
  //     organizationId,
  //     isDeleted: false,
  //     user: { isDeleted: false, email },
  //   },
  //   select: {
  //     user: {
  //       select: {
  //         id: true,
  //       },
  //     },
  //   },
  // });

  if (existingMember) return { failed: true, reason: "existing-member" };

  const invitationId = uuidv4();
  const { data: existingInvite } = await supabaseClient
    .from("OrganizationInvitation")
    .select("*")
    .eq("organizationId", organizationId)
    .eq("email", email)
    .eq("isDeleted", false)
    .eq("isAccepted", false)
    .single();
  console.log("🚀 ~ createInvitation ~ existingInvite:", existingInvite);

  // if (existingInvite) return { failed: true, reason: "existing-invite" };
  if (existingInvite)
    return {
      failed: false,
      reason: null,
      inviteId: existingInvite.invitationId,
      orgId: organizationId,
    };

  const { data, error } = await supabaseClient
    .from("OrganizationInvitation")
    .insert({
      email,
      invitationId,
      organizationId: organizationId!,
    });
  console.log("🚀 ~ createInvitation ~ data:", data);

  if (error) return { failed: true, reason: error.message };

  return {
    failed: false,
    reason: null,
    inviteId: invitationId,
    orgId: organizationId,
  };
};

export default createInvitation;
