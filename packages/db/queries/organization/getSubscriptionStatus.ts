import { prisma } from "../../";

import { SubscriptionStatus } from "../../";
import { differenceInBusinessDays, differenceInDays } from "date-fns";

import getUser from "../user/getUser";

export const getSubcriptionStatusFromOrganizationId = async (
  organizationId: number,
  createdAt: Date
) => {
  const imageCount = await prisma.image.count({
    where: {
      organizationId,
    },
  });

  const subscription = await prisma.subscriptions.findFirst({
    where: {
      organizationId,
    },
  });

  if (subscription && subscription?.status === SubscriptionStatus.canceled) {
    if (
      differenceInDays(subscription.currentPeriodStart!, new Date(Date.now())) >
      31
    ) {
      return SubscriptionStatus.past_due;
    } else {
      return SubscriptionStatus.active;
    }
  }
  if (!subscription || subscription.status != SubscriptionStatus.active) {
    if (imageCount >= 500) {
      return SubscriptionStatus.past_due;
    }

    if (differenceInBusinessDays(createdAt!, Date.now()) > 30) {
      return SubscriptionStatus.past_due;
    }
    return SubscriptionStatus.trialing;
  }
  return subscription.status;
};

const getSubcriptionStatus = async (userId: string) => {
  const haloUser = await getUser(userId);
  const organizationId = haloUser?.org?.organization.id;
  console.log(organizationId);
  if (!organizationId) return SubscriptionStatus.incomplete;
  return getSubcriptionStatusFromOrganizationId(
    organizationId,
    haloUser.org?.organization.createdAt!
  );
};

export default getSubcriptionStatus;
