import { ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { PrimaryButton, Card, Spinner } from "@components/components";
import UserAvatar from "@components/DesignSystem/UserAvatar";
import { useRouter } from "next/navigation";
import { createClient } from "@lib/supabase/server";
import { User } from "@supabase/supabase-js";
import { Camera, Check } from "lucide-react";

const UpdateInfo = ({
  emailConfirmed,
  user,
}: {
  emailConfirmed: boolean;
  user: User;
}) => {
  const userInfo = userInfoStore((state) => state.user);
  const [avatar, setAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const resetPassword = async () => {
    router.push("/reset-password");
  };
  const onSave = async (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => {
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      if (res.ok && userInfo) {
        userInfoStore.getState().setUser({ ...userInfo, ...data });
      } else {
        toast.error(
          "Updated Failed. If the error persists please contact support@restoregeek.app"
        );
      }
    } catch (error) {
      toast.error(
        "Updated Failed. If the error persists please contact support@restoregeek.app"
      );
    }
  };

  const uploadPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    console.log(user, e);
    if (!user || !e || !e.target || !e.target.files) return;
    setIsUploading(true);
    const avatarFile = e.target.files[0];
    try {
      const body = new FormData();
      body.append("file", avatarFile);
      const res = await fetch("/api/user/avatar-upload", {
        method: "POST",
        body,
      });
      if (res.ok) {
        const json = await res.json();
        setAvatar(json.url);
      }
    } catch (error) {
      console.error(error);
    }
    setIsUploading(false);
  };

  return (
    <Card bg='' className='shadow-none'>
      <h2 className='text-lg font-medium leading-6 text-gray-900'>
        Basic Information
      </h2>
      <div className='mt-6 grid w-full grid-cols-4 gap-6'>
        <div className='col-span-4 md:col-span-2'>
          {/* <AutoSaveTextInput
            className='col-span-4 md:col-span-2'
            defaultValue={userInfo?.firstName || ""}
            onSave={(firstName) => onSave({ firstName })}
            name='firstName'
            title='First Name'
            ignoreInvalid
          />
          <AutoSaveTextInput
            className='col-span-4 md:col-span-2'
            defaultValue={userInfo?.lastName || ""}
            onSave={(lastName) => onSave({ lastName })}
            name='lastName'
            title='Last Name'
            ignoreInvalid
          /> */}
        </div>
        <div className='col-span-4 flex flex-col items-center justify-center md:col-span-2'>
          <label
            htmlFor='avatar-upload'
            className='relative flex size-24 items-center justify-center rounded-full bg-gray-100 shadow-sm hover:cursor-pointer'
          >
            <UserAvatar
              firstName={userInfo?.firstName || ""}
              lastName={userInfo?.lastName || ""}
              userId={user?.id}
              email={user?.email}
              className='size-20'
            />
            <div className='absolute bottom-0 right-0 z-10 flex size-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg'>
              {isUploading ? (
                <Spinner bg='text-white' />
              ) : (
                <Camera strokeWidth='2' className='size-6' />
              )}
            </div>
          </label>
          <input
            type='file'
            accept='.jpg, .jpeg, .png'
            id='avatar-upload'
            className='hidden'
            onChange={uploadPhoto}
            disabled={isUploading}
          />
        </div>
      </div>
      <h3 className='text-md mt-6 font-medium leading-6 text-gray-900'>
        Phone Number
        <span>(xxx-xxx-xxxx)</span>
      </h3>
      <div className='mt-2 flex max-w-xl items-center text-sm text-gray-500'>
        {/* <AutoSaveTextInput
          className='col-span-4 md:col-span-2'
          defaultValue={userInfo?.phone || ""}
          onSave={(phone) => onSave({ phone })}
          name='phone'
          type='tel'
          placeholder='XXX-XXX-XXXX'
          pattern='[0-9]{3}-[0-9]{3}-[0-9]{4}'
          title=''
          ignoreInvalid
          isPhonenumber
        /> */}
      </div>
      <h3 className='text-md mt-6 font-medium leading-6 text-gray-900'>
        Email
      </h3>
      <div className='mt-2 flex max-w-xl items-center text-sm text-gray-500'>
        <p className='mr-2'>{user?.email}</p>{" "}
        {emailConfirmed ? (
          <Check height={18} className='text-green-600' />
        ) : (
          <></>
          // <Q height={18} className='text-yellow-600' />
        )}
      </div>
      <h3 className='text-md mt-6 font-medium leading-6 text-gray-900'>
        Reset your password
      </h3>
      <div className='mt-2 max-w-xl text-sm text-gray-500'>
        <p>Change the password for your account.</p>
      </div>
      <PrimaryButton
        type='button'
        className='mt-6 inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        onClick={() => resetPassword()}
      >
        Reset Password
      </PrimaryButton>
    </Card>
  );
};

export default UpdateInfo;

// This gets called on every request
export async function getServerSideProps() {
  // Fetch data from external API
  const supabase = await createClient();
  const user = await supabase.auth.getUser();

  // Pass data to the page via props
  return { props: { user: user.data.user } };
}
