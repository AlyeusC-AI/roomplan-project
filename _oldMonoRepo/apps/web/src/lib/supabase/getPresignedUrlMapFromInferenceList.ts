import { supabaseServiceRole } from "./admin";

const getPresignedUrlMapFromInferenceList = async (inferenceList: {
  rooms: RoomWithReadings[];
}) => {
  const imageKeys = inferenceList?.rooms.reduce<string[]>((prev, cur) => {
    const keys = cur.Inference.reduce<string[]>((p, c) => {
      if (!c.imageKey) return p;
      return [decodeURIComponent(c.imageKey), ...p];
    }, []);
    return [...keys, ...prev];
  }, []) as string[];

  const { data } = await supabaseServiceRole.storage
    .from("project-images")
    .createSignedUrls(imageKeys, 1800);

  const { data: mediaData } = await supabaseServiceRole.storage
    .from("media")
    .createSignedUrls(imageKeys, 1800);
  const arr =
    data && mediaData
      ? [...data, ...mediaData]
      : data
        ? data
        : mediaData
          ? mediaData
          : [];
  const urlMap = arr.reduce<PresignedUrlMap>((p, c) => {
    if (c.error) return p;
    if (!c.path) return p;
    return {
      [c.path]: c.signedUrl,
      ...p,
    };
  }, {});
  return urlMap;
};

export default getPresignedUrlMapFromInferenceList;
