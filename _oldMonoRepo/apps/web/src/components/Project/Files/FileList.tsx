/* This example requires Tailwind CSS v2.0+ */

import { useState } from "react";
import { FileObject } from "@supabase/storage-js";

import FileListItem from "./FileListItem";
import { Card } from "@components/ui/card";

export default function FileList({
  files,
  onDownload,
  onDelete,
  roofReport = false,
}: {
  files: FileObject[];
  onDownload: (file: FileObject, url: string) => Promise<string | void>;
  onDelete: (file: FileObject) => Promise<void>;
  roofReport?: boolean;
}) {
  const [isDeleting, setIsDeleting] = useState("");
  const hasRoofReport = files.some((file) =>
    file.name.toLowerCase().includes("roof")
  );
  const onDel = async (file: FileObject) => {
    setIsDeleting(file.name);
    await onDelete(file);
    setIsDeleting("");
  };

  if (hasRoofReport && roofReport) {
    const roofReportFiles = files.filter((file) =>
      file.name.toLowerCase().includes("roof")
    );
    return (
      <Card className='mt-8 p-4'>
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
          {roofReportFiles.map((file) => (
            <FileListItem
              key={`file-${file.id}`}
              isDeleting={isDeleting}
              file={file}
              onDownload={onDownload}
              onDelete={onDel}
            />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className='mt-8 p-4'>
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
        {files.map((file) => (
          <FileListItem
            key={`file-${file.id}`}
            isDeleting={isDeleting}
            file={file}
            onDownload={onDownload}
            onDelete={onDel}
          />
        ))}
      </div>
    </Card>
  );
}
