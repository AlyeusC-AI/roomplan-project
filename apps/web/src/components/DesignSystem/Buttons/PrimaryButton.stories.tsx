import React from 'react'
import { ComponentMeta,ComponentStory } from '@storybook/react'

import PrimaryButton from './PrimaryButton'

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Buttons',
  component: PrimaryButton,
} as ComponentMeta<typeof PrimaryButton>

const PrimaryTemplate: ComponentStory<typeof PrimaryButton> = (args) => (
  <PrimaryButton {...args} />
)

export const Primary = PrimaryTemplate.bind({})
Primary.args = {
  loading: false,
  children: 'Click Me',
}
