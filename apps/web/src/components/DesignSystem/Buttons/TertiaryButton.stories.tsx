import React from 'react'
import { ComponentMeta,ComponentStory } from '@storybook/react'

import TertiaryButton from './TertiaryButton'

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Buttons',
  component: TertiaryButton,
} as ComponentMeta<typeof TertiaryButton>

const TertiaryTemplate: ComponentStory<typeof TertiaryButton> = (args) => (
  <TertiaryButton {...args} />
)

export const Tertiary = TertiaryTemplate.bind({})
Tertiary.args = {
  loading: false,
  children: 'Click Me',
}
