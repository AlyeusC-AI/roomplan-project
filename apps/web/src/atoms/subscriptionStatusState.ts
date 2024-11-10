import { SubscriptionStatus } from '@servicegeek/db'
import { atom } from 'recoil'

const subscriptionStatusState = atom<SubscriptionStatus>({
  key: 'SubscriptionStatusState',
  default: SubscriptionStatus.trialing,
})

export default subscriptionStatusState
