import toast from 'react-hot-toast'
import AutoSaveTextInput from '@components/DesignSystem/TextInput/AutoSaveTextInput'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
import projectInfoState from '@atoms/projectInfoState'
import userInfoState from '@atoms/userInfoState'

import Form from './Form'
import FormContainer from './FormContainer'

interface ProjectData {
  projectName?: string
  projectManagerName?: string
  companyName?: string
}

export default function ProjectInformation() {
  const router = useRouter()
  const [projectInfo, setProjectInfo] = useRecoilState(projectInfoState)
  const [userInfo] = useRecoilState(userInfoState)

  const onSave = async (data: ProjectData) => {
    try {
      const res = await fetch(
        `/api/project/${router.query.id}/project-information`,
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
        title="Project Information"
        description="Your business information and project manager information"
      >
        <>
          <AutoSaveTextInput
            className="col-span-6"
            defaultValue={
              projectInfo.managerName ||
              `${userInfo?.firstName} ${userInfo?.lastName}`
            }
            onSave={(projectManagerName) => onSave({ projectManagerName })}
            name="projectManagerName"
            title="Project Manager Name"
            ignoreInvalid
          />

          <AutoSaveTextInput
            className="col-span-6"
            defaultValue={
              projectInfo.companyName || userInfo?.organizationName || ''
            }
            onSave={(companyName) => onSave({ companyName })}
            name="companyName"
            title="Company Name"
            ignoreInvalid
          />
        </>
      </Form>
    </FormContainer>
  )
}
