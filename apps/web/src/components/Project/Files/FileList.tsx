/* This example requires Tailwind CSS v2.0+ */

import { useState } from "react";

import FileListItem from "./FileListItem";
import { Card } from "@components/ui/card";
import { Image } from "@service-geek/api-client";

export default function FileList({
  files,
  onDownload,
  onDelete,
  roofReport = false,
}: {
  files: Image[];
  onDownload: (file: Image, way: "view" | "download") => Promise<string | void>;
  onDelete: (file: Image) => Promise<void>;
  roofReport?: boolean;
}) {
  const [isDeleting, setIsDeleting] = useState("");
  const hasRoofReport = files.some(
    (file) =>
      file.name?.toLowerCase().includes("roof") ||
      file.description?.toLowerCase().includes("roof")
  );
  const onDel = async (file: Image) => {
    setIsDeleting(file.name || "");
    await onDelete(file);
    setIsDeleting("");
  };

  if (hasRoofReport && roofReport) {
    const roofReportFiles = files.filter((file) =>
      file.name?.toLowerCase().includes("roof")
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
