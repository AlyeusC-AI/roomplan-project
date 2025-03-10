/* This example requires Tailwind CSS v2.0+ */

import { useState, useEffect } from "react";
import { FileObject } from "@supabase/storage-js";
import dateFormat from "dateformat";
import { useParams } from "next/navigation";
import Image from "next/image";

import Signature from "./Signature";
import {
  File,
  FileText,
  Image as ImageIcon,
  Trash,
  Download,
  Eye,
  PenLine,
} from "lucide-react";
import { LoadingSpinner } from "@components/ui/spinner";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";

export default function FileListItem({
  file,
  onDownload,
  onDelete,
  isDeleting,
}: {
  isDeleting: string;
  file: FileObject;
  onDownload: (file: FileObject, url: string) => Promise<string | void>;
  onDelete: (file: FileObject) => void;
}) {
  const router = useParams<{ id: string }>();
  const [isSigning, setIsSigning] = useState(false);
  const [preSignedUrl, setPreSignedUrl] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const isImage = file.metadata.mimetype?.startsWith("image/");
  const isPDF = file.metadata.mimetype === "application/pdf";
  const isText = file.metadata.mimetype === "text/plain";

  const isViewable = isImage || isPDF || isText;

  useEffect(() => {
    const loadImagePreview = async () => {
      if (isImage) {
        const url = await onDownload(file, "preview");
        if (typeof url === "string") {
          setImageUrl(url);
        }
      }
    };
    loadImagePreview();
  }, [file, isImage, onDownload]);

  const eSign = async () => {
    if (isSigning) {
      setIsSigning(false);
      return;
    }
    if (isPDF) {
      return;
    }
  };

  const onSave = () => {
    setIsSigning(false);
  };

  const handleView = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isViewable) {
      await onDownload(file, "view");
    }
  };

  const getFileIcon = () => {
    if (isPDF) return <File className='h-8 w-8' />;
    if (isText) return <FileText className='h-8 w-8' />;
    if (isImage) return <ImageIcon className='h-8 w-8' />;
    return <File className='h-8 w-8' />;
  };

  return (
    <div
      className={cn(
        "group relative rounded-lg border p-3 transition-all",
        "bg-white dark:bg-gray-800/50",
        "border-gray-100 dark:border-gray-700/50",
        isViewable && "cursor-pointer",
        "hover:border-gray-200 dark:hover:border-gray-600",
        "hover:shadow-sm dark:hover:shadow-gray-800/30",
        isDeleting === file.name && "opacity-50"
      )}
    >
      {/* Preview Section */}
      <div
        className='relative aspect-square w-full overflow-hidden rounded-md bg-gray-50 dark:bg-gray-900'
        onClick={handleView}
      >
        {isImage && imageUrl ? (
          <Image
            src={imageUrl}
            alt={file.name}
            fill
            className={cn(
              "object-cover transition-opacity duration-300",
              !isImageLoaded && "opacity-0"
            )}
            onLoadingComplete={() => setIsImageLoaded(true)}
          />
        ) : (
          <div className='flex h-full items-center justify-center'>
            <div
              className={cn(
                "rounded-lg p-3",
                "text-gray-600 dark:text-gray-300"
              )}
            >
              {getFileIcon()}
            </div>
          </div>
        )}
      </div>

      {/* File Info */}
      <div className='mt-2'>
        <p className='truncate text-sm font-medium text-gray-900 dark:text-gray-100'>
          {file.name}
        </p>
        <p className='text-xs text-gray-500 dark:text-gray-400'>
          {dateFormat(file.created_at, "mmm d, yyyy")}
        </p>
      </div>

      {/* Action Buttons - Overlay on hover */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center gap-1 rounded-lg bg-black/50 p-2 opacity-0 transition-opacity",
          "group-hover:opacity-100"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {isViewable && (
          <Button
            size='sm'
            variant='secondary'
            className='h-8'
            onClick={handleView}
          >
            <Eye className='h-4 w-4' />
          </Button>
        )}
        {isPDF && (
          <Button
            size='sm'
            variant='secondary'
            className='h-8'
            onClick={(e) => {
              e.stopPropagation();
              eSign();
            }}
          >
            <PenLine className='h-4 w-4' />
          </Button>
        )}
        <Button
          size='sm'
          variant='secondary'
          className='h-8'
          onClick={(e) => {
            e.stopPropagation();
            onDownload(file, "");
          }}
          disabled={isDeleting === file.name}
        >
          <Download className='h-4 w-4' />
        </Button>
        <Button
          size='sm'
          variant='destructive'
          className='h-8'
          onClick={(e) => {
            e.stopPropagation();
            onDelete(file);
          }}
        >
          {isDeleting === file.name ? (
            <LoadingSpinner className='h-4 w-4' />
          ) : (
            <Trash className='h-4 w-4' />
          )}
        </Button>
      </div>

      {isSigning && (
        <Signature
          preSignedUrl={preSignedUrl}
          fileName={file.name}
          onSave={onSave}
        />
      )}
    </div>
  );
}
