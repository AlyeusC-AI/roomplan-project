import getFilteredInferenceList from "@restorationx/db/queries/project/getFilteredInferenceList";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";
import {
  OnlySelectedFilterQueryParam,
  RoomsFilterQueryParam,
  SortDirectionQueryParam,
} from "../../utils/types";

const getAll = protectedProcedure
  .input(
    z.object({
      projectPublicId: z.string().uuid(),
      rooms: RoomsFilterQueryParam,
      onlySelected: OnlySelectedFilterQueryParam,
      sortDirection: SortDirectionQueryParam,
    })
  )
  .query(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    await requireProject(
      input.projectPublicId,
      user.org?.organizationId as number
    );
    return getFilteredInferenceList(
      input.projectPublicId,
      user.org?.organizationId as number,
      input.rooms,
      input.onlySelected,
      input.sortDirection
    );
  });
export default getAll;
