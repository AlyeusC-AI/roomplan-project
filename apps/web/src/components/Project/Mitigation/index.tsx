import { ScaleLoader } from "react-spinners";
import { GroupByViews, PhotoViews } from "@servicegeek/db";
import dynamic from "next/dynamic";

const ResponsiveWrapper = dynamic(() => import("./ResponsiveWrapper"), {
  ssr: false,
  loading: () => (
    <div className='flex size-full items-center justify-center'>
      <ScaleLoader color='#2563eb' />
    </div>
  ),
});

export default function Mitigation({
  initialGroupView,
  initialPhotoView,
}: {
  initialGroupView: GroupByViews;
  initialPhotoView: PhotoViews;
}) {
  return (
    <ResponsiveWrapper
      initialGroupView={initialGroupView}
      initialPhotoView={initialPhotoView}
    />
  );
}
