import { useState } from 'react'
import Image from 'next/image'
import { colorHash } from '@utils/color-hash'

export const defaultAvatarClassSizes =
  'h-8 w-8 min-h-[2rem] min-w-[2rem] sm:h-12 sm:w-12 sm:min-h-[3rem] sm:min-w-[3rem]'
const UserAvatar = ({
  userId,
  firstName,
  lastName,
  className = defaultAvatarClassSizes,
  style = {},
  textSize = 'text-lg',
  email,
}: {
  userId?: string
  firstName?: string
  lastName?: string
  className?: string
  style?: any
  textSize?: string
  email?: string
}) => {
  const [noImage, setNoImage] = useState(false)
  if (!userId || noImage) {
    if (firstName && lastName) {
      return (
        <div
          style={{
            backgroundColor: colorHash(email ? email : firstName + lastName)
              .rgb,
          }}
          className={`flex ${className} items-center justify-center rounded-full ${textSize} border border-white font-bold text-white`}
        >
          {firstName[0].toUpperCase()}
          {lastName[0].toUpperCase()}
        </div>
      )
    }
    return (
      <div
        style={{
          backgroundColor: colorHash(email || '').rgb,
        }}
        className={`flex ${className} items-center justify-start truncate rounded-full border border-white bg-blue-500 text-xs font-bold text-white`}
      >
        <p className="truncate">{email}</p>
      </div>
    )
  }

  return (
    <div
      className={`relative ${className} rounded-full border border-white bg-white `}
      style={style}
    >
      <Image
        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pictures/${userId}/avatar.png`}
        className={`rounded-full  text-gray-700`}
        onError={() => setNoImage(true)}
        fill
        alt="user"
        sizes="46px"
      />
    </div>
  )
}

export default UserAvatar
