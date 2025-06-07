// import useOnboardingStep from "@utils/hooks/useOnboardingStep";

import FirstTimePhotosModal from "./FirstTimePhotosModal";

export const transitionClasses = {
  enter: "transform transition ease-in-out duration-500 sm:duration-700",
  enterFrom: "translate-x-full",
  enterTo: "translate-x-0",
  leave: "transform transition ease-in-out duration-500 sm:duration-700",
  leaveFrom: "translate-x-0",
  leaveTo: "translate-x-full",
};

export default function FirstTimePhotos() {
  // const showPhotoTour = useOnboardingStep("seenPhotoModal");
  // if (!showPhotoTour) return null;

  return <FirstTimePhotosModal />;
}
