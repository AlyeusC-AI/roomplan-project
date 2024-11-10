import { prisma } from "../../../";

import { parse } from "node-html-parser";
import getUser from "../../user/getUser";
import getProjectForOrg from "../../project/getProjectForOrg";

export const calculateGpp = async (
  temperature: string,
  relativeHumidity: string
) => {
  const temperatureMeasurement = "Fahrenheit";
  const pressure = 1;
  const pressureMeasurement = "atmosphere";
  const precision = 2;

  const response = await fetch("https://www.aqua-calc.com/calculate/humidity", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `temperature=${temperature}&temperature-measurement=${temperatureMeasurement}&relative-humidity=${relativeHumidity}&pressure=${pressure}&pressure-measurement=${pressureMeasurement}&precision=${precision}&calculate=Calculate`,
  });
  const text = await response.text();
  const root = parse(text);
  return root.querySelectorAll(".black_on_white.math>p>strong")[1].innerText;
};

export type ReadingData = {
  temperature?: string;
  humidity?: string;
  moistureContentWall?: string;
  moistureContentFloor?: string;
  date?: string;
};

const updateRoomReading = async (
  userId: string,
  projectPublicId: string,
  roomId: string,
  readingId: string,
  readingData: ReadingData
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

  const room = await prisma.room.findFirst({
    where: {
      projectId: project.id,
      publicId: roomId,
      isDeleted: false,
    },
  });

  if (!room) {
    console.error("No room");
    return null;
  }

  const reading = await prisma.roomReading.findFirst({
    where: {
      roomId: room.id,
      isDeleted: false,
      publicId: readingId,
    },
  });

  if (!reading) {
    console.error("No reading");
    return null;
  }

  const filteredData = Object.keys(readingData)
    .filter((key) => readingData[key as keyof typeof readingData])
    .reduce(
      (prev, cur) => ({
        ...prev,
        [cur]: readingData[cur as keyof typeof readingData],
      }),
      {}
    ) as ReadingData;

  const updatedRoomReading = await prisma.roomReading.update({
    where: {
      id: reading.id,
    },
    data: {
      ...filteredData,
    },
  });
  let gpp;
  if (updatedRoomReading.humidity && updatedRoomReading.temperature) {
    try {
      gpp = await calculateGpp(
        updatedRoomReading.temperature,
        updatedRoomReading.humidity
      );
      if (!isNaN(parseFloat(gpp))) {
        await prisma.roomReading.update({
          where: {
            id: reading.id,
          },
          data: {
            gpp: parseFloat(gpp).toFixed(2),
          },
        });
      }
    } catch (error) {
      console.log(error);
      await prisma.roomReading.update({
        where: {
          id: reading.id,
        },
        data: {
          gpp: "",
        },
      });
    }
  }
  return { gpp };
};

export default updateRoomReading;
