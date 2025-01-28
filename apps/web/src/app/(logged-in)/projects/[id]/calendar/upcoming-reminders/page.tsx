import { useState } from "react";
import CalenderUpcomingEvents from "../../../../calendar/components/upcoming-events";
import Modal from "@components/DesignSystem/Modal";
import AppContainer from "@components/layouts/AppContainer";
import MainContent from "@components/layouts/MainContent";
import TabNavigation from "@components/layouts/TabNavigation";
import ProjectNavigationContainer from "@components/Project/ProjectNavigationContainer";
import { Member } from "@components/Settings/Organization/types";
import getMembers from "@servicegeek/db/queries/organization/getMembers";
import getSubcriptionStatus from "@servicegeek/db/queries/organization/getSubscriptionStatus";
import { getInferenceList } from "@servicegeek/db/queries/project/getProjectDetections";
import getProjectForOrg from "@servicegeek/db/queries/project/getProjectForOrg";
import getUsersForProject, {
  Stakeholders,
} from "@servicegeek/db/queries/project/getUsersForProject";
import getOrgInfo, { OrgInfo } from "@lib/serverSidePropsUtils/getOrgInfo";
import getProjectInfo, {
  ProjectInfo,
} from "@lib/serverSidePropsUtils/getProjectInfo";
import getUserInfo, { UserInfo } from "@lib/serverSidePropsUtils/getUserInfo";
import getUserWithAuthStatus, {
  ORG_ACCESS_LEVEL,
} from "@lib/serverSidePropsUtils/getUserWithAuthStatus";
import { SubscriptionStatus } from "@servicegeek/db";
import useScheduler, { calenderEvents } from "@utils/hooks/useScheduler";
import type { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import { useSearchParams } from "next/navigation";
import { RecoilRoot } from "recoil";
import initRecoilAtoms from "@atoms/initRecoilAtoms";
import superjson from "superjson";

import CalenderEventModal from "../../../../calendar/components/event-modal";
import { User } from "@supabase/supabase-js";

interface EstimatePageProps {
  user: User;
  accessToken: string;
  error?: string;
  projectInfo: ProjectInfo;
  subscriptionStatus: SubscriptionStatus;
  orgInfo: OrgInfo;
  userInfo: UserInfo;
  stakeholders: Stakeholders[];
  teamMembers: Member[];
}

const tabs = (id: string) => [
  { name: "Calendar", href: `/projects/${id}/calendar` },
  {
    name: "Upcoming reminders",
    href: `/projects/${id}/calendar/upcoming-reminders`,
  },
];

const CalenderPage: NextPage<EstimatePageProps> = ({
  projectInfo,
  userInfo,
  orgInfo,
  stakeholders,
  teamMembers,
  subscriptionStatus,
}) => {
  const router = useSearchParams();
  const id = router?.get("id");
  const {
    calenderEvents,
    createCalenderEvent,
    deleteCalenderEvent,
    updateCalenderEvent,
  } = useScheduler({
    projectId: id as string,
  });
  const [timeStamp, setTimeStamp] = useState<Date>();
  const [isCreateCalenderEventModalOpen, setIsCreateCalenderEventModalOpen] =
    useState(false);
  const [existingCalenderEventSelected, setExistingCalenderEventSelected] =
    useState<calenderEvents>();

  const handleEditUpcomingEvent = (publicId: string) => {
    setExistingCalenderEventSelected(
      calenderEvents.find((event) => event.publicId === publicId)
    );
    setIsCreateCalenderEventModalOpen(true);
  };

  return (
    <RecoilRoot
      initializeState={initRecoilAtoms({
        userInfo,
        orgInfo,
        stakeholders,
        teamMembers,
        projectInfo,
      })}
    >
      <AppContainer
        renderSecondaryNavigation={() => <ProjectNavigationContainer />}
      >
        <Head>
          <title>ServiceGeek - Estimate</title>
          <meta name='description' content='Project Estimate and Details' />
          <link rel='icon' href='/favicon.ico' />
        </Head>
        <TabNavigation tabs={tabs} />
        <MainContent>
          <div className='lg:flex lg:h-full lg:flex-col'>
            <CalenderUpcomingEvents
              calenderEvents={calenderEvents}
              deleteCalenderEvent={deleteCalenderEvent}
              handleEditUpcomingEvent={handleEditUpcomingEvent}
              projectId={id as string}
            />
            <Modal
              open={isCreateCalenderEventModalOpen}
              setOpen={setIsCreateCalenderEventModalOpen}
              className='sm:max-w-3xl'
            >
              {() => (
                <CalenderEventModal
                  date={timeStamp}
                  teamMembers={teamMembers}
                  projectId={id as string}
                  projectInfo={projectInfo}
                  createEvent={createCalenderEvent}
                  editEvent={updateCalenderEvent}
                  setOpen={setIsCreateCalenderEventModalOpen}
                  existingCalenderEventSelected={existingCalenderEventSelected}
                  stakeholders={stakeholders}
                ></CalenderEventModal>
              )}
            </Modal>
          </div>
        </MainContent>
      </AppContainer>
    </RecoilRoot>
  );
};

export default CalenderPage;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const { user, orgAccessLevel } = await getUserWithAuthStatus(ctx);

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

    const inferenceList = await getInferenceList(ctx.query.id, orgId);
    const inferences = inferenceList?.rooms || [];
    const subscriptionStatus = await getSubcriptionStatus(user.id);
    const stakeholders = await getUsersForProject(user.id, project.publicId);
    const members = await getMembers(orgId);
    const serializedMembers = superjson.serialize(members);

    return {
      props: {
        inferences,
        userInfo: getUserInfo(user),
        projectInfo: getProjectInfo(project),
        orgInfo: getOrgInfo(user),
        subscriptionStatus,
        stakeholders,
        teamMembers: serializedMembers.json,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      props: {},
    };
  }
};
