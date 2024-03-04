import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";
import { supabaseServiceRole } from "../../utils/supabaseServiceRoleClient";

const getSignedUrl = protectedProcedure
  .input(z.object({ projectId: z.string().uuid(), name: z.string().min(1) }))
  .query(async ({ ctx, input }) => {
    const user = await requireUser(ctx.user?.id);
    await requireProject(input.projectId, user.org?.organizationId as number);
    const file = `${user.org?.organization.publicId}/${input.projectId}/${input.name}`;
    const { data, error } = await supabaseServiceRole.storage
      .from("user-files")
      .createSignedUrl(file, 1800);

    if (error) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "An unexpected error occurred, please try again later.",
        // optional: pass the original error to retain stack trace
        cause: "Could not create signed URL",
      });
    }
    return data;
  });
export default getSignedUrl;
