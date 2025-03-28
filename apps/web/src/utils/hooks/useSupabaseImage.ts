import getProjectImageUrl from "@utils/getProjectImageUrl";
import { urlMapStore } from "@atoms/url-map";

const useSupabaseImage = (path: string | null) => {
  if (path?.startsWith("http")) return path;
  const presignedUrlMap = urlMapStore((state) => state.urlMap);
  if (!path) return null;
  if (!presignedUrlMap[decodeURIComponent(path)])
    return getProjectImageUrl(path);
  return presignedUrlMap[decodeURIComponent(path)];
};

export default useSupabaseImage;
