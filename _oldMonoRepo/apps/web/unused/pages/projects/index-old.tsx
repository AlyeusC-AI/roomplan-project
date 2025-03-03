import initRecoilAtoms from "@atoms/initRecoilAtoms";
import CheckoutSuccessBanner from "@components/Banners/CheckoutSuccessBanner";
import TrailEndedBanner from "@components/Banners/TrailEndedBanner";
import AppContainer from "@components/layouts/AppContainer";
import MainContent from "@components/layouts/MainContent";
import SetupAccountFromInvite from "@components/Onboarding/SetupAccountFromInvite";
import OrgCreation from "@components/Projects/OrgCreation";
import ProjectList from "@components/Projects/ProjectList";
import { Member } from "@components/Settings/Organization/types";
import getProjectsData from "unused/server-side-fetching/pages/getProjectsData";
import { getQueueTime } from "@lib/qstash/queueInference";
import getOrgInfo, { OrgInfo } from "@lib/serverSidePropsUtils/getOrgInfo";
import getUserInfo, { UserInfo } from "@lib/serverSidePropsUtils/getUserInfo";
import { ORG_ACCESS_LEVEL } from "@lib/serverSidePropsUtils/getUserWithAuthStatus";
import { supabaseServiceRole } from "@lib/supabase/admin";
import {
  DashboardViews,
  OrganizationInvitation,
  SubscriptionStatus,
} from "@servicegeek/db";
import getInvitation from "@servicegeek/db/queries/invitations/getInvitation";
import getMembers from "@servicegeek/db/queries/organization/getMembers";
import getSubcriptionStatus from "@servicegeek/db/queries/organization/getSubscriptionStatus";
import { ProjectType } from "@servicegeek/db/queries/project/listProjects";
import clsx from "clsx";
import type { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import { useState } from "react";
import { RecoilRoot } from "recoil";
import superjson from "superjson";

import { PresignedUrlMap } from "./[id]/photos";
import { User } from "@supabase/supabase-js";

export interface InviteStatus {
  accepted: boolean;
  organizationName: string;
  inviteId: string;
}

export interface ProjectStats {
  openedProjects: { cur: number; prev: number };
  closedProjects: { cur: number; prev: number };
}
interface ProjectPageProps {
  error?: string;
  user: User;
  orgId?: string | null;
  projects?: ProjectType[] | null;
  subscriptionStatus: SubscriptionStatus;
  inviteStatus: InviteStatus | null;
  userInfo: UserInfo;
  orgInfo: OrgInfo;
  urlMap: PresignedUrlMap;
  totalProjects: number;
  teamMembers?: Member[];
  isCheckoutSuccess: boolean;
}

const ProjectPage: NextPage<ProjectPageProps> = ({
  // user,
  orgId,
  projects,
  subscriptionStatus,
  inviteStatus,
  userInfo,
  orgInfo,
  urlMap,
  totalProjects,
  teamMembers,
  isCheckoutSuccess,
}) => {
  const [showAcceptInviteModal] = useState(
    inviteStatus ? !inviteStatus.accepted : false
  );
  const router = useRouter();
  console.log(isCheckoutSuccess, router.query.alert);

  return (
    <RecoilRoot
      initializeState={initRecoilAtoms({
        userInfo,
        orgInfo,
        urlMap,
        projects: projects || [],
        teamMembers,
      })}
    >
      <AppContainer
        subscriptionStatus={subscriptionStatus}
        overflow={
          userInfo && userInfo.savedDashboardView === DashboardViews.boardView
            ? false
            : true
        }
      >
        <Head>
          <title>ServiceGeek - Dashboard</title>
          <meta
            name='description'
            content='Access projects that you have integrated with ServiceGeek'
          />
          <link rel='icon' href='/favicon.ico' />
        </Head>
        <Script id='11015712809/KQdPCLiI94AYEKng2YQp'>
          {`gtag('event', 'conversion', {'send_to': 'AW-11015712809/KQdPCLiI94AYEKng2YQp'});`}
        </Script>
        <MainContent
          className={clsx(
            !(
              showAcceptInviteModal &&
              !userInfo.isSupportUser &&
              inviteStatus
            ) &&
              !orgId &&
              "h-full"
          )}
        >
          <>
            {showAcceptInviteModal &&
            !userInfo.isSupportUser &&
            inviteStatus ? (
              <SetupAccountFromInvite inviteStatus={inviteStatus} />
            ) : (
              <>
                {router.query.alert === "checkout_success" && (
                  <CheckoutSuccessBanner />
                )}
                {subscriptionStatus === SubscriptionStatus.past_due && (
                  <TrailEndedBanner />
                )}
                {orgId ? (
                  <ProjectList
                    viewPreference={userInfo.savedDashboardView}
                    totalProjects={totalProjects}
                  />
                ) : (
                  <OrgCreation />
                )}
              </>
            )}
          </>
        </MainContent>
      </AppContainer>
    </RecoilRoot>
  );
};

export default ProjectPage;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const { user, orgAccessLevel } = await getProjectsData(ctx);

    getQueueTime();

    if (!user) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    if (orgAccessLevel === ORG_ACCESS_LEVEL.REMOVED) {
      return {
        redirect: {
          destination: "/access-revoked",
          permanent: false,
        },
      };
    }

    const publicOrgId = user.org?.organization.publicId || null;
    let projects = null;
    let totalProjects = 0;
    if (user.org?.organization.id) {
      const orgWithProjects = user.org.organization.projects;
      totalProjects = user.org.organization._count.projects;
      projects = superjson.serialize(orgWithProjects)
        .json as unknown as ProjectType[];
    }
    const subscriptionStatus = await getSubcriptionStatus(user.id);

    let inviteStatus: InviteStatus | null = null;
    let invitation: OrganizationInvitation | null = null;
    if (user.inviteId) {
      invitation = await getInvitation(user.inviteId);
      if (invitation) {
        inviteStatus = {
          accepted: invitation?.isAccepted,
          organizationName: user.org!.organization.name,
          inviteId: invitation.invitationId,
        };
      }
    }

    const imageKeys = projects?.reduce<string[]>((prev, cur) => {
      const images = cur.images.reduce<string[]>(
        (p, c) => [decodeURIComponent(c.key), ...p],
        []
      );
      return [...images, ...prev];
    }, []) as string[];

    const { data, error } = await supabaseServiceRole.storage
      .from("project-images")
      .createSignedUrls(imageKeys, 1800);

    const { data: mediaData } = await supabaseServiceRole.storage
      .from("media")
      .createSignedUrls(imageKeys, 1800);
    const arr =
      data && mediaData
        ? [...data, ...mediaData]
        : data
          ? data
          : mediaData
            ? mediaData
            : [];
    const urlMap = arr.reduce<PresignedUrlMap>((p, c) => {
      if (c.error) return p;
      if (!c.path) return p;
      return {
        [c.path]: c.signedUrl,
        ...p,
      };
    }, {});

    const members = !user.org
      ? []
      : ((await getMembers(user.org.organization.id)) as unknown as Member[]);
    const serializedMembers = superjson.serialize(members);

    return {
      props: {
        orgId: publicOrgId,
        totalProjects,
        teamMembers: serializedMembers.json as unknown as Member[],
        projects,
        subscriptionStatus,
        inviteStatus,
        userInfo: getUserInfo(user),
        orgInfo: getOrgInfo(user),
        urlMap,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      props: {},
    };
  }
};
