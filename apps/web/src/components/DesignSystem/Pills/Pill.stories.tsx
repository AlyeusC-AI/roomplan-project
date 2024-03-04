import React from 'react'
import { ComponentMeta,ComponentStory } from '@storybook/react'

import Pill from './Pill'

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Pills',
  component: Pill,
} as ComponentMeta<typeof Pill>

const PillTemplate: ComponentStory<typeof Pill> = (args) => <Pill {...args} />

export const BasicPill = PillTemplate.bind({})
BasicPill.args = {
  color: 'blue',
  children: 'PNG',
}
