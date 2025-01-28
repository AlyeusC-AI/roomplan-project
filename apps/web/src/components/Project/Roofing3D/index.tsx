import { ScaleLoader } from "react-spinners";
import dynamic from "next/dynamic";

const ResponsiveWrapper = dynamic(() => import("./ResponsiveWrapper"), {
  ssr: false,
  loading: () => (
    <div className='flex size-full items-center justify-center'>
      <ScaleLoader color='#2563eb' />
    </div>
  ),
});

export default function Roofing({ accessToken }: { accessToken: string }) {
  return <ResponsiveWrapper accessToken={accessToken} />;
}
