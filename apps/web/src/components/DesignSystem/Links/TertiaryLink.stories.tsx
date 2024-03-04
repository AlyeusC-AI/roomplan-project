import React from 'react'
import { ComponentMeta,ComponentStory } from '@storybook/react'

import TertiaryLink from './TertiaryLink'

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Links',
  component: TertiaryLink,
} as ComponentMeta<typeof TertiaryLink>

const TertiaryTemplate: ComponentStory<typeof TertiaryLink> = (args) => (
  <TertiaryLink {...args} />
)

export const Tertiary = TertiaryTemplate.bind({})
Tertiary.args = {
  children: 'Click Me',
}
