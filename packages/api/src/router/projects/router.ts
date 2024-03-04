import { router } from "../../trpc";

import createNewProject from "./createNewProject";
import createProjectNote from "./createProjectNote";
import getBoardProjects from "./getBoardProjects";
import getProjectNotes from "./getProjectNotes";
import getProjects from "./getProjects";

export const projectsRouter = router({
  getProjects,
  createNewProject,
  createProjectNote,
  getProjectNotes,
  getBoardProjects,
});
