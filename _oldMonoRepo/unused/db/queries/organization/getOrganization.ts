import { prisma } from "../..";

const getOrganization = async (orgPublicId: string) => {
  // Check if user is an admin
  // returns true if user is an admin else false;
  const organization = await prisma.organization.findUnique({
    where: {
      publicId: orgPublicId,
    },
  });
  if (organization?.isDeleted) return null;
  return organization;
};

export default getOrganization;
