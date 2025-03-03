import { prisma } from "../..";

import { Project } from "../..";

import getUser from "../user/getUser";

import { getLatLng, getWeatherData } from "./getProjectForOrg";

const updateTempAndHumidity = async (project: Project) => {
  try {
    let lat = project.lat;
    let lng = project.lng;
    if (!lat || !lng) {
      const latLng = await getLatLng(project.location);
      if (latLng) {
        lat = latLng.lat;
        lng = latLng.lng;
      }
    }
    const weatherData = await getWeatherData(lat, lng);
    if (!weatherData) return {};
    await prisma.project.update({
      where: {
        publicId: project.publicId,
      },
      data: {
        ...weatherData,
        lat: `${lat}`,
        lng: `${lng}`,
      },
    });
    return weatherData;
  } catch (error) {
    console.error(error);
    return {};
  }
};
const updateWeatherForProject = async (userId: string, publicId: string) => {
  const haloUser = await getUser(userId);
  const organizationId = haloUser?.org?.organization.id;
  if (!organizationId) {
    console.error("No organization Id");
    return null;
  }

  let project = await prisma.project.findFirst({
    where: { publicId, organizationId },
  });

  if (project) {
    const { lastTimeWeatherFetched } = project;
    return await updateTempAndHumidity(project);
  }
  return {};
};

export default updateWeatherForProject;
