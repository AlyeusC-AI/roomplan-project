import { prisma } from "../..";

const updateUser = async ({
  id,
  firstName,
  lastName,
  phone,
}: {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}) => {
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(phone ? { phone } : {}),
    },
  });
  return user;
};

export default updateUser;
