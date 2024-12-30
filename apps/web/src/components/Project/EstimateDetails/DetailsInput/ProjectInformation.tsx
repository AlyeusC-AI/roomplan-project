import toast from 'react-hot-toast'
import { AutoSaveTextInput } from '@components/components/input'
import { useRouter } from 'next/router'
import { projectStore } from '@atoms/project'
import { userInfoStore } from '@atoms/user-info'

import Form from './Form'
import FormContainer from './FormContainer'

interface ProjectData {
  projectName?: string
  projectManagerName?: string
  companyName?: string
}

export default function ProjectInformation() {
  const router = useRouter()
  const projectInfo = projectStore(state => state.project)
  const userInfo = userInfoStore((state) => state.user)

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
        // @ts-expect-error
        projectStore.getState().setProject(data)
      } else {
        toast.error(
          'Updated Failed. If the error persists please contact support@servicegeek.app'
        )
      }
    } catch (error) {
      console.error(error)
      toast.error(
        'Updated Failed. If the error persists please contact support@servicegeek.app'
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
