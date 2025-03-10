import { init, logEvent, track } from "@amplitude/analytics-browser";
import { getUserId, setUserId } from "@amplitude/analytics-browser";
import { userInfoStore } from "@atoms/user-info";

const useAmplitudeTrack = () => {
  const userInfo = userInfoStore((state) => state.user);
  const currentUserId = getUserId();

  // Initialize Amplitude with the API key
  if (!currentUserId) {
    init(String(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY));
  }

  if (userInfo?.email && userInfo.email !== currentUserId) {
    setUserId(userInfo.email);
  }

  return { track, logEvent, init };
};

export default useAmplitudeTrack;
