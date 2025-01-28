import BlurImage from "@components/DesignSystem/BlurImage";
import useSupabaseImage from "@utils/hooks/useSupabaseImage";
import clsx from "clsx";

const SecureImage = ({ path }: { path?: string }) => {
  const supabaseUrl = useSupabaseImage(path);

  return (
    <div
      className={clsx(
        "group relative block size-[350px] overflow-hidden bg-gray-100"
      )}
    >
      {supabaseUrl && <BlurImage sizes='350px' src={supabaseUrl} alt='' />}
    </div>
  );
};
export default SecureImage;
