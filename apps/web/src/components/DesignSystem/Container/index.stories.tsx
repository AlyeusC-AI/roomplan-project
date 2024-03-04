import React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import Container from '.'

export default {
  title: 'Container',
  component: Container,
} as ComponentMeta<typeof Container>

const ContainerTemplate: ComponentStory<typeof Container> = (args) => (
  <Container {...args} className="border border-gray-500">
    This is a container. It comes with default padding. The border here is for
    demonstration purposes only
  </Container>
)

export const Containers = ContainerTemplate.bind({})
ContainerTemplate.args = {
  padding: 'sm',
}
