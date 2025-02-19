import { prisma } from "../..";

const getAllWeatherReportItemsByProject = async (projectId: number) => {
  return prisma.weatherReportItem.findMany({
    where: {
      projectId: projectId,
      isDeleted: false,
    },
    select: {
      createdAt: true,
      date: true,
      time: true,
      f_scale: true,
      speed: true,
      size: true,
      location: true,
      county: true,
      state: true,
      lat: true,
      lon: true,
      comments: true,
      id: true,
    },
    orderBy: {
      date: "desc",
    },
  });
};

export default getAllWeatherReportItemsByProject;
