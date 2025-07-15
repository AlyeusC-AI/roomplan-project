import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlayCircle } from "lucide-react";
import { useActiveOrganization } from "@service-geek/api-client";
import { CalendarEvent } from "@service-geek/api-client";
import { Project } from "@service-geek/api-client";

const createStartWorkMessageTemplate = (
  projectName: string,
  phoneNumber: string
) => {
  return `Hi, this is ${projectName}. I'm starting work on your project now. You can reach me at ${phoneNumber} if you need anything.`;
};

export function StartWorkNotification({
  onClose,
  project,
  event,
}: {
  onClose: () => void;
  project: Project;
  event: CalendarEvent;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 300;

  const org = useActiveOrganization();

  useEffect(() => {
    !isOpen && onClose();
  }, [isOpen]);

  useEffect(() => {
    // Initialize default message
    const defaultMessage = createStartWorkMessageTemplate(
      org?.name || "Service Geek",
      org?.phoneNumber || "(your phone number)"
    );
    setMessage(defaultMessage);
    setCharCount(defaultMessage.length);
  }, [org]);

  const handleMessageChange = (text: string) => {
    setMessage(text);
    setCharCount(text.length);
  };

  const handleSubmit = async () => {
    if (!project.id) {
      toast.error("Project information is missing");
      return;
    }

    if (!message) {
      toast.error("Please enter a message");
      return;
    }

    if (!org?.phoneNumber) {
      toast.error("Organization phone number is missing");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(
        "/api/v1/projects/calendar-events/notifications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: project.id,
            eventId: event.id,
            message,
            phoneNumber: project.clientPhoneNumber,
            notificationType: "start_work",
          }),
        }
      );

      if (response.ok) {
        toast.success("Start work notification sent successfully");
        setIsOpen(false);
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to send start work notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("An error occurred while sending the notification");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <PlayCircle className='h-5 w-5 text-cyan-600' />
            Send Start Work Notification
          </DialogTitle>
          <DialogDescription>
            Send a notification to inform about starting work on the project.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='message'>Message</Label>
            <Textarea
              id='message'
              placeholder='Enter your start work message...'
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              className='min-h-[100px]'
            />
            <div className='text-sm text-muted-foreground'>
              {charCount}/{MAX_CHARS} characters
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Notification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
