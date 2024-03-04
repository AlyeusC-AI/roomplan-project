import React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import AutoSaveTextInput from './AutoSaveTextInput'

export default {
  title: 'TextInputs',
  component: AutoSaveTextInput,
} as ComponentMeta<typeof AutoSaveTextInput>

const AutoSaveTextInputTemplate: ComponentStory<typeof AutoSaveTextInput> = (
  args
) => <AutoSaveTextInput {...args} />

function mockApi() {
  return new Promise(function (resolve) {
    setTimeout(resolve, 500)
  })
}

export const AutoSaveInput = AutoSaveTextInputTemplate.bind({})
AutoSaveInput.args = {
  className: 'col-span-1',
  defaultValue: '',
  // @ts-expect-error
  onSave: (humidity) => mockApi(),
  name: 'humidity',
  title: 'Humidity',
  units: '$',
}
