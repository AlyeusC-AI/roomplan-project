import React from 'react'
import { ComponentMeta,ComponentStory } from '@storybook/react'

import SecondaryLink from './SecondaryLink'

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Links',
  component: SecondaryLink,
} as ComponentMeta<typeof SecondaryLink>

const SecondaryTemplate: ComponentStory<typeof SecondaryLink> = (args) => (
  <SecondaryLink {...args} />
)

export const Secondary = SecondaryTemplate.bind({})
Secondary.args = {
  children: 'Click Me',
}
