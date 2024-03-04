import React from 'react'
import { ComponentMeta,ComponentStory } from '@storybook/react'

import { default as ErrorAlert } from './Error'

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Alerts',
  component: ErrorAlert,
} as ComponentMeta<typeof ErrorAlert>

const ErrorTemplate: ComponentStory<typeof ErrorAlert> = (args) => (
  <ErrorAlert {...args} />
)

export const Error = ErrorTemplate.bind({})
Error.args = {
  title: 'There were 2 errors with your submission',
  children: (
    <ul role="list" className="list-disc space-y-1 pl-5">
      <li>Your password must be at least 8 characters</li>
      <li>
        Your password must include at least one pro wrestling finishing move
      </li>
    </ul>
  ),
}
