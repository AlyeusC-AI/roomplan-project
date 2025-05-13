import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@components/ui/sheet";
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Mail,
  Phone,
  MapPin,
  Building,
  FileText,
  PlayCircle,
  CheckCircle,
  MapPin as MapPinIcon,
  Edit,
  Trash2,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Input } from "@components/ui/input";
import { Card } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Calendar } from "@components/ui/calendar";
import { Checkbox } from "@components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@components/ui/command";
import {
  CalendarBody,
  CalendarDate,
  CalendarDatePagination,
  CalendarDatePicker,
  CalendarHeader,
  CalendarItem,
  CalendarMonthPicker,
  CalendarProvider,
  CalendarYearPicker,
  useCalendar,
} from "@/components/roadmap-ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { format } from "date-fns";
import { cn } from "@lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { projectsStore } from "@atoms/projects";
import { useEffect, useState } from "react";
import { LoadingPlaceholder, LoadingSpinner } from "@components/ui/spinner";
import { DateTimePicker } from "@components/ui/date-time-picker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";
import { Badge } from "@components/ui/badge";
import { ScrollArea } from "@components/ui/scroll-area";
import { Separator } from "@components/ui/separator";
import { useRouter } from "next/navigation";
import { EventDetailsSheet } from "./event-details-sheet";
import { EventForm } from "./event-form";
import { EventsList } from "./events-list";
import { calendarEventSchema } from "./types";
import {
  useCreateCalendarEvent,
  useDeleteCalendarEvent,
  useGetCalendarEvents,
  useUpdateCalendarEvent,
  type CalendarEvent,
  type CreateCalendarEventDto,
} from "@service-geek/api-client";

