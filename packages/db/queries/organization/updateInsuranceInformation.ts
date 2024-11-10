import { AccessLevel, prisma } from "../../";

import getProjectForOrg from "../project/getProjectForOrg";
import getUser from "../user/getUser";

const updateInsuranceInformation = async (
  userId: string,
  projectPublicId: string,
  insuranceCompanyName: string,
  adjusterName: string,
  adjusterPhoneNumber: string,
  adjusterEmail: string,
  insuranceClaimId: string,
  lossType: string,
  catCode: number
) => {
  const servicegeekUser = await getUser(userId);
  const organizationId = servicegeekUser?.org?.organization.id;
  if (!organizationId) return { failed: true, reason: "no-org" };

  const project = await getProjectForOrg(projectPublicId, organizationId);
  if (!project) {
    return { failed: true, reason: "no-project" };
  }

  await prisma.project.update({
    where: {
      id: project.id,
    },
    data: {
      insuranceCompanyName,
      adjusterName,
      adjusterPhoneNumber,
      adjusterEmail,
      insuranceClaimId,
      lossType,
      catCode,
    },
  });
  return { failed: false, reason: null };
};

export default updateInsuranceInformation;
