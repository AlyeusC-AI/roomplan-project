import { SubscriptionStatus } from "@servicegeek/db";
import { create } from "zustand";

// const subscriptionStatusState = atom<SubscriptionStatus>({
//   key: 'SubscriptionStatusState',
//   default: SubscriptionStatus.trialing,
// })

interface State {
  subscriptionStatus: SubscriptionStatus;
}

interface Actions {
  setSubscriptionStatus: (status: SubscriptionStatus) => void;
}

export const subscriptionStore = create<State & Actions>((set) => ({
  subscriptionStatus: SubscriptionStatus.trialing,
  setSubscriptionStatus: (status) => set({ subscriptionStatus: status }),
}));
