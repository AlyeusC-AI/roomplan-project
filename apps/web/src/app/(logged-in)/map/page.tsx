import { getLoggedInUserInfo } from '@lib/server-side-fetching/get-logged-in-user-info'
import ProjectMapView from './main'
import { Metadata } from 'next'

export const metdata: Metadata = {
  title: 'Map',
}

export default async function Component() {
  const props = await getLoggedInUserInfo(false, false, false)

  console.log('props', props)

  return <ProjectMapView {...props} />
}
