import { prisma } from "../../";

const addToWaitlist = async (email: string) => {
  await prisma.waitList.create({
    data: {
      email,
    },
  });
};

export default addToWaitlist;
