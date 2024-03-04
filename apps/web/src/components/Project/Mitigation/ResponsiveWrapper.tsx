import { useMediaQuery } from 'react-responsive'
import { GroupByViews, PhotoViews } from '@restorationx/db'
import { useRouter } from 'next/router'

import MitigationTable from './MitigationTable'
import MitigationToolbar from './MitigationToolbar'
import Mobile from './Mobile'

const ResponsiveWrapper = ({
  accessToken,
  initialGroupView,
  initialPhotoView,
}: {
  accessToken: string
  initialGroupView: GroupByViews
  initialPhotoView: PhotoViews
}) => {
  const router = useRouter()
  let id = router.query.id || ''
  if (Array.isArray(id) || !id) {
    id = ''
  }
  const isMobile = useMediaQuery({ maxWidth: 600 })

  return (
    <>
      {isMobile ? (
        <Mobile accessToken={accessToken} />
      ) : (
        <>
          <MitigationToolbar accessToken={accessToken} />
          <MitigationTable
            initialGroupView={initialGroupView}
            initialPhotoView={initialPhotoView}
          />
        </>
      )}
    </>
  )
}

export default ResponsiveWrapper
