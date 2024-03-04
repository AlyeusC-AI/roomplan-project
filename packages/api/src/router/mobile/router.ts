import { router } from "../../trpc";
import createOrganization from "./createOrganization";
import createNewProject from "./createNewProject";

import getDashboardData from "./getDashboardData";
import getProjectOverviewData from "./getProjectOverviewData";
import updateProjectInformation from "./updateProjectName";
import removeProjectAssignee from "./removeProjectAssignee";
import addProjectAssignee from "./addProjectAssignee";
import getRoomData from "./getRoomData";
import createNewRoom from "./createNewRoom";
import createNewRoomNote from "./createNewRoomNote";
import deleteRoomNote from "./deleteRoomNote";
import updateRoomNote from "./updateRoomNote";
import createNewRoomReading from "./createNewRoomReading";
import deleteRoomReading from "./deleteRoomReading";
import updateRoomReading from "./updateRoomReading";
import createNewGenericRoomReading from "./createNewGenericRoomReading";
import updateGenericRoomReading from "./updateGenericRoomReading";
import getProjectImages from "./getProjectImages";
import editProjectDetails from "./editProjectDetails";
import getProjectNotes from "../projects/getProjectNotes";
import createProjectNote from "../projects/createProjectNote";
import addImageToProject from "./addImageToProject";

export const mobileRouter = router({
  updateProjectInformation,
  getProjectOverviewData,
  getDashboardData,
  createOrganization,
  createNewProject,
  removeProjectAssignee,
  addProjectAssignee,
  getRoomData,
  createNewRoom,
  createNewRoomNote,
  deleteRoomNote,
  updateRoomNote,
  createNewRoomReading,
  deleteRoomReading,
  updateRoomReading,
  createNewGenericRoomReading,
  updateGenericRoomReading,
  getProjectImages,
  editProjectDetails,
  getProjectNotes,
  createProjectNote,
  addImageToProject,
});
