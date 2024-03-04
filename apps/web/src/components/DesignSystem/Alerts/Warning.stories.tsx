import React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import { default as WarningAlert } from './Warning'

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Alerts',
  component: WarningAlert,
} as ComponentMeta<typeof WarningAlert>

const WarningTemplate: ComponentStory<typeof WarningAlert> = (args) => (
  <WarningAlert {...args} />
)

export const Warning = WarningTemplate.bind({})
Warning.args = {
  title: 'Order Completed',
  children: (
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid pariatur,
      ipsum similique veniam.
    </p>
  ),
}
