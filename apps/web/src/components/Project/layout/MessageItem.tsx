"use client";

import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import {
  Trash2,
  Edit2,
  Check,
  X,
  Image,
  File,
  Download,
  Reply,
  ZoomIn,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { MessageType } from "@service-geek/api-client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";

interface MessageItemProps {
  message: any;
  currentUser: any;
  onDelete: (messageId: string) => void;
  onEdit: (message: any) => void;
  onReply: (message: any) => void;
  isEditing: boolean;
  editContent: string;
  onEditSubmit: (messageId: string, content: string) => void;
  onEditCancel: () => void;
}

export default function MessageItem({
  message,
  currentUser,
  onDelete,
  onEdit,
  onReply,
  isEditing,
  editContent,
  onEditSubmit,
  onEditCancel,
}: MessageItemProps) {
  const [localEditContent, setLocalEditContent] = useState(editContent);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  // Sync local edit content with prop when editing starts
  useEffect(() => {
    if (isEditing) {
      setLocalEditContent(message.content);
    }
  }, [isEditing, message.content]);

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatMessageTime = (date: Date) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return format(messageDate, "h:mm a");
    } else if (isYesterday(messageDate)) {
      return `Yesterday, ${format(messageDate, "h:mm a")}`;
    } else {
      return format(messageDate, "MMM d, h:mm a");
    }
  };

  const isMessageSender = (messageUserId: string) => {
    return currentUser?.id === messageUserId;
  };

  const handleEditSubmit = () => {
    if (localEditContent.trim() && localEditContent !== message.content) {
      onEditSubmit(message.id, localEditContent.trim());
    } else {
      onEditCancel();
    }
  };

  const handleEditCancel = () => {
    setLocalEditContent(message.content);
    onEditCancel();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
  };

  const handleImageClick = (attachment: any) => {
    setSelectedImage(attachment);
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      // Fetch the file as a blob
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);

      // Create and trigger download link
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download file:", error);
      // Fallback to opening in new tab if download fails
      window.open(fileUrl, "_blank");
    }
  };

  const renderAttachment = (attachment: any) => {
    const isImage =
      attachment.mimeType?.startsWith("image/") ||
      attachment.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    return (
      <div
        key={attachment.id}
        className='mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3'
      >
        {isImage ? (
          <div className='space-y-3'>
            <div
              className='group relative cursor-pointer'
              onClick={() => handleImageClick(attachment)}
            >
              <img
                src={attachment.fileUrl}
                alt={attachment.fileName}
                className='max-h-64 max-w-full rounded-lg object-cover shadow-sm transition-transform hover:scale-105'
              />
              <div className='absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-0 transition-all duration-200 group-hover:bg-opacity-20'>
                <ZoomIn className='h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100' />
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <div className='min-w-0 flex-1'>
                <div className='truncate text-sm font-medium text-gray-900'>
                  {attachment.fileName}
                </div>
                <div className='text-xs text-gray-500'>
                  {attachment.fileSize
                    ? `${(attachment.fileSize / 1024).toFixed(1)} KB`
                    : ""}
                </div>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() =>
                  handleDownload(attachment.fileUrl, attachment.fileName)
                }
                className='h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600'
                title='Download'
              >
                <Download className='h-4 w-4' />
              </Button>
            </div>
          </div>
        ) : (
          <div className='flex items-center gap-3'>
            <File className='h-4 w-4 text-gray-500' />
            <div className='min-w-0 flex-1'>
              <div className='truncate text-sm font-medium text-gray-900'>
                {attachment.fileName}
              </div>
              <div className='text-xs text-gray-500'>
                {attachment.fileSize
                  ? `${(attachment.fileSize / 1024).toFixed(1)} KB`
                  : ""}
                {attachment.mimeType && ` • ${attachment.mimeType}`}
              </div>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() =>
                handleDownload(attachment.fileUrl, attachment.fileName)
              }
              className='h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600'
              title='Download'
            >
              <Download className='h-4 w-4' />
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderReplyContext = () => {
    if (!message.replyTo) return null;

    return (
      <div className='mb-2 rounded-lg border-l-4 border-blue-200 bg-blue-50 p-2'>
        <div className='mb-1 text-xs font-medium text-blue-600'>
          Replying to {message.replyTo.user.firstName}{" "}
          {message.replyTo.user.lastName}
        </div>
        <div
          className='max-h-12 overflow-hidden text-xs text-blue-700'
          style={{
            wordBreak: "break-word",
            overflowWrap: "break-word",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {message.replyTo.content}
        </div>
      </div>
    );
  };

  const renderMessageContent = () => {
    if (isEditing) {
      return (
        <div className='space-y-2'>
          <Input
            value={localEditContent}
            onChange={(e) => setLocalEditContent(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={(e) => e.target.select()}
            className='text-sm'
            autoFocus
          />
          <div className='flex gap-2'>
            <Button
              size='sm'
              onClick={handleEditSubmit}
              className='h-7 px-2 text-xs'
            >
              <Check className='mr-1 h-3 w-3' />
              Save
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={handleEditCancel}
              className='h-7 px-2 text-xs'
            >
              <X className='mr-1 h-3 w-3' />
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className='space-y-2'>
        {renderReplyContext()}
        {message.isDeleted ? (
          <div className='text-sm italic text-gray-400'>
            This message was deleted
          </div>
        ) : (
          <div
            className='max-w-full overflow-hidden whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700'
            style={{
              wordBreak: "break-word",
              overflowWrap: "break-word",
              hyphens: "auto",
            }}
          >
            {message.content}
          </div>
        )}
        {message.attachments &&
          message.attachments.length > 0 &&
          !message.isDeleted && (
            <div className='space-y-2'>
              {message.attachments.map(renderAttachment)}
            </div>
          )}
        {message.isEdited && !message.isDeleted && (
          <div className='text-xs italic text-gray-400'>(edited)</div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className='group -m-2 flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50'>
        <div className='flex-shrink-0'>
          <Badge
            variant='secondary'
            className='bg-blue-100 text-xs font-medium text-blue-700 hover:bg-blue-200'
          >
            {getUserInitials(message.user.firstName, message.user.lastName)}
          </Badge>
        </div>
        <div className='min-w-0 max-w-full flex-1'>
          <div className='mb-1 flex items-center justify-between gap-2'>
            <div className='flex min-w-0 flex-1 items-center gap-2'>
              <div className='truncate text-xs font-medium text-gray-900'>
                {message.user.firstName} {message.user.lastName}
              </div>
              <div className='flex-shrink-0 text-xs text-gray-400'>
                {formatMessageTime(new Date(message.createdAt))}
              </div>
              {message.type !== MessageType.TEXT && (
                <div className='flex flex-shrink-0 items-center gap-1 text-xs text-gray-400'>
                  {message.type === MessageType.IMAGE && (
                    <Image className='h-3 w-3' />
                  )}
                  {message.type === MessageType.FILE && (
                    <File className='h-3 w-3' />
                  )}
                  {message.type}
                </div>
              )}
            </div>
            {!isEditing && !message.isDeleted && (
              <div className='flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-6 w-6 p-0 hover:bg-green-100 hover:text-green-600'
                  onClick={() => onReply(message)}
                  title='Reply'
                >
                  <Reply className='h-3 w-3' />
                </Button>
                {isMessageSender(message.user.id) && (
                  <>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-6 w-6 p-0 hover:bg-blue-100 hover:text-blue-600'
                      onClick={() => onEdit(message)}
                      title='Edit'
                    >
                      <Edit2 className='h-3 w-3' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600'
                      onClick={() => onDelete(message.id)}
                      title='Delete'
                    >
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
          <div className='max-w-full overflow-hidden'>
            {renderMessageContent()}
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className='max-h-[90vh] max-w-4xl p-0'>
          <DialogHeader className='p-4 pb-2'>
            <div className='flex items-center justify-between'>
              <DialogTitle className='text-sm font-medium text-gray-900'>
                {selectedImage?.fileName}
              </DialogTitle>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    handleDownload(
                      selectedImage?.fileUrl,
                      selectedImage?.fileName
                    )
                  }
                  className='mr-10 h-8 px-3'
                >
                  <Download className='mr-2 h-4 w-4' />
                  Download
                </Button>
                {/* <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setSelectedImage(null)}
                  className='h-8 w-8 p-0'
                >
                  <X className='h-4 w-4' />
                </Button> */}
              </div>
            </div>
          </DialogHeader>
          <div className='p-4 pt-0'>
            <div className='flex items-center justify-center overflow-hidden rounded-lg bg-gray-100'>
              <img
                src={selectedImage?.fileUrl}
                alt={selectedImage?.fileName}
                className='max-h-[70vh] max-w-full object-contain'
              />
            </div>
            {selectedImage?.fileSize && (
              <div className='mt-3 text-center text-xs text-gray-500'>
                File size: {(selectedImage.fileSize / 1024).toFixed(1)} KB
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
