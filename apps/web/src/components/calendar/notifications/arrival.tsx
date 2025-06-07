import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MapPin, Clock } from "lucide-react";
import { createClient } from "@lib/supabase/client";
import { Slider } from "@components/ui/slider";
import { Switch } from "@components/ui/switch";

const createArrivalMessageTemplate = (
  projectName: string,
  phoneNumber: string,
  arrivalTime: number = 30
) => {
  return `Hi, this is ${projectName}. I'm heading your way and will be there in ${arrivalTime} minutes. You can reach me at ${phoneNumber} if you need anything.`;
};

export function ArrivalNotification({ onClose,project,event }: { onClose: () => void,project:Project,event:CalendarEvent }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [org, setOrg] = useState<any | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [arrivalTime, setArrivalTime] = useState(30);
  const [status, setStatus] = useState<"heading" | "late">("heading");
  const MAX_CHARS = 300;

  useEffect(() => {
    !isOpen && onClose();
  }, [isOpen]);

  useEffect(() => {
    const fetchOrg = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.user_metadata?.organizationId) return;

      const { data, error } = await supabase
        .from("Organization")
        .select("*")
        .eq("publicId", session.user.user_metadata.organizationId)
        .single();

      if (error) {
        console.error("Error fetching organization:", error);
      } else {
        setOrg(data);
        // Initialize default message
        const defaultMessage = createArrivalMessageTemplate(
          data?.name || "Service Geek",
          data?.phoneNumber || "(your phone number)",
          arrivalTime
        );
        setMessage(defaultMessage);
        setCharCount(defaultMessage.length);
      }
    };
    fetchOrg();
  }, []);

  // Update message when arrival time changes
  useEffect(() => {
    if (org && message.includes("minutes")) {
      const updatedMessage = message.replace(
        /\d+ minutes/,
        `${arrivalTime} minutes`
      );
      setMessage(updatedMessage);
      setCharCount(updatedMessage.length);
    }
  }, [arrivalTime]);

  // Update message when status changes
  useEffect(() => {
    if (org && message) {
      let updatedMessage = message;

      if (status === "late" && !message.includes("running late")) {
        updatedMessage = message.replace(
          "heading your way",
          "running late but will be there"
        );
      } else if (status === "heading" && message.includes("running late")) {
        updatedMessage = message.replace(
          "running late but will be there",
          "heading your way"
        );
      }

      setMessage(updatedMessage);
      setCharCount(updatedMessage.length);
    }
  }, [status]);

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
      const response = await fetch("/api/v1/projects/calendar-events/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: project.id,
          eventId: event.id,
          message,
          phoneNumber: project.clientPhoneNumber,
          notificationType: "arrival",
          arrivalTime,
          status,
        }),
      });

      if (response.ok) {
        toast.success("Arrival notification sent successfully");
        setIsOpen(false);
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to send arrival notification");
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
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Send Arrival Notification
          </DialogTitle>
          <DialogDescription>
            Send a notification to inform about your arrival time.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your arrival message..."
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="text-sm text-muted-foreground">
              {charCount}/{MAX_CHARS} characters
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Arrival Time</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {arrivalTime} minutes
                  </span>
                </div>
              </div>
              <Slider
                value={[arrivalTime]}
                onValueChange={(value: number[]) => setArrivalTime(value[0])}
                min={5}
                max={120}
                step={5}
                className="py-2"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {status === "heading" ? "On Time" : "Running Late"}
                </span>
                <Switch
                  checked={status === "late"}
                  onCheckedChange={(checked) =>
                    setStatus(checked ? "late" : "heading")
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
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