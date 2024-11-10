import { ScaleLoader } from 'react-spinners'
import { GroupByViews, PhotoViews } from '@servicegeek/db'
import dynamic from 'next/dynamic'

const ResponsiveWrapper = dynamic(() => import('./ResponsiveWrapper'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <ScaleLoader color="#2563eb" />
    </div>
  ),
})

export default function Mitigation({
  accessToken,
  initialGroupView,
  initialPhotoView,
}: {
  accessToken: string
  initialGroupView: GroupByViews
  initialPhotoView: PhotoViews
}) {
  return (
    <ResponsiveWrapper
      accessToken={accessToken}
      initialGroupView={initialGroupView}
      initialPhotoView={initialPhotoView}
    />
  )
}
