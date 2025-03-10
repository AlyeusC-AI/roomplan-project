import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import useAmplitudeTrack from '@utils/hooks/useAmplitudeTrack'
import debounce from 'lodash.debounce'
import dynamic from 'next/dynamic'
import { orgStore } from '@atoms/organization'

import OrgPhoto from './OrgPhoto'
import { Card } from '@components/ui/card'
import { Input } from '@components/ui/input'


const OrgSettingsSection = () => {

  const debouncedChangeHandler = useMemo(
    () => debounce(updateOrgSettings, 500),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => {
    return () => {
      debouncedChangeHandler.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (

  )
}

export default OrgSettingsSection
