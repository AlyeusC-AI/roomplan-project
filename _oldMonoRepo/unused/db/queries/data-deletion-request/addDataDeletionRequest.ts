import { prisma } from "../..";

const addDataDeletionRequest = async (fullName: string, email: string) => {
  await prisma.dataDeletionRequest.create({
    data: {
      fullName,
      email,
    },
  });
};

export default addDataDeletionRequest;
