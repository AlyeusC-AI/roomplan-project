import getAllOrganizationEquipment from "@servicegeek/db/queries/equipment/getAllOrganizationEquipment";

import { protectedProcedure } from "../../trpc";
import requireUser from "../../utils/requireUser";

const getAll = protectedProcedure.query(async ({ ctx }) => {
  const user = await requireUser(ctx.user?.id);
  return getAllOrganizationEquipment(user?.org?.organizationId as number);
});
export default getAll;
