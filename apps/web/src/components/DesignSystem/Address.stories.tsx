import React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import Address from './Address'

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Address',
  component: Address,
} as ComponentMeta<typeof Address>

const AddressTemplate: ComponentStory<typeof Address> = (args) => (
  <Address {...args} />
)

export const BasicAddress = AddressTemplate.bind({})
BasicAddress.args = {
  address: '412 Howard Road, Gladyne PA, 19035',
}
