import { Header } from '@components/LandingPage/Header'
import MainContent from '@components/layouts/MainContent'
import SecureView from '@components/SecureView'
import getProjectIdFromAccessLink from '@restorationx/db/queries/photo-access-link/getPhotoAccessLink'
import {
  getInferenceList,
  RoomData,
} from '@restorationx/db/queries/project/getProjectDetections'
import { prisma } from '@restorationx/db'

import getProjectInfo, {
  ProjectInfo,
} from '@lib/serverSidePropsUtils/getProjectInfo'
import getPresignedUrlMapFromInferenceList from '@lib/supabase/getPresignedUrlMapFromInferenceList'
import type { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'
import { RecoilRoot } from 'recoil'
import initRecoilAtoms from '@atoms/initRecoilAtoms'

import { PresignedUrlMap } from '../projects/[id]/photos'

interface SecureViewPageProps {
  noAccess: boolean
  inferences?: RoomData[]
  urlMap: PresignedUrlMap
  projectInfo: ProjectInfo
}

const SecureViewPage: NextPage<SecureViewPageProps> = ({
  noAccess,
  inferences,
  urlMap,
  projectInfo,
}) => {
  return (
    <RecoilRoot
      initializeState={initRecoilAtoms({
        inferences,
        urlMap,
        projectInfo,
      })}
    >
      <Head>
        <title>RestorationX - Estimate</title>
        <meta name="description" content="Project Estimate and Details" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MainContent>
          <SecureView noAccess={noAccess} />
        </MainContent>
      </div>
    </RecoilRoot>
  )
}

export default SecureViewPage

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const linkId = ctx.query.linkId

    if (!linkId || Array.isArray(linkId)) {
      console.log('No link Id')
      return {
        props: {
          noAccess: true,
        },
      }
    }
    console.log(linkId)
    const projectId = await getProjectIdFromAccessLink(linkId)

    if (!projectId) {
      console.log('No project Id')
      return {
        props: {
          noAccess: true,
        },
      }
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
      },
    })

    if (!project) {
      console.log('No project')

      return {
        props: {
          noAccess: true,
        },
      }
    }

    const inferenceList = await getInferenceList(
      project?.publicId,
      project?.organizationId
    )

    const urlMap = !inferenceList
      ? {}
      : // @ts-expect-error it's ok
        await getPresignedUrlMapFromInferenceList(inferenceList)

    const inferences = inferenceList?.rooms || []
    return {
      props: {
        noAccess: false,
        inferences,
        urlMap,
        projectInfo: getProjectInfo(project),
      },
    }
  } catch (e) {
    console.error(e)
    return {
      props: {},
    }
  }
}
