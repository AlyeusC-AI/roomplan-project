import { Button } from "@components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Checkbox } from "@components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@components/ui/command";
import { DateTimePicker } from "@components/ui/date-time-picker";
import { LoadingSpinner } from "@components/ui/spinner";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@lib/utils";
import { projectsStore } from "@atoms/projects";
import { UseFormReturn } from "react-hook-form";
import { CreateEventValues } from "./types";
import { useEffect } from "react";

type EventFormProps = {
  form: UseFormReturn<CreateEventValues>;
  onSubmit: (data: CreateEventValues) => Promise<void>;
  isCreating: boolean;
  editingEvent: CalendarEvent | null;
  createPopover: boolean;
  setCreatePopover: (value: boolean) => void;
  project?: Project | null;
  setConfirmDelete: (value: boolean) => void;
};

export function EventForm({
  form,
  onSubmit,
  isCreating,
  editingEvent,
  createPopover,
  setCreatePopover,
  project,
  setConfirmDelete,
}: EventFormProps) {
  const { projects } = projectsStore((state) => state);

  useEffect(() => {
    if (editingEvent) {
      form.setValue("projectId", editingEvent.projectId || 0);
      form.setValue("subject", editingEvent.subject || "");
      form.setValue("payload", editingEvent.payload || "");
      form.setValue("start", editingEvent.start ? new Date(editingEvent.start) : new Date());
      form.setValue("end", editingEvent.end ? new Date(editingEvent.end) : new Date());
      form.setValue("remindClient", editingEvent.remindClient || false);
      form.setValue("remindProjectOwners", editingEvent.remindProjectOwners || false);
      form.setValue("reminderTime", editingEvent.reminderTime as "24h" | "2h" | "40m" | undefined || undefined);
    }
  }, [editingEvent, form]);

  return (
    <Form {...form}>
      <form className='space-y-8 pt-3'>
        <FormField
          control={form.control}
          name='projectId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project (optional)</FormLabel>
              <FormControl>
                <Popover
                  open={createPopover}
                  onOpenChange={setCreatePopover}
                  modal
                >
                  <PopoverTrigger disabled={project != null} asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      aria-expanded={createPopover}
                      className='w-full justify-between'
                    >
                      {field.value
                        ? projects.find(
                            (p) => p.id === field.value
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
                  setDate={(date) => {
                    field.onChange(date);
                    // Set end date to 1 hour after start date
                    const endDate = new Date(date);
                    endDate.setHours(endDate.getHours() + 1);
                    form.setValue("end", endDate);
                  }}
                />
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
                  setDate={(date) => {
                    field.onChange(date);
                  }}
                />
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
          name='reminderTime'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reminder Time</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className='flex flex-col space-y-1'
                >
                  <FormItem className='flex items-center space-x-3 space-y-0'>
                    <FormControl>
                      <RadioGroupItem value='24h' />
                    </FormControl>
                    <FormLabel className='font-normal'>
                      24 hours before
                    </FormLabel>
                  </FormItem>
                  <FormItem className='flex items-center space-x-3 space-y-0'>
                    <FormControl>
                      <RadioGroupItem value='2h' />
                    </FormControl>
                    <FormLabel className='font-normal'>
                      2 hours before
                    </FormLabel>
                  </FormItem>
                  <FormItem className='flex items-center space-x-3 space-y-0'>
                    <FormControl>
                      <RadioGroupItem value='40m' />
                    </FormControl>
                    <FormLabel className='font-normal'>
                      40 minutes before
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormDescription>
                Select when you want to be reminded about the event.
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
      </form>
    </Form>
  );
} 