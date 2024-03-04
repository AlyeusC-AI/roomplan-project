import { useState } from 'react'
import toast from 'react-hot-toast'
import { carrierOptions } from '@components/DesignSystem/CreationSelect/carrierOptions'
import SavedOptionSelect from '@components/DesignSystem/CreationSelect/SavedOptionSelect'
import AutoSaveTextInput from '@components/DesignSystem/TextInput/AutoSaveTextInput'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
import projectInfoState from '@atoms/projectInfoState'
import savedOptionsState from '@atoms/savedOptionsState'

import Form from './Form'
import FormContainer from './FormContainer'
import InputLabel from './InputLabel'

interface InsuranceData {
  insuranceCompanyName?: string
  adjusterName?: string
  adjusterPhoneNumber?: string
  adjusterEmail?: string
  insuranceClaimId?: string
  lossType?: string
  catCode?: number
}

export default function InsuranceCompanyInformation() {
  const [projectInfo, setProjectInfo] = useRecoilState(projectInfoState)
  const [savedOptions] = useRecoilState(savedOptionsState)

  const router = useRouter()
  const [typeOfLoss, setTypeOfLoss] = useState(projectInfo.lossType)

  const onSave = async (data: InsuranceData) => {
    setProjectInfo((oldProjectInfo) => ({
      ...oldProjectInfo,
      ...data,
    }))
    try {
      const res = await fetch(
        `/api/project/${router.query.id}/insurance-information`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      )
      if (res.ok) {
        setProjectInfo((oldProjectInfo) => ({
          ...oldProjectInfo,
          ...data,
        }))
      } else {
        toast.error(
          'Updated Failed. If the error persists please contact support@restorationx.app'
        )
      }
    } catch (error) {
      console.error(error)
      toast.error(
        'Updated Failed. If the error persists please contact support@restorationx.app'
      )
    }
  }

  return (
    <FormContainer className="col-span-10 md:col-span-5">
      <Form
        title="Carrier details"
        description="The insurance company and adjuster information."
      >
        <>
          <SavedOptionSelect
            className="col-span-6"
            name="insuranceCompanyName"
            title="Carrier"
            onSave={(value) =>
              onSave({
                insuranceCompanyName: value,
              })
            }
            defaultValue={
              projectInfo.insuranceCompanyName
                ? savedOptions.carrier.find(
                    (carrier) =>
                      carrier.value === projectInfo.insuranceCompanyName
                  )
                : undefined
            }
            optionType="carrier"
            defaultOptions={carrierOptions}
          />
          <AutoSaveTextInput
            className="col-span-6"
            defaultValue={projectInfo.insuranceClaimId}
            onSave={(insuranceClaimId) => onSave({ insuranceClaimId })}
            name="insuranceClaimId"
            title="Claim Number"
            ignoreInvalid
          />
          <div
            className={`col-span-3 ${
              typeOfLoss && typeOfLoss !== '--' && typeOfLoss === 'Water'
            }`}
          >
            <InputLabel htmlFor="typeOfLoss">Type of Loss</InputLabel>
            <select
              id="typeOfLoss"
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              onChange={(e) => {
                if (e.target.value && e.target.value !== '--') {
                  setTypeOfLoss(e.target.value)
                  if (e.target.value !== 'Water') {
                    // @ts-expect-error
                    onSave({ lossType: e.target.value, catCode: null })
                  } else {
                    onSave({ lossType: e.target.value })
                  }
                }
              }}
              defaultValue={typeOfLoss}
            >
              <option className="text-sm">--</option>
              <option value="Fire">Fire</option>
              <option value="Water">Water</option>
              <option value="Wind">Wind</option>
              <option value="Mold">Mold</option>
              <option value="Mold">Catastrophe</option>
            </select>
          </div>

          <div className="col-span-3">
            <InputLabel htmlFor="catCode">Category of Loss</InputLabel>
            <select
              id="catCode"
              className={clsx(
                'mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500',
                typeOfLoss !== 'Water' && 'bg-slate-300'
              )}
              onChange={(e) => {
                if (e.target.value && e.target.value !== '--') {
                  onSave({ catCode: parseInt(e.target.value, 10) })
                }
              }}
              value={projectInfo.catCode || ''}
              disabled={typeOfLoss !== 'Water'}
            >
              <option>--</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>

          <AutoSaveTextInput
            className="col-span-6"
            defaultValue={projectInfo.adjusterName}
            onSave={(adjusterName) => onSave({ adjusterName })}
            name="adjusterName"
            title="Adjuster Name"
            ignoreInvalid
          />
          <AutoSaveTextInput
            className="col-span-6 sm:col-span-3"
            defaultValue={projectInfo.adjusterPhoneNumber}
            onSave={(adjusterPhoneNumber) => onSave({ adjusterPhoneNumber })}
            name="adjusterPhoneNumber"
            title="Adjuster Phone Number"
            ignoreInvalid
            isPhonenumber
          />
          <AutoSaveTextInput
            className="col-span-6 sm:col-span-3"
            defaultValue={projectInfo.adjusterEmail}
            onSave={(adjusterEmail) => onSave({ adjusterEmail })}
            name="adjusterEmail"
            title="Adjuster Email"
            ignoreInvalid
          />
        </>
      </Form>
    </FormContainer>
  )
}
