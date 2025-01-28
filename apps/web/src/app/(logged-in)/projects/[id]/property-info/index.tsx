import TrailEndedBanner from "@components/Banners/TrailEndedBanner";
import AppContainer from "@components/layouts/AppContainer";
import MainContent from "@components/layouts/MainContent";
import TabNavigation from "@components/layouts/TabNavigation";
import ProjectNavigationContainer from "@components/Project/ProjectNavigationContainer";
import PropertyInfo from "@components/Project/PropertyInfo";
import getSubcriptionStatus from "@servicegeek/db/queries/organization/getSubscriptionStatus";
import getProjectForOrg from "@servicegeek/db/queries/project/getProjectForOrg";
import getPropertyData from "@servicegeek/db/queries/project/getPropertyData";
import getOrgInfo, { OrgInfo } from "@lib/serverSidePropsUtils/getOrgInfo";
import getProjectInfo, {
  ProjectInfo,
} from "@lib/serverSidePropsUtils/getProjectInfo";
import getPropertyDataInfo from "@lib/serverSidePropsUtils/getPropertyDataInfo";
import getUserInfo, { UserInfo } from "@lib/serverSidePropsUtils/getUserInfo";
import getUserWithAuthStatus, {
  ORG_ACCESS_LEVEL,
} from "@lib/serverSidePropsUtils/getUserWithAuthStatus";
import { SubscriptionStatus } from "@servicegeek/db";
import type { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import { RecoilRoot } from "recoil";
import initRecoilAtoms from "@atoms/initRecoilAtoms";
import { PropertyDataInfo } from "@atoms/property-data";
import { User } from "@supabase/supabase-js";

interface PropertyInfoPageProps {
  user: User;
  userInfo: UserInfo;
  error?: string;
  projectInfo: ProjectInfo;
  subscriptionStatus: SubscriptionStatus;
  propertyDataInfo: PropertyDataInfo;
  orgInfo: OrgInfo;
}

const tabs = (id: string) => [
  { name: "Property Information", href: `/projects/${id}/property-info` },
];

const PropertyInfoPage: NextPage<PropertyInfoPageProps> = ({
  userInfo,
  projectInfo,
  subscriptionStatus,
  propertyDataInfo,
  orgInfo,
}) => {
  return (
    <RecoilRoot
      initializeState={initRecoilAtoms({
        projectInfo,
        userInfo,
        propertyDataInfo,
        orgInfo,
      })}
    >
      <AppContainer
        hideParentNav
        subscriptionStatus={subscriptionStatus}
        renderSecondaryNavigation={() => <ProjectNavigationContainer />}
      >
        <Head>
          <title>ServiceGeek - Property Information</title>
          <meta name='description' content='Property Information' />
          <link rel='icon' href='/favicon.ico' />
        </Head>

        {subscriptionStatus === SubscriptionStatus.past_due && (
          <TrailEndedBanner />
        )}
        <TabNavigation tabs={tabs} />
        <MainContent>
          <PropertyInfo />
        </MainContent>
      </AppContainer>
    </RecoilRoot>
  );
};

export default PropertyInfoPage;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const { user, orgAccessLevel, accessToken } =
      await getUserWithAuthStatus(ctx);

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
    const orgId = user.org?.organization.id || null;
    if (!orgId || !ctx.query.id || Array.isArray(ctx.query.id)) {
      return {
        redirect: {
          destination: "/projects",
          permanent: false,
        },
      };
    }
    const project = await getProjectForOrg(ctx.query.id, orgId);
    if (!project) {
      return {
        redirect: {
          destination: "/projects",
          permanent: false,
        },
      };
    }

    const subscriptionStatus = await getSubcriptionStatus(user.id);
    const propertyData = await getPropertyData(project.id);

    return {
      props: {
        userInfo: getUserInfo(user),
        projectInfo: getProjectInfo(project),
        propertyDataInfo: getPropertyDataInfo(propertyData),
        subscriptionStatus,
        orgInfo: getOrgInfo(user),
      },
    };
  } catch (e) {
    console.error(e);
    return {
      props: {},
    };
  }
};
