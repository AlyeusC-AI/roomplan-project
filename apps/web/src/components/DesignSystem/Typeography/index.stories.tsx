import React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import Typeography from '.'

export default {
  title: 'Typeography',
  component: Typeography.H1,
} as ComponentMeta<typeof Typeography.H1>

const HeadingTemplate: ComponentStory<typeof Typeography.H1> = (args) => (
  <>
    <Typeography.H1 {...args}>Typeography.H1</Typeography.H1>
    <Typeography.H2 {...args}>Typeography.H2</Typeography.H2>
    <Typeography.H3 {...args}>Typeography.H3</Typeography.H3>
    <Typeography.H4 {...args}>Typeography.H4</Typeography.H4>
    <Typeography.H5 {...args}>Typeography.H5</Typeography.H5>
    <Typeography.H6 {...args}>Typeography.H5</Typeography.H6>
  </>
)

export const Headings = HeadingTemplate.bind({})
HeadingTemplate.args = {
  gutterBottom: true,
}
