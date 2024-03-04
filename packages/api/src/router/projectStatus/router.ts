import { router } from "../../trpc";

import associateProjectStatus from "./associateProjectStatus";
import createProjectStatus from "./createProjectStatus";
import deleteProjectStatus from "./deleteProjectStatus";
import editProjectStatus from "./editProjectStatus";
import getAllProjectStatuses from "./getAllProjectStatuses";
import reorderProjectStatuses from "./reorderProjectStatus";
import updateProjectStatusValue from "./updateProjectStatusValue";

export const projectStatusRouter = router({
  createProjectStatus,
  updateProjectStatusValue,
  deleteProjectStatus,
  associateProjectStatus,
  getAllProjectStatuses,
  editProjectStatus,
  reorderProjectStatuses,
});
