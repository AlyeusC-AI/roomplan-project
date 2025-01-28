/* This example requires Tailwind CSS v2.0+ */

import { useState } from "react";
import { FileObject } from "@supabase/storage-js";
import { trpc } from "@utils/trpc";
import dateFormat from "dateformat";
import { useRouter } from "next/router";

import Signature from "./Signature";
import { Paperclip, Trash } from "lucide-react";
import { LoadingSpinner } from "@components/ui/spinner";

export default function FileListItem({
  file,
  onDownload,
  onDelete,
  isDeleting,
}: {
  isDeleting: string;
  file: FileObject;
  onDownload: (file: FileObject, url: string) => void;
  onDelete: (file: FileObject) => void;
}) {
  const router = useRouter();
  const getSignedUrl = trpc.file.getSignedUrl.useQuery(
    {
      name: file.name,
      projectId: router.query.id as string,
    },
    { enabled: false }
  );
  const [isSigning, setIsSigning] = useState(false);
  const [preSignedUrl, setPreSignedUrl] = useState("");
  const eSign = async () => {
    if (isSigning) {
      setIsSigning(false);
      return;
    }
    if (file.metadata.mimetype === "application/pdf") {
      const r = await getSignedUrl.refetch();
      setPreSignedUrl(r.data?.signedUrl ?? "");
      setIsSigning(true);
      return;
    }
  };

  const onDel = async () => {
    const r = await getSignedUrl.refetch();
    if (r.data?.signedUrl) {
      onDownload(file, r.data?.signedUrl);
    }
  };
  const onSave = () => {
    setIsSigning(false);
  };

  return (
    <>
      <li
        className={`flex flex-col py-3 pl-3 pr-4 text-sm ${
          isDeleting === file.name && "opacity-50"
        }`}
      >
        <div className='flex items-center justify-between'>
          <div className='flex w-0 flex-1 items-center'>
            <Paperclip
              className='size-5 shrink-0 text-gray-400'
              aria-hidden='true'
            />
            <div className='ml-2 flex w-0 flex-1 items-center'>
              <span className='truncate'>{file.name} </span>
              <span className='ml-4 hidden text-gray-400 sm:flex'>
                {dateFormat(file.created_at, "ddd, mmm, yyyy")}
              </span>
            </div>
          </div>
          <div className='ml-4 flex items-center'>
            <>
              {file.metadata.mimetype === "application/pdf" && (
                <button
                  onClick={() => eSign()}
                  className='mr-4 font-medium text-blue-600 hover:text-blue-500'
                >
                  eSign
                </button>
              )}
              <button
                onClick={() => onDel()}
                disabled={isDeleting === file.name}
                className='font-medium text-blue-600 hover:text-blue-500'
              >
                Download
              </button>
              <button
                onClick={() => onDelete(file)}
                className='ml-4 font-medium text-gray-600 hover:text-red-500'
              >
                {isDeleting === file.name ? (
                  <LoadingSpinner />
                ) : (
                  <Trash className='h-5' />
                )}
              </button>
            </>
          </div>
        </div>
        <span className='ml-4 text-gray-400 sm:hidden'>
          {dateFormat(file.created_at, "ddd, mmm, yyyy")}
        </span>
      </li>
      {isSigning && (
        <Signature
          preSignedUrl={preSignedUrl}
          fileName={file.name}
          onSave={onSave}
        ></Signature>
      )}
    </>
  );
}
