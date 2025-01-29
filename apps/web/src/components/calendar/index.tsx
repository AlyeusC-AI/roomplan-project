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
import { useState } from "react";

const calendarEventSchema = z.object({
  subject: z
    .string()
    .min(2, {
      message: "Event subject must be at least 2 characters.",
    })
    .max(30, {
      message: "Event subject must not be longer than 30 characters.",
    }),
  projectId: z.string().min(1, { message: "Project is required" }),
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
  date: z.date({
    required_error: "Date is required",
  }),
  reminderDate: z.date().optional(),
});

type CreateEventValues = z.infer<typeof calendarEventSchema>;

export default function CalendarComponent({
  events,
}: {
  events: CalendarEvent[];
}) {
  const form = useForm<CreateEventValues>({
    resolver: zodResolver(calendarEventSchema),
    mode: "onChange",
  });

  const [createPopover, setCreatePopover] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);

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

  function onSubmit(data: CreateEventValues) {
    toast("You submitted the following values:", {
      description: (
        <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
          <code className='text-white'>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  const { projects } = projectsStore((state) => state);

  return (
    <div className='flex h-screen flex-col'>
      {showProjectsModal && (
        <Sheet open={showProjectsModal} onOpenChange={setShowProjectsModal}>
          <SheetContent className='overflow-y-scroll'>
            <SheetHeader>
              <SheetTitle>New Calendar Event</SheetTitle>
              <SheetDescription>Create a new calendar event.</SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-8 pt-3'
              >
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
                          <PopoverTrigger asChild>
                            <Button
                              variant='outline'
                              role='combobox'
                              aria-expanded={createPopover}
                              className='w-full justify-between'
                            >
                              {field.value
                                ? projects.find(
                                    (framework) =>
                                      framework.publicId === field.value
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
                                          project.publicId === field.value
                                            ? ""
                                            : project.publicId
                                        );
                                        setCreatePopover(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === project.publicId
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
                  name='date'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date</FormLabel>
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
                        </Popover>
                      </FormControl>
                      <FormDescription>
                        The date you want your event to take place.
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
                <Button type='submit'>Create Event</Button>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      )}
      <div className='lg:h-full'>
        <header className='flex items-center justify-between border-b border-gray-200 pb-4 pl-3 lg:flex-none'>
          <div className='space-y-0.5'>
            <h2 className='text-2xl font-bold tracking-tight'>Calendar</h2>
            <p className='text-muted-foreground'>
              All calender reminders from all your projects.
            </p>
          </div>

          <div className='flex items-center'>
            <div className='hidden md:ml-4 md:flex md:items-center'>
              <div className='ml-6 h-6 w-px bg-gray-300' />
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
                const date = new Date(event.date);
                const status = getEventStatus(date);
                return {
                  id: event.publicId,
                  name: event.subject,
                  startAt: date,
                  endAt: date,
                  status: {
                    id: status.status,
                    name: status.status,
                    color: status.color,
                  },
                };
              })}
            >
              {({ feature }) => (
                <CalendarItem key={feature.id} feature={feature} />
              )}
            </CalendarBody>
          </CalendarProvider>
        </Card>
        {/* <FullCalendar
                eventStartEditable={false}
                editable={false}
                eventClick={(e) => handleEventClick(e, projects ?? [])}
                events={(allEvents ?? []).map((event) => ({
                  title: `Project: ${event.project?.name} \n Subject: ${event.subject}`,
                  start: event.date,
                  id: event.publicId,
                }))}
              ></FullCalendar> */}
      </div>
    </div>
  );
}
