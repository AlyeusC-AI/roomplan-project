import { init, logEvent, track } from "@amplitude/analytics-browser";
import { getUserId, setUserId } from "@amplitude/analytics-browser";
import { useCurrentUser } from "@service-geek/api-client";

const useAmplitudeTrack = () => {
  // const userInfo = userInfoStore((state) => state.user);
  const { data: user } = useCurrentUser();
  const currentUserId = getUserId();

  // Initialize Amplitude with the API key
  if (!currentUserId) {
    init(String(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY));
  }

  if (user?.email && user.email !== currentUserId) {
    setUserId(user.email);
  }

  return { track, logEvent, init };
};

export default useAmplitudeTrack;
