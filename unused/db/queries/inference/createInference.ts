import { prisma } from "../..";

import { v4 as uuidv4 } from "uuid";

const createInference = async (publicId: string, roomId: number) => {
  const image = await prisma.image.findFirst({
    where: {
      publicId,
    },
  });

  if (!image) return null;

  const inferencePublicId = uuidv4();

  return await prisma.inference.create({
    data: {
      publicId: inferencePublicId,
      imageId: image.id,
      imageKey: image.key,
      projectId: image.projectId,
      roomId,
    },
  });
};

export default createInference;
