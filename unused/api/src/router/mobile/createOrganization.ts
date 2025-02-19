import { z } from "zod";

import { mobileProcedure } from "../../trpc";
import requireUser from "../../utils/requireUser";
import { supabaseServiceRole } from "../../utils/supabaseServiceRoleClient";
import createInvitation from "@servicegeek/db/queries/organization/createInvitation";
import createOrg from "@servicegeek/db/queries/user/createOrg";

const createOrganization = mobileProcedure
  .input(
    z.object({
      jwt: z.string(),
      companyName: z.string(),
      companySize: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const org = await createOrg(
      user.id,
      input.companyName,
      input.companySize,
      ""
    );
    try {
      const supportUser = `support+${org.org?.organization.publicId}@restoregeek.app`;
      const invitation = await createInvitation(user.id, supportUser);
      const result = await supabaseServiceRole.auth.admin.inviteUserByEmail(
        supportUser,
        {
          data: {
            orgId: invitation.orgId,
            inviteId: invitation.inviteId,
            isSupportUser: true,
            firstName: "ServiceGeek",
            lastName: "Support",
          },
        }
      );
    } catch (error) {
      console.error("Could not create support user", error);
    }
    return { org };
  });

export default createOrganization;
