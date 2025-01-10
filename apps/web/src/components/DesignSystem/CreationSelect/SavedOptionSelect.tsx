import { useCallback, useEffect } from 'react'
import produce from 'immer'
import {
  savedOptionsStore,
  defaultSavedOptionState,
  Option,
} from '@atoms/saved-options'
import {
  SavedOptionApiDeleteBody,
  SavedOptionApiPostBody,
} from '@app/api/organization/savedOption/route.ts'

import CreationSelect from '.'

const SavedOptionSelect = ({
  defaultOptions,
  optionType,
  onSave,
  defaultValue,
  name,
  title,
  className,
}: {
  defaultOptions: Option[]
  optionType: keyof typeof defaultSavedOptionState
  onSave: (value?: string) => void
  defaultValue?: Option
  name: string
  title: string
  className: string
}) => {
  const savedOptions = savedOptionsStore(state => state)

  const fetchOptions = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/organization/savedOption?type=${optionType}`,
        {
          method: 'GET',
        }
      )
      if (res.ok) {
        const json = await res.json()
        // setSavedOptions((options) => ({
        //   ...options,
        //   [optionType]: [...defaultOptions, ...json.options],
        // }))
      }
    } catch (error) {
      console.error(error)
    }
  }, [defaultOptions, optionType, savedOptions.setSavedOptions])

  const deleteOption = async (option: Option) => {
    // setSavedOptions((options) => {
    //   const updatedOptions = produce(options, (draft) => {
    //     const index = options[optionType].findIndex(
    //       (o) => o.publicId === option.publicId
    //     )
    //     draft[optionType].splice(index, 1)
    //   })
    //   return updatedOptions
    // })
    try {
      const body: SavedOptionApiDeleteBody = {
        publicId: option.publicId!,
      }
      const res = await fetch('/api/organization/savedOption', {
        method: 'DELETE',
        body: JSON.stringify(body),
      })
      // HACK
      // If deletion fails, re-sync. Should just store previous value
      if (!res.ok) {
        fetchOptions()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const createOption = async (label: string) => {
    try {
      const body: SavedOptionApiPostBody = {
        label,
        type: optionType,
      }
      const res = await fetch('/api/organization/savedOption', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const json = await res.json()
        // setSavedOptions((options) => ({
        //   ...options,
        //   [optionType]: [...options[optionType], json.option],
        // }))
        return json.option as Option
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchOptions()
  }, [fetchOptions])

  return (
    <CreationSelect
      deleteOption={deleteOption}
      className={className}
      name={name}
      title={title}
      onSave={(option) => onSave(option ? option.value : undefined)}
      defaultValue={defaultValue}
      options={savedOptions[optionType]}
      createOption={createOption}
    />
  )
}

export default SavedOptionSelect
