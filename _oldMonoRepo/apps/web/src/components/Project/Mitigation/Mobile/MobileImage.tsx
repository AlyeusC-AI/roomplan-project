import BlurImage from "@components/DesignSystem/BlurImage";
import useSupabaseImage from "@utils/hooks/useSupabaseImage";
import clsx from "clsx";
import { format, formatDistance } from "date-fns";

const MobileImage = ({
  imageURL,
  createdAt,
}: {
  imageURL: string;
  createdAt: string;
}) => {
  const supabaseUrl = useSupabaseImage(imageURL);

  return (
    <div className='flex flex-col'>
      <div
        className={clsx(
          "group relative block size-[200px] overflow-hidden rounded-lg"
        )}
      >
        {supabaseUrl && <BlurImage sizes='200px' src={supabaseUrl} alt='' />}
      </div>
      <div className='text-sm font-semibold text-slate-500'>
        {format(new Date(createdAt), "eee, MMM d, yyyy 'at' K:mm b")}
      </div>
      <div className='text-sm text-slate-500'>
        {formatDistance(new Date(createdAt), Date.now(), { addSuffix: true })}
      </div>
    </div>
  );
};

export default MobileImage;
