import { ChangeEvent, useState } from 'react'
import toast from 'react-hot-toast'
import { Primary } from '@components/DesignSystem/Buttons/PrimaryButton.stories'
import Card from '@components/DesignSystem/Card'
import AutoSaveTextInput from '@components/DesignSystem/TextInput/AutoSaveTextInput'
import UserAvatar from '@components/DesignSystem/UserAvatar'
import Spinner from '@components/Spinner'
import {
  CameraIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline'
import { useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
import userInfoState from '@atoms/userInfoState'

const UpdateInfo = ({ emailConfirmed }: { emailConfirmed: boolean }) => {
  const user = useUser()
  const [userInfo, setUserInfo] = useRecoilState(userInfoState)
  const [avatar, setAvatar] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  const resetPassword = async () => {
    router.push('/reset-password')
  }
  const onSave = async (data: {
    firstName?: string
    lastName?: string
    phone?: string
  }) => {
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      if (res.ok) {
        // @ts-expect-error
        setUserInfo((oldUserInfo) => ({
          ...oldUserInfo,
          ...data,
        }))
      } else {
        toast.error(
          'Updated Failed. If the error persists please contact support@servicegeek.app'
        )
      }
    } catch (error) {
      toast.error(
        'Updated Failed. If the error persists please contact support@servicegeek.app'
      )
    }
  }

  const uploadPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    console.log(user, e)
    if (!user || !e || !e.target || !e.target.files) return
    setIsUploading(true)
    const avatarFile = e.target.files[0]
    try {
      const body = new FormData()
      body.append('file', avatarFile)
      const res = await fetch('/api/user/avatar-upload', {
        method: 'POST',
        body,
      })
      if (res.ok) {
        const json = await res.json()
        setAvatar(json.url)
      }
    } catch (error) {
      console.error(error)
    }
    setIsUploading(false)
  }

  return (
    <Card bg="" className="shadow-none">
      <h2 className="text-lg font-medium leading-6 text-gray-900">
        Basic Information
      </h2>
      <div className="mt-6 grid w-full grid-cols-4 gap-6 ">
        <div className="col-span-4 md:col-span-2">
          <AutoSaveTextInput
            className="col-span-4 md:col-span-2"
            defaultValue={userInfo?.firstName || ''}
            onSave={(firstName) => onSave({ firstName })}
            name="firstName"
            title="First Name"
            ignoreInvalid
          />
          <AutoSaveTextInput
            className="col-span-4 md:col-span-2"
            defaultValue={userInfo?.lastName || ''}
            onSave={(lastName) => onSave({ lastName })}
            name="lastName"
            title="Last Name"
            ignoreInvalid
          />
        </div>
        <div className="col-span-4 flex flex-col items-center justify-center md:col-span-2">
          <label
            htmlFor="avatar-upload"
            className=" relative flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 shadow-sm hover:cursor-pointer"
          >
            <UserAvatar
              firstName={userInfo?.firstName || ''}
              lastName={userInfo?.lastName || ''}
              userId={user?.id}
              email={user?.email}
              className="h-20 w-20"
            />
            <div className="absolute bottom-0 right-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg">
              {isUploading ? (
                <Spinner bg="text-white" />
              ) : (
                <CameraIcon strokeWidth="2" className="h-6 w-6" />
              )}
            </div>
          </label>
          <input
            type="file"
            accept=".jpg, .jpeg, .png"
            id="avatar-upload"
            className="hidden"
            onChange={uploadPhoto}
            disabled={isUploading}
          />
        </div>
      </div>
      <h3 className="text-md mt-6 font-medium leading-6 text-gray-900">
        Phone Number
        <span>(xxx-xxx-xxxx)</span>
      </h3>
      <div className="mt-2 flex max-w-xl items-center text-sm text-gray-500">
        <AutoSaveTextInput
          className="col-span-4 md:col-span-2"
          defaultValue={userInfo?.phone || ''}
          onSave={(phone) => onSave({ phone })}
          name="phone"
          type="tel"
          placeholder="XXX-XXX-XXXX"
          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
          title=""
          ignoreInvalid
          isPhonenumber
        />
      </div>
      <h3 className="text-md mt-6 font-medium leading-6 text-gray-900">
        Email
      </h3>
      <div className="mt-2 flex max-w-xl items-center text-sm text-gray-500">
        <p className="mr-2">{user?.email}</p>{' '}
        {emailConfirmed ? (
          <CheckCircleIcon height={18} className="text-green-600" />
        ) : (
          <QuestionMarkCircleIcon height={18} className="text-yellow-600" />
        )}
      </div>
      <h3 className="text-md mt-6 font-medium leading-6 text-gray-900">
        Reset your password
      </h3>
      <div className="mt-2 max-w-xl text-sm text-gray-500">
        <p>Change the password for your account.</p>
      </div>
      <Primary
        type="button"
        className="mt-6 inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={() => resetPassword()}
      >
        Reset Password
      </Primary>
    </Card>
  )
}

export default UpdateInfo
