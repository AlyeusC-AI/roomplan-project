import { ChangeEvent, useState } from "react";
import toast from "react-hot-toast";
import Spinner from "@components/Spinner";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/router";
import { event } from "nextjs-google-analytics";

import TabTitleArea from "../TabTitleArea";

export default function Import() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    event("attempt_upload_estimate_file", {
      category: "Import",
    });
    if (!files || files.length < 0) return;
    uploadToSupabase(files[0]);
  };

  const uploadToSupabase = async (file: File) => {
    setIsUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(
        `/api/project/${router.query.id}/estimate-import`,
        {
          method: "POST",
          body: body,
        }
      );
      if (res.ok) {
        toast.success("Uploaded File");
      } else {
        toast.error("Failed to upload file.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file.");
    }

    setIsUploading(false);
  };
  return (
    <>
      <TabTitleArea
        title='Import Estimate'
        description='Import a PDF of an existing exactimate estimate.'
      />
      <div className='flex h-full flex-col items-center justify-center'>
        <div className='flex max-w-xl flex-col items-center justify-center text-center'>
          <Image
            src='/images/text-extract.svg'
            width={647.63626 / 3}
            height={632.17383 / 3}
            alt='Text extract'
          />
          <h2 className='mt-4 text-3xl font-semibold'>Import an estimate</h2>
          <p className='mt-4'>
            Already have an estimate for this job and need a quick way to import
            data? Upload a PDF of an existing estimate and we will extract
            relevant job data using Artifical Intelligence.{" "}
          </p>
          <div className='mt-6'>
            <div>
              <label
                htmlFor='file-upload'
                className='inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-2 py-1 text-sm font-medium text-white shadow-sm hover:cursor-pointer hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto md:px-4 md:py-2'
              >
                {isUploading ? (
                  <Spinner bg='fill-white' />
                ) : (
                  <>
                    {" "}
                    <CloudArrowUpIcon
                      className='-ml-1 mr-2 size-5'
                      aria-hidden='true'
                    />
                    Upload Estimate PDF
                  </>
                )}
              </label>
              <input
                onChange={onUpload}
                type='file'
                id='file-upload'
                name='file-upload'
                accept='pdf'
                className='hidden'
                disabled={isUploading}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
