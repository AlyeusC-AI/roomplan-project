"use client";

import React from "react";
import { Bell, MessageSquare, AlertCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NotificationPopoverProps {
  headerNotifications?: Array<{
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "error";
    timestamp: string;
  }>;
  contactNotifications?: Array<{
    id: string;
    name: string;
    message: string;
    timestamp: string;
    unread: boolean;
  }>;
  onNotificationClick?: (id: string) => void;
  onContactClick?: (id: string) => void;
}

const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  headerNotifications = [],
  contactNotifications = [],
  onNotificationClick,
  onContactClick,
}) => {
  const totalUnread = contactNotifications.filter(n => n.unread).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='px-4 py-2 relative'>
          <Bell size={32} />
          {totalUnread > 0 && (
            <Badge 
              variant='destructive' 
              className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center'
            >
              {totalUnread > 9 ? "9+" : totalUnread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80' align='start'>
        <div className='space-y-2'>
          <h4 className='font-medium leading-none'>Notifications</h4>
          <p className='text-sm text-muted-foreground'>
            Stay updated with your latest activities
          </p>
        </div>
        
        {/* Header Notifications */}
        {headerNotifications.length > 0 && (
          <div className='mt-4'>
            <h5 className='text-sm font-medium mb-2 flex items-center'>
              <AlertCircle className='mr-2 h-4 w-4' />
              System Notifications
            </h5>
            <div className='space-y-2 max-h-32 overflow-y-auto'>
              {headerNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className='p-2 rounded-md border cursor-pointer hover:bg-muted/50'
                  onClick={() => onNotificationClick?.(notification.id)}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <p className='text-sm font-medium'>{notification.title}</p>
                      <p className='text-xs text-muted-foreground'>
                        {notification.message}
                      </p>
                    </div>
                    <span className='text-xs text-muted-foreground'>
                      {notification.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Notifications */}
        {contactNotifications.length > 0 && (
          <div className='mt-4'>
            <h5 className='text-sm font-medium mb-2 flex items-center'>
              <MessageSquare className='mr-2 h-4 w-4' />
              Contact Messages
            </h5>
            <div className='space-y-2 max-h-32 overflow-y-auto'>
              {contactNotifications.map((contact) => (
                <div
                  key={contact.id}
                  className={`p-2 rounded-md border cursor-pointer hover:bg-muted/50 ${
                    contact.unread ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => onContactClick?.(contact.id)}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <p className='text-sm font-medium'>{contact.name}</p>
                      <p className='text-xs text-muted-foreground'>
                        {contact.message}
                      </p>
                    </div>
                    <div className='flex flex-col items-end'>
                      {contact.unread && (
                        <div className='w-2 h-2 bg-blue-500 rounded-full mb-1' />
                      )}
                      <span className='text-xs text-muted-foreground'>
                        {contact.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {headerNotifications.length === 0 && contactNotifications.length === 0 && (
          <div className='mt-4 text-center py-4'>
            <Bell className='mx-auto h-8 w-8 text-muted-foreground mb-2' />
            <p className='text-sm text-muted-foreground'>No notifications yet</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPopover; 