"use client";

import { Badge } from "@components/ui/badge";
import { MessageCircle, Send, Trash2, Loader2 } from "lucide-react";
import { useChat, useCurrentUser } from "@service-geek/api-client";
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

interface ProjectConversationCardProps {
  projectId: string;
}

export default function ProjectConversationCard({
  projectId,
}: ProjectConversationCardProps) {
  const [message, setMessage] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: currentUser } = useCurrentUser();

  const {
    messages,
    loading,
    error,
    sendMessage,
    deleteMessage,
    loadMoreMessages,
    connected,
    typingUsers,
    hasMoreMessages,
  } = useChat({ projectId, autoConnect: true, enableNotifications: true });

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await sendMessage(message.trim());
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
            className='max-h-96 space-y-3 overflow-y-auto overflow-x-hidden'
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
              <div
                key={msg.id}
                className='group -m-2 flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50'
              >
                <div className='flex-shrink-0'>
                  <Badge
                    variant='secondary'
                    className='bg-blue-100 text-xs font-medium text-blue-700 hover:bg-blue-200'
                  >
                    {getUserInitials(msg.user.firstName, msg.user.lastName)}
                  </Badge>
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='mb-1 flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className='text-xs font-medium text-gray-900'>
                        {msg.user.firstName} {msg.user.lastName}
                      </div>
                      <div className='text-xs text-gray-400'>
                        {formatMessageTime(new Date(msg.createdAt))}
                      </div>
                    </div>
                    {isMessageSender(msg.user.id) && (
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-6 w-6 p-0 opacity-0 transition-opacity hover:bg-red-100 hover:text-red-600 group-hover:opacity-100'
                        onClick={() => handleDeleteClick(msg.id)}
                      >
                        <Trash2 className='h-3 w-3' />
                      </Button>
                    )}
                  </div>
                  <div className='break-words text-sm leading-relaxed text-gray-700'>
                    {msg.content}
                  </div>
                </div>
              </div>
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
          <div className='mt-4 flex gap-2'>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Type your message...'
              disabled={!connected}
              className='flex-1 border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500'
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || !connected}
              size='sm'
              className='bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300'
            >
              <Send className='h-4 w-4' />
            </Button>
          </div>
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
