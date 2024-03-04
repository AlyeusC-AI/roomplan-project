import React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import { default as MessageAlert } from './Message'

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Alerts',
  component: MessageAlert,
} as ComponentMeta<typeof MessageAlert>

const MessagTemplate: ComponentStory<typeof MessageAlert> = (args) => (
  <MessageAlert {...args} />
)

export const Message = MessagTemplate.bind({})
Message.args = {
  title: 'Take an action',
  children: (
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid pariatur,
      ipsum similique veniam.
    </p>
  ),
}
