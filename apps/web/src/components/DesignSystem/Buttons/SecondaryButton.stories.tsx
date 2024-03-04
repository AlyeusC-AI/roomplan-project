import React from 'react'
import { ComponentMeta,ComponentStory } from '@storybook/react'

import SecondaryButton from './SecondaryButton'

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Buttons',
  component: SecondaryButton,
} as ComponentMeta<typeof SecondaryButton>

const SecondaryTemplate: ComponentStory<typeof SecondaryButton> = (args) => (
  <SecondaryButton {...args} />
)

export const Secondary = SecondaryTemplate.bind({})
Secondary.args = {
  loading: false,
  children: 'Click Me',
}
