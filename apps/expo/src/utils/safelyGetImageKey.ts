import { RouterOutputs } from "@servicegeek/api";

const safelyGetImageUrl = (
  urlMap: RouterOutputs["mobile"]["getDashboardData"]["urlMap"],
  path: string | undefined | null
) => {
  if (!path) return "";
  if (!urlMap) return "";
  return urlMap[decodeURIComponent(path)] || "";
};
export default safelyGetImageUrl;