export default function CalendarComponent({
  project = null,
}: {
  project: { id: string; organizationId: string } | null;
}) {
  const router = useRouter();
  const [createPopover, setCreatePopover] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [projectDetails, setProjectDetails] = useState<any>(null);
  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [projectDetailsLoading, setProjectDetailsLoading] = useState(false);

  const form = useForm<CreateCalendarEventDto>({
    resolver: zodResolver(calendarEventSchema),
    mode: "onChange",
  });
  const { month, year } = useCalendar();

  // Use the new hooks with date filtering
  const { data: events = [], isLoading } = useGetCalendarEvents(
    project?.id,
    new Date(year, month, 1),
    new Date(year, month + 1, 0)
  );
  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();

  function getEventStatus(eventDate: Date): { status: string; color: string } {
    const now = new Date();
    const timeDifference = eventDate.getTime() - now.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    let status: string;
    let color: string;

    if (daysDifference > 30) {
      status = "Future";
      color = "blue";
    } else if (daysDifference > 7) {
      status = "Upcoming";
      color = "green";
    } else if (daysDifference > 0) {
      status = "Soon";
      color = "orange";
    } else if (daysDifference === 0) {
      status = "Today";
      color = "red";
    } else {
      status = "Past";
      color = "gray";
    }

    return { status, color };
  }

  async function onSubmit() {
    const data = form.getValues();
    try {
      if (editingEvent) {
        await updateEvent.mutateAsync({
          id: editingEvent.id,
          data: {
            ...data,
            // start: data.start.toISOString(),
            // end: data.end.toISOString(),
          },
        });
        toast.success("Event updated successfully.");
      } else {
        await createEvent.mutateAsync({
          ...data,
          // date: data.start.toISOString(),
          // start: data.start.toISOString(),
          // end: data.end.toISOString(),
          // projectId: data.projectId?.toString(),
        });
        toast.success("Event created successfully.");
      }
      setShowProjectsModal(false);
    } catch (error) {
      // toast.error(
      //   editingEvent ? "Failed to update event." : "Failed to create event."
      // );
    }
  }

  const onDelete = async () => {
    try {
      const event = selectedEvent || editingEvent;
      if (!event) return;

      await deleteEvent.mutateAsync(event.id);
      setShowProjectsModal(false);
      setSelectedEvent(null);
      setEditingEvent(null);
      toast.success("Event deleted successfully.");
    } catch (error) {
      // toast.error("Failed to delete event.");
    }
  };

  const { projects } = projectsStore((state) => state);

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "completed":
        return "bg-blue-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // const handleEventClick = async (event: CalendarEvent) => {
  //   setSelectedEvent(event);

  //   if (event.projectId) {
  //     setProjectDetailsLoading(true);
  //     try {
  //       const response = await fetch(`/api/v1/projects/${event.projectId}`);
  //       if (response.ok) {
  //         const data = await response.json();
  //         setProjectDetails(data.data);
  //         if (data.data.location) {
  //           getGoogleMapsImageUrl(data.data.location);
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error fetching project details:", error);
  //     } finally {
  //       setProjectDetailsLoading(false);
  //     }
  //   }
  // };

  const getGoogleMapsImageUrl = async (address: string) => {
    try {
      setIsLoadingMap(true);
      if (projectDetails?.lat && projectDetails?.lng) {
        const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${projectDetails.lat},${projectDetails.lng}&zoom=14&size=600x300&maptype=roadmap&markers=color:red%7C${projectDetails.lat},${projectDetails.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
        setMapImageUrl(staticMapUrl);
      } else {
        const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(
          address
        )}&zoom=14&size=600x300&maptype=roadmap&markers=color:red%7C${encodeURIComponent(
          address
        )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
        setMapImageUrl(staticMapUrl);
      }
    } catch (error) {
      console.error("Error getting map image:", error);
    } finally {
      setIsLoadingMap(false);
    }
  };

  const handleNotificationClick = (type: "arrival" | "start" | "complete") => {
    if (selectedEvent) {
      router.push(
        `/notifications/${type}?projectId=${selectedEvent.projectId}&eventId=${selectedEvent.id}`
      );
    }
  };

  const addEvent = () => {
    setShowProjectsModal(true);
    setEditingEvent(null);
    setSelectedEvent(null);
    form.reset();
  };

  if (isLoading) {
    return <LoadingPlaceholder />;
  }

  return (
    <div className='mb-10 flex h-screen flex-col'>
      {/* Event Details Sheet */}
      <EventDetailsSheet
        event={selectedEvent}
        // projectDetails={projectDetails}
        mapImageUrl={mapImageUrl}
        onClose={() => setSelectedEvent(null)}
        isLoading={projectDetailsLoading}
        onEdit={() => {
          setEditingEvent(selectedEvent);
          setSelectedEvent(null);
          setShowProjectsModal(true);
        }}
        onDelete={() => setConfirmDelete(true)}
      />

      {/* Create/Edit Event Sheet */}
      <Sheet
        open={showProjectsModal}
        onOpenChange={() => {
          setShowProjectsModal(false);
          setEditingEvent(null);
        }}
      >
        <SheetContent className='overflow-y-scroll'>
          <SheetHeader>
            <SheetTitle>
              {editingEvent ? "Edit" : "Create"} Calendar Event
            </SheetTitle>
            <SheetDescription>
              {editingEvent ? "Edit an existing" : "Create a new"} calendar
              event.
            </SheetDescription>
          </SheetHeader>
          <EventForm
            form={form}
            onSubmit={onSubmit}
            isCreating={createEvent.isPending || updateEvent.isPending}
            editingEvent={editingEvent}
            createPopover={createPopover}
            setCreatePopover={setCreatePopover}
            project={project}
            setConfirmDelete={setConfirmDelete}
          />
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={deleteEvent.isPending}
            >
              {deleteEvent.isPending ? <LoadingSpinner /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className='my-4 lg:h-full'>
        <header className='flex items-center justify-between border-b border-gray-200 pb-4 pl-3 lg:flex-none'>
          <div className='space-y-0.5'>
            <h2 className='text-2xl font-bold tracking-tight'>Calendar</h2>
            <p className='text-muted-foreground'>
              All calendar reminders from all your projects.
            </p>
          </div>

          <div className='flex items-center'>
            <div className='hidden md:ml-4 md:flex md:items-center'>
              <Button onClick={addEvent}>Add event</Button>
            </div>
          </div>
        </header>

        <div className='mt-5 flex gap-6'>
          <Card className='flex-1'>
            <CalendarProvider>
              <CalendarDate>
                <CalendarDatePicker>
                  <CalendarMonthPicker />
                  <CalendarYearPicker
                    start={new Date().getFullYear()}
                    end={new Date().getFullYear() + 1}
                  />
                </CalendarDatePicker>
                <CalendarDatePagination />
              </CalendarDate>
              <CalendarHeader />
              <CalendarBody
                features={events.map((event) => {
                  const start = new Date(event.start ?? event.date);
                  const end = new Date(event.end ?? event.date);
                  const status = getEventStatus(start);
                  return {
                    id: event.id,
                    name: `${event.subject} - ${start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`,
                    startAt: start,
                    endAt: end,
                    status: {
                      id: status.status,
                      name: status.status,
                      color: status.color,
                    },
                  };
                })}
                onDateSelect={(date) => {
                  setSelectedDate(date);
                  // Update the date range when a new date is selected
                  const { start, end } = getMonthDateRange(date);
                  // The query will automatically refetch with new dates
                }}
                selectedDate={selectedDate}
              >
                {({ feature }) => (
                  <CalendarItem
                    onClick={() => {
                      const event = events.find(
                        (event) => event.id === feature.id
                      );
                      if (event) {
                        setSelectedEvent(event);
                      }
                    }}
                    key={feature.id}
                    feature={feature}
                  />
                )}
              </CalendarBody>
            </CalendarProvider>
          </Card>

          <Card className='w-96 p-4'>
            <EventsList
              events={events}
              selectedEvent={selectedEvent}
              projects={projects}
              onEventClick={(event) => {
                setSelectedEvent(event);
              }}
              onEditEvent={(event) => {
                setEditingEvent(event);
                setShowProjectsModal(true);
              }}
              onDeleteEvent={(event) => {
                setSelectedEvent(event);
                setConfirmDelete(true);
              }}
              getEventStatus={getEventStatus}
              onCreateEvent={addEvent}
              selectedDate={selectedDate}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
