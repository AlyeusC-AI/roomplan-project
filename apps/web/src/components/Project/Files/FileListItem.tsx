/* This example requires Tailwind CSS v2.0+ */

import { useState } from "react";
import { FileObject } from "@supabase/storage-js";
import dateFormat from "dateformat";
import { useParams } from "next/navigation";

import Signature from "./Signature";
import { Paperclip, Trash } from "lucide-react";
import { LoadingSpinner } from "@components/ui/spinner";
import { Button } from "@components/ui/button";

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
  const router = useParams<{ id: string }>();
  // const getSignedUrl = trpc.file.getSignedUrl.useQuery(
  //   {
  //     name: file.name,
  //     projectId: router.id,
  //   },
  //   { enabled: false }
  // );
  const [isSigning, setIsSigning] = useState(false);
  const [preSignedUrl, setPreSignedUrl] = useState("");
  const eSign = async () => {
    if (isSigning) {
      setIsSigning(false);
      return;
    }
    if (file.metadata.mimetype === "application/pdf") {
      // const r = await getSignedUrl.refetch();
      // setPreSignedUrl(r.data?.signedUrl ?? "");
      // setIsSigning(true);
      return;
    }
  };

  const onDel = async () => {
    // const r = await getSignedUrl.refetch();
    // if (r.data?.signedUrl) {
    //   onDownload(file, r.data?.signedUrl);
    // }
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
          <div className='ml-4 flex items-center space-x-3'>
            <>
              {file.metadata.mimetype === "application/pdf" && (
                <Button onClick={() => eSign()}>eSign</Button>
              )}
              <Button
                onClick={() => onDel()}
                disabled={isDeleting === file.name}
                variant='outline'
              >
                Download
              </Button>
              <Button onClick={() => onDelete(file)} variant='destructive'>
                {isDeleting === file.name ? (
                  <LoadingSpinner />
                ) : (
                  <Trash className='h-5' />
                )}
              </Button>
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
