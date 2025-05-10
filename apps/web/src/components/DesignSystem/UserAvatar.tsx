import { useState } from "react";
import Image from "next/image";
import { colorHash } from "@utils/color-hash";

export const defaultAvatarClassSizes =
  "min-h-[2rem] min-w-[2rem] sm:h-12 sm:w-12 sm:min-h-[3rem] sm:min-w-[3rem]";
const UserAvatar = ({
  firstName,
  lastName,
  className = defaultAvatarClassSizes,
  style = {},
  textSize = "text-lg",
  email,
  avatar,
}: {
  firstName?: string;
  lastName?: string;
  className?: string;
  style?: any;
  textSize?: string;
  email?: string;
  avatar?: string;
}) => {
  const [noImage, setNoImage] = useState(false);
  if (!avatar || noImage) {
    if (firstName && lastName) {
      return (
        <div
          style={{
            backgroundColor: colorHash(email ? email : firstName + lastName)
              .rgb,
          }}
          className={`flex ${className} items-center justify-center rounded-full ${textSize} border border-white font-bold text-white`}
        >
          {firstName[0]?.toUpperCase()}
          {lastName[0]?.toUpperCase()}
        </div>
      );
    }
    return (
      <div
        style={{
          backgroundColor: colorHash(email || "").rgb,
        }}
        className={`flex ${className} items-center justify-start truncate rounded-full border border-white bg-blue-500 text-xs font-bold text-white`}
      >
        <p className='truncate'>{email}</p>
      </div>
    );
  }

  return (
    <div
      className={`relative ${className} rounded-full border border-white bg-white`}
      style={style}
    >
      <Image
        src={avatar || ""}
        className={`size-5 rounded-full text-gray-700`}
        onError={() => setNoImage(true)}
        fill
        alt='user'
      />
    </div>
  );
};

export default UserAvatar;
