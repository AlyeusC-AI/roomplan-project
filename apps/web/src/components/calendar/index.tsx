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
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
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

const calendarEventSchema = z.object({
  subject: z
    .string()
    .min(2, {
      message: "Event subject must be at least 2 characters.",
    })
    .max(30, {
      message: "Event subject must not be longer than 30 characters.",
    }),
  projectId: z.number(),
  payload: z
    .string()
    .min(2, {
      message: "Event message must be at least 2 characters.",
    })
    .max(200, {
      message: "Event message must not be longer than 200 characters.",
    }),
  remindProjectOwners: z.boolean().optional(),
  remindClient: z.boolean().optional(),
  start: z.date({
    required_error: "Date is required",
  }),
  end: z.date({
    required_error: "Date is required",
  }),
  reminderDate: z.date().optional(),
});

type CreateEventValues = z.infer<typeof calendarEventSchema>;

export default function CalendarComponent({
  project = null,
}: {
  project: Project | null;
}) {
  const [createPopover, setCreatePopover] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<CreateEventValues>({
    resolver: zodResolver(calendarEventSchema),
    mode: "onChange",
  });

  useEffect(() => {
    fetch(
      `/api/v1/projects/calendar-events${project ? `?projectId=${project.id}` : ""}`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setLoading(false);
        setEvents(data.data);
      });
  }, []);

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

  async function onSubmit(data: CreateEventValues) {
    try {
      setIsCreating(true);
      const response = await fetch("/api/v1/projects/calendar-events", {
        method: editingEvent ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          id: editingEvent?.id,
          organizationId: project?.organizationId,
        }),
      });

      if (response.ok) {
        const event = await response.json();
        if (editingEvent) {
          setEvents(
            events.map((e) =>
              event.publicId === editingEvent.publicId ? event : e
            )
          );
        } else {
          setEvents([...events, event.data]);
        }
        setShowProjectsModal(false);
        toast.success(
          editingEvent
            ? "Event updated successfully."
            : "Event created successfully."
        );
      } else {
        toast.error(
          editingEvent ? "Failed to update event." : "Failed to create event."
        );
      }
    } catch {
      toast.error(
        editingEvent ? "Failed to update event." : "Failed to create event."
      );
    }

    setIsCreating(false);
  }

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch("/api/v1/projects/calendar-events", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicId: editingEvent?.publicId,
        }),
      });

      if (response.ok) {
        setEvents(
          events.filter((event) => event.publicId !== editingEvent?.publicId)
        );
        setShowProjectsModal(false);
        toast.success("Event deleted successfully.");
      } else {
        toast.error("Failed to delete event.");
      }
    } catch {
      toast.error("Failed to delete event.");
    }

    setIsDeleting(false);
  };

  const { projects } = projectsStore((state) => state);

  if (loading) {
    return <LoadingPlaceholder />;
  }

  return (
    <div className='mb-10 flex h-screen flex-col'>
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
          <Form {...form}>
            <form className='space-y-8 pt-3'>
              <FormField
                control={form.control}
                name='projectId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <FormControl>
                      <Popover
                        open={createPopover}
                        onOpenChange={setCreatePopover}
                      >
                        <PopoverTrigger disabled={project != null} asChild>
                          <Button
                            variant='outline'
                            role='combobox'
                            aria-expanded={createPopover}
                            className='w-full justify-between'
                          >
                            {(project?.publicId ?? field.value)
                              ? projects.find(
                                  (framework) => framework.id === field.value
                                )?.name
                              : "Select project..."}
                            <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-full p-0'>
                          <Command>
                            <CommandInput placeholder='Search projects...' />
                            <CommandList>
                              <CommandEmpty>No project found.</CommandEmpty>
                              <CommandGroup>
                                {projects.map((project) => (
                                  <CommandItem
                                    key={project.publicId}
                                    value={project.name}
                                    onSelect={() => {
                                      field.onChange(
                                        project.id === field.value
                                          ? 0
                                          : project.id
                                      );
                                      setCreatePopover(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === project.id
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {project.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormDescription>
                      Select the project you want for your event.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='subject'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Subject</FormLabel>
                    <FormControl>
                      <Input placeholder='Event Name' {...field} />
                    </FormControl>
                    <FormDescription>The name of your event.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='payload'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Description</FormLabel>
                    <FormControl>
                      <Input placeholder='Event Description' {...field} />
                    </FormControl>
                    <FormDescription>
                      The description of your event.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='start'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Start Date</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                      {/* <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className='mr-2 size-4' />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-full p-0'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover> */}
                    </FormControl>
                    <FormDescription>
                      The time you want your event to start.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='end'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event End Date</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                      {/* <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className='mr-2 size-4' />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-full p-0'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover> */}
                    </FormControl>
                    <FormDescription>
                      The end time of your event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='reminderDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Reminder Date</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className='mr-2 size-4' />
                            {field.value ? (
                              format(field.value ?? Date.now(), "PPP")
                            ) : (
                              <span>Pick a reminder date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-full p-0'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormDescription>
                      The date you want to remind your client about the event.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Reminders</FormLabel>
                <FormField
                  control={form.control}
                  name='remindProjectOwners'
                  render={({ field }) => (
                    <div className='mt-3 flex items-center space-x-2'>
                      <Checkbox
                        id='terms1'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <div className='grid gap-1.5 leading-none'>
                        <label
                          htmlFor='terms1'
                          className='text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                        >
                          Remind Project Owners
                        </label>
                      </div>
                    </div>
                  )}
                />
                <FormField
                  control={form.control}
                  name='remindClient'
                  render={({ field }) => (
                    <div className='mt-3 flex items-center space-x-2'>
                      <Checkbox
                        id='terms1'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <div className='grid gap-1.5 leading-none'>
                        <label
                          htmlFor='terms1'
                          className='text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                        >
                          Remind Client
                        </label>
                      </div>
                    </div>
                  )}
                />

                <FormDescription>
                  Select who you'd like to remind about the event.
                </FormDescription>
                <FormMessage />
              </FormItem>
            </form>
            <div className='mt-3 flex justify-between'>
              {editingEvent && (
                <Button
                  variant='destructive'
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete
                </Button>
              )}
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={isCreating}
              >
                {isCreating ? (
                  <LoadingSpinner />
                ) : editingEvent ? (
                  "Update Event"
                ) : (
                  "Create Event"
                )}
              </Button>
            </div>
          </Form>
        </SheetContent>
      </Sheet>
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
            <AlertDialogAction onClick={onDelete} disabled={isDeleting}>
              {isDeleting ? <LoadingSpinner /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className='my-4 lg:h-full'>
        <header className='flex items-center justify-between border-b border-gray-200 pb-4 pl-3 lg:flex-none'>
          <div className='space-y-0.5'>
            <h2 className='text-2xl font-bold tracking-tight'>Calendar</h2>
            <p className='text-muted-foreground'>
              All calender reminders from all your projects.
            </p>
          </div>

          <div className='flex items-center'>
            <div className='hidden md:ml-4 md:flex md:items-center'>
              <Button onClick={() => setShowProjectsModal(true)}>
                Add event
              </Button>
            </div>
          </div>
        </header>
        <Card className='mt-5'>
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
                  id: event.publicId,
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
            >
              {({ feature }) => (
                <CalendarItem
                  onClick={() => {
                    const event = events.find(
                      (event) => event.publicId === feature.id
                    );

                    if (!event) {
                      return;
                    }

                    setEditingEvent(event);
                    form.setValue("projectId", event.projectId!);
                    form.setValue("subject", event.subject);
                    form.setValue("payload", event.payload);
                    form.setValue("start", new Date(event.start ?? event.date));
                    form.setValue("end", new Date(event.end ?? event.date));
                    form.setValue(
                      "remindProjectOwners",
                      event.remindProjectOwners
                    );
                    form.setValue("remindClient", event.remindClient);
                    setShowProjectsModal(true);
                  }}
                  key={feature.id}
                  feature={feature}
                />
              )}
            </CalendarBody>
          </CalendarProvider>
        </Card>
      </div>
    </div>
  );
}
