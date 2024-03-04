import { prisma } from "../../";

import { v4 as uuidv4 } from "uuid";

import createNotification from "../notification/createNotification";
import getUser from "../user/getUser";

import { getLatLng, getWeatherData } from "./getProjectForOrg";

const createProject = async (
  userId: string,
  props: { name: string; location: string }
) => {
  let now,
    end = 0;
  now = performance.now();

  const haloUser = await getUser(userId);
  const organizationId = haloUser?.org?.organization.id;
  const latLng = await getLatLng(props.location);

  const weatherData = await getWeatherData(latLng?.lat, latLng?.lng);
  if (!organizationId) return { failed: true, reason: "no-org" };
  const publicId = uuidv4();
  const project = await prisma.project.create({
    data: {
      organizationId,
      publicId,
      name: props.name,
      clientName: props.name,
      location: props.location,
      projectAssignees: {
        create: {
          userId,
        },
      },
      ...(latLng ? { lat: `${latLng.lat}`, lng: `${latLng.lng}` } : {}),
      ...(weatherData ? weatherData : {}),
    },
  });

  await createNotification({
    userId,
    title: "Project Created",
    content: `${
      haloUser.firstName + " " + haloUser.lastName
    } created a new project: "${props.name}" `,
    notify: "everyone",
    link: `/projects/${project.publicId}/overview`,
  });

  try {
    await fetch(
      `${process.env.QSTASH_PUBLISH_URL}${process.env.IDENTISHOT_PROPERTY_DATA_PROCESSING_URL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.QSTASH_AUTHORIZATION_TOKEN}`,
        },
        body: JSON.stringify({
          projectId: project.publicId,
        }),
      }
    );
  } catch (e) {
    console.error(e);
  }

  end = performance.now();
  console.log(`Project Creation took ${end - now} ms`);
  return { publicId };
};

export default createProject;
