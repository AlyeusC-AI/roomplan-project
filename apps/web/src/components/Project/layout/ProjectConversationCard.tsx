"use client";

import { Badge } from "@components/ui/badge";
import {
  MessageCircle,
  Send,
  Trash2,
  Loader2,
  Edit2,
  Paperclip,
  Image,
  File,
} from "lucide-react";
import {
  useChat,
  useCurrentUser,
  chatService,
  MessageType,
} from "@service-geek/api-client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { format, isToday, isYesterday } from "date-fns";
import { uploadFile } from "@service-geek/api-client/src/services/space";
import MessageItem from "./MessageItem";
import MessageInput from "./MessageInput";

interface ProjectConversationCardProps {
  projectId: string;
}

export default function ProjectConversationCard({
  projectId,
}: ProjectConversationCardProps) {
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: currentUser } = useCurrentUser();

  // Get or create project chat
  useEffect(() => {
    const initializeProjectChat = async () => {
      try {
        setLoading(true);
        // Create project chat - backend will automatically add all project members
        const projectChat = await chatService.createProjectChat(projectId);
        console.log("🚀 ~ initializeProjectChat ~ projectChat:", projectChat);
        setChatId(projectChat.id);
      } catch (err) {
        console.error("Failed to initialize project chat:", err);
        setError("Failed to load project chat");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      initializeProjectChat();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className='flex flex-col bg-background shadow-sm'>
        <div className='flex flex-row items-center justify-between p-4 pb-2'>
          <div className='flex items-center gap-2 text-base font-semibold'>
            <div className='rounded-lg bg-blue-50 p-1.5'>
              <MessageCircle className='h-5 w-5 text-blue-600' />
            </div>
            <div>
              <div className='font-semibold'>Project Conversation</div>
            </div>
          </div>
        </div>
        <div className='p-4 pt-3'>
          <div className='py-8 text-center'>
            <Loader2 className='mx-auto mb-2 h-6 w-6 animate-spin text-gray-400' />
            <div className='text-sm text-muted-foreground'>Loading chat...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !chatId) {
    return (
      <div className='flex flex-col bg-background shadow-sm'>
        <div className='flex flex-row items-center justify-between p-4 pb-2'>
          <div className='flex items-center gap-2 text-base font-semibold'>
            <div className='rounded-lg bg-blue-50 p-1.5'>
              <MessageCircle className='h-5 w-5 text-blue-600' />
            </div>
            <div>
              <div className='font-semibold'>Project Conversation</div>
            </div>
          </div>
        </div>
        <div className='p-4 pt-3'>
          <div className='py-8 text-center'>
            <div className='rounded-lg border-2 border-dashed border-red-200 bg-red-50 p-4'>
              <MessageCircle className='mx-auto mb-2 h-8 w-8 text-red-400' />
              <div className='text-sm text-red-600'>
                {error || "Failed to load chat"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChatInterface
      chatId={chatId}
      currentUser={currentUser}
      projectId={projectId}
    />
  );
}

interface ChatInterfaceProps {
  chatId: string;
  currentUser: any;
  projectId: string;
}

function ChatInterface({ chatId, currentUser, projectId }: ChatInterfaceProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [editMessageId, setEditMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    loading,
    error,
    sendMessage,
    updateMessage,
    deleteMessage,
    loadMoreMessages,
    connected,
    typingUsers,
    hasMoreMessages,
  } = useChat({ chatId, autoConnect: true, enableNotifications: true });

  const handleSendMessage = async (
    content: string,
    type: MessageType = MessageType.TEXT,
    attachments?: any[],
    replyToId?: string
  ) => {
    try {
      await sendMessage(content, type, attachments, replyToId);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      await updateMessage(messageId, content);
      setEditMessageId(null);
      setEditContent("");
    } catch (error) {
      console.error("Failed to edit message:", error);
    }
  };

  const handleDeleteClick = (messageId: string) => {
    setMessageToDelete(messageId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;

    try {
      await deleteMessage(messageToDelete);
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setMessageToDelete(null);
  };

  const handleEditClick = (message: any) => {
    setEditMessageId(message.id);
    setEditContent(message.content);
  };

  const handleCancelEdit = () => {
    setEditMessageId(null);
    setEditContent("");
  };

  const handleReplyClick = (message: any) => {
    setReplyingTo(message);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Ensure messages is always an array
  const safeMessages = Array.isArray(messages) ? messages : [];

  return (
    <>
      <div className='flex flex-col bg-background shadow-sm'>
        <div className='flex flex-row items-center justify-between p-4 pb-2'>
          <div className='flex items-center gap-2 text-base font-semibold'>
            <div className='rounded-lg bg-blue-50 p-1.5'>
              <MessageCircle className='h-5 w-5 text-blue-600' />
            </div>
            <div>
              <div className='font-semibold'>Project Conversation</div>
              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                <div
                  className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}
                />
                {connected ? "Live" : "Offline"}
              </div>
            </div>
          </div>
        </div>

        <div className='p-4 pt-3'>
          {error && (
            <div className='mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600'>
              <div className='h-2 w-2 rounded-full bg-red-500'></div>
              {error}
            </div>
          )}

          {typingUsers.length > 0 && (
            <div className='mb-3 flex items-center gap-2 text-xs text-muted-foreground'>
              <div className='flex space-x-1'>
                <div className='h-2 w-2 animate-bounce rounded-full bg-gray-400'></div>
                <div
                  className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              {typingUsers.length === 1
                ? "Someone is typing..."
                : `${typingUsers.length} people are typing...`}
            </div>
          )}

          <div
            ref={scrollRef}
            className='scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 max-h-[600px] space-y-3 overflow-y-auto overflow-x-hidden'
          >
            {hasMoreMessages && (
              <div className='py-2 text-center'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={loadMoreMessages}
                  disabled={loading}
                  className='text-xs hover:bg-blue-50'
                >
                  {loading ? (
                    <>
                      <Loader2 className='mr-1 h-3 w-3 animate-spin' />
                      Loading...
                    </>
                  ) : (
                    "Load More Messages"
                  )}
                </Button>
              </div>
            )}

            {safeMessages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                currentUser={currentUser}
                onDelete={handleDeleteClick}
                onEdit={handleEditClick}
                onReply={handleReplyClick}
                isEditing={editMessageId === msg.id}
                editContent={editContent}
                onEditSubmit={handleEditMessage}
                onEditCancel={handleCancelEdit}
              />
            ))}

            {safeMessages.length === 0 && !loading && (
              <div className='py-8 text-center'>
                <div className='rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-4'>
                  <MessageCircle className='mx-auto mb-2 h-8 w-8 text-gray-400' />
                  <div className='text-sm text-muted-foreground'>
                    No messages yet. Start the conversation!
                  </div>
                </div>
              </div>
            )}

            {loading && safeMessages.length === 0 && (
              <div className='py-8 text-center'>
                <Loader2 className='mx-auto mb-2 h-6 w-6 animate-spin text-gray-400' />
                <div className='text-sm text-muted-foreground'>
                  Loading messages...
                </div>
              </div>
            )}
          </div>

          {/* Message input */}
          <MessageInput
            onSendMessage={handleSendMessage}
            connected={connected}
            projectId={projectId}
            replyingTo={replyingTo}
            onCancelReply={handleCancelReply}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
