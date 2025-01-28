"use client";

import TrailEndedBanner from "@components/Banners/TrailEndedBanner";
import AppContainer from "@components/layouts/AppContainer";
import MainContent from "@components/layouts/MainContent";
import PerformanceStats from "unused/PerformanceStats";
import OrgCreation from "@components/Projects/OrgCreation";
import { SubscriptionStatus } from "@servicegeek/db";
import { useEffect } from "react";
import { userInfoStore } from "@atoms/user-info";
import { orgStore } from "@atoms/organization";
import { subscriptionStore } from "@atoms/subscription-status";

export default function PerformancePage({
  orgId,
  subscriptionStatus,
  userInfo,
  orgInfo,
  projectStats,
}: LoggedInUserInfo & { projectStats: ProjectStats }) {
  useEffect(() => {
    userInfoStore.getState().setUser(userInfo);
    orgStore.getState().setOrg(orgInfo);
    subscriptionStore.getState().setSubscriptionStatus(subscriptionStatus);
  });

  return (
    // <AppContainer>
    //   <MainContent>
    <PerformanceStats projectStats={projectStats} />
    //   </MainContent>
    // </AppContainer>
  );
}
