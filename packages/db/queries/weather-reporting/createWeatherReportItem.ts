import { prisma } from "../../";
import getProjectForOrg from "../project/getProjectForOrg";
import getUser from "../user/getUser";

const createWeatherReportItem = async (
  userId: string,
  projectPublicId: string,
  date: Date,
  time: string,
  f_scale: string,
  speed: string,
  size: string,
  location: string,
  county: string,
  state: string,
  lat: string,
  lon: string,
  comments: string
) => {
  const servicegeekUser = await getUser(userId);
  const organizationId = servicegeekUser?.org?.organization.id;
  if (!organizationId) {
    console.error("No org");
    return null;
  }

  const project = await getProjectForOrg(projectPublicId, organizationId);
  if (!project) {
    console.error("No project");
    return null;
  }

  return prisma.weatherReportItem.create({
    data: {
      projectId: project.id,
      date: date,
      time: time,
      f_scale: f_scale,
      speed: speed,
      size: size,
      location: location,
      county: county,
      state: state,
      lat: lat,
      lon: lon,
      comments: comments,
    },
    select: {
      id: true,
    },
  });
};

export default createWeatherReportItem;
