"use client";

import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Send, Paperclip, Image, File, Loader2, X, Reply } from "lucide-react";
import { MessageType } from "@service-geek/api-client";
import { uploadFile } from "@service-geek/api-client/src/services/space";
import { useState, useRef, useEffect } from "react";

interface MessageInputProps {
  onSendMessage: (
    content: string,
    type?: MessageType,
    attachments?: any[],
    replyToId?: string
  ) => Promise<void>;
  connected: boolean;
  projectId: string;
  replyingTo?: any;
  onCancelReply?: () => void;
}

export default function MessageInput({
  onSendMessage,
  connected,
  projectId,
  replyingTo,
  onCancelReply,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) return;

    try {
      const messageType =
        attachments.length > 0
          ? attachments.some(
              (att) =>
                att.mimeType?.startsWith("image/") ||
                att.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)
            )
            ? MessageType.IMAGE
            : MessageType.FILE
          : MessageType.TEXT;

      await onSendMessage(
        message.trim() || (attachments.length > 0 ? "Shared file" : ""),
        messageType,
        attachments,
        replyingTo?.id
      );

      setMessage("");
      setAttachments([]);
      onCancelReply?.();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === "Escape") {
      onCancelReply?.();
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    setIsUploading(true);
    const newAttachments: any[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split(".").pop();
        const fileName = `${projectId}/${timestamp}-${i}.${fileExtension}`;

        // Upload file
        const uploadResult = await uploadFile(file, fileName);

        newAttachments.push({
          fileName: file.name,
          fileUrl: uploadResult.publicUrl,
          fileSize: file.size,
          mimeType: file.type,
          thumbnailUrl: file.type.startsWith("image/")
            ? uploadResult.publicUrl
            : undefined,
        });
      }

      setAttachments((prev) => [...prev, ...newAttachments]);
    } catch (error) {
      console.error("Failed to upload files:", error);
      alert("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileUpload(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const renderAttachment = (attachment: any, index: number) => {
    const isImage =
      attachment.mimeType?.startsWith("image/") ||
      attachment.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    return (
      <div
        key={index}
        className='flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2'
      >
        {isImage ? (
          <Image className='h-4 w-4 text-blue-500' />
        ) : (
          <File className='h-4 w-4 text-gray-500' />
        )}
        <div className='min-w-0 flex-1'>
          <div className='truncate text-xs font-medium text-gray-900'>
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
          onClick={() => removeAttachment(index)}
          className='h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600'
        >
          ×
        </Button>
      </div>
    );
  };

  return (
    <div className='space-y-3'>
      {/* Reply preview */}
      {replyingTo && (
        <div className='rounded-lg border-l-4 border-green-200 bg-green-50 p-3'>
          <div className='mb-1 flex items-center justify-between'>
            <div className='flex min-w-0 flex-1 items-center gap-2'>
              <Reply className='h-3 w-3 flex-shrink-0 text-green-600' />
              <div className='truncate text-xs font-medium text-green-700'>
                Replying to {replyingTo.user.firstName}{" "}
                {replyingTo.user.lastName}
              </div>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={onCancelReply}
              className='h-5 w-5 flex-shrink-0 p-0 hover:bg-green-100 hover:text-green-700'
            >
              <X className='h-3 w-3' />
            </Button>
          </div>
          <div
            className='max-h-10 overflow-hidden text-xs text-green-600'
            style={{
              wordBreak: "break-word",
              overflowWrap: "break-word",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {replyingTo.content}
          </div>
        </div>
      )}

      {/* File attachments preview */}
      {attachments.length > 0 && (
        <div className='space-y-2'>
          <div className='text-xs font-medium text-gray-700'>
            Attachments ({attachments.length})
          </div>
          <div className='space-y-2'>
            {attachments.map((attachment, index) =>
              renderAttachment(attachment, index)
            )}
          </div>
        </div>
      )}

      {/* Message input */}
      <div className='flex gap-2'>
        <Input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            replyingTo
              ? "Type your reply..."
              : attachments.length > 0
                ? "Add a message (optional)..."
                : "Type your message..."
          }
          disabled={!connected || isUploading}
          className='flex-1 border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500'
        />

        {/* File upload button */}
        <Button
          variant='outline'
          size='sm'
          onClick={() => fileInputRef.current?.click()}
          disabled={!connected || isUploading}
          className='px-3'
        >
          {isUploading ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Paperclip className='h-4 w-4' />
          )}
        </Button>

        {/* Send button */}
        <Button
          onClick={handleSendMessage}
          disabled={
            (!message.trim() && attachments.length === 0) ||
            !connected ||
            isUploading
          }
          size='sm'
          className='bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300'
        >
          <Send className='h-4 w-4' />
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type='file'
        multiple
        accept='image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx'
        onChange={handleFileSelect}
        className='hidden'
      />

      {/* Upload progress */}
      {isUploading && (
        <div className='flex items-center gap-2 text-xs text-gray-500'>
          <Loader2 className='h-3 w-3 animate-spin' />
          Uploading files...
        </div>
      )}
    </div>
  );
}
