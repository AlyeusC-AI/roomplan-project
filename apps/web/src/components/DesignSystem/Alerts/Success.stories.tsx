import React from 'react'
import { ComponentMeta,ComponentStory } from '@storybook/react'

import { default as SuccessAlert } from './Success'

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Alerts',
  component: SuccessAlert,
} as ComponentMeta<typeof SuccessAlert>

const SuccessTemplate: ComponentStory<typeof SuccessAlert> = (args) => (
  <SuccessAlert {...args} />
)

export const Success = SuccessTemplate.bind({})
Success.args = {
  title: 'Order Completed',
  children: (
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid pariatur,
      ipsum similique veniam.
    </p>
  ),
}
