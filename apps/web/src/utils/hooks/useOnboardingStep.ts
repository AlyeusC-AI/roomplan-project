// import { useRef } from "react";

// export const useDynamicOnboardingStep = (step: string) => {
//   const getOnboardingStatus =
//     trpc.onboardingStatus.getOnboardingStatus.useQuery();

//   if (!getOnboardingStatus.data) return;

//   const { onboardingStatus } = getOnboardingStatus.data;
//   if (onboardingStatus) {
//     const { [step]: onboardingStep } = onboardingStatus as {
//       [key: string]: boolean;
//     };
//     return onboardingStep;
//   }
//   return null;
// };

// const useOnboardingStep = (step: string) => {
//   const ref = useRef<undefined | boolean>();
//   const getOnboardingStatus =
//     trpc.onboardingStatus.getOnboardingStatus.useQuery();

//   if (!getOnboardingStatus.data) return;

//   const { onboardingStatus } = getOnboardingStatus.data;
//   if (ref.current === undefined) {
//     if (onboardingStatus) {
//       const { [step]: onboardingStep } = onboardingStatus as {
//         [key: string]: boolean;
//       };
//       if (onboardingStep) {
//         ref.current = false;
//       } else {
//         ref.current = true;
//       }
//     } else {
//       ref.current = true;
//     }
//   }
//   return ref.current;
// };

// export default useOnboardingStep;
