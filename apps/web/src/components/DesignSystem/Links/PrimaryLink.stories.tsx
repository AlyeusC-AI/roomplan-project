import React from 'react'
import { ComponentMeta,ComponentStory } from '@storybook/react'

import PrimaryLink from './PrimaryLink'

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Links',
  component: PrimaryLink,
} as ComponentMeta<typeof PrimaryLink>

const PrimaryTemplate: ComponentStory<typeof PrimaryLink> = (args) => (
  <PrimaryLink {...args} />
)

export const Primary = PrimaryTemplate.bind({})
Primary.args = {
  children: 'Click Me',
}
