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
import { Check, ChevronsUpDown, Users, Search, X } from "lucide-react";
import { cn } from "@lib/utils";
import { projectsStore } from "@atoms/projects";
import { teamMembersStore } from "@atoms/team-members";
import { UseFormReturn } from "react-hook-form";
import { CreateEventValues } from "./types";
import { useEffect, useState } from "react";

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
  const { teamMembers } = teamMembersStore();
  console.log("🚀 ~ teamMembers:", teamMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMemberSelectorOpen, setIsMemberSelectorOpen] = useState(false);
  const selectedUsers = form.watch("users") || [];
  useEffect(() => {
    fetch("/api/v1/organization/members")
      .then((res) => res.json())
      .then((data) => {
        teamMembersStore.getState().setTeamMembers(data.members);
      });
  }, []);
  const filteredMembers = teamMembers.filter((member) => {
    const fullName =
      `${member.firstName || ""} ${member.lastName || ""}`.trim();
    const email = member.email || "";
    return (
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSelect = (userId: string) => {
    const currentUsers = form.getValues("users") || [];
    const isSelected = currentUsers.includes(userId);
    if (isSelected) {
      form.setValue(
        "users",
        currentUsers.filter((id) => id !== userId)
      );
    } else {
      form.setValue("users", [...currentUsers, userId]);
    }
  };

  useEffect(() => {
    if (editingEvent) {
      console.log("🚀 ~ useEffect ~ editingEvent:", editingEvent);
      form.setValue("projectId", editingEvent.projectId || 0);
      form.setValue("subject", editingEvent.subject || "");
      form.setValue("payload", editingEvent.payload || "");
      form.setValue(
        "start",
        editingEvent.start ? new Date(editingEvent.start) : new Date()
      );
      form.setValue(
        "end",
        editingEvent.end ? new Date(editingEvent.end) : new Date()
      );
      form.setValue("remindClient", editingEvent.remindClient || false);
      form.setValue(
        "remindProjectOwners",
        editingEvent.remindProjectOwners || false
      );
      form.setValue(
        "reminderTime",
        (editingEvent.reminderTime as "24h" | "2h" | "40m" | undefined) ||
          undefined
      );
      form.setValue("users", editingEvent.users || []);
    } else {
      form.reset();
    }
  }, [editingEvent]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 pt-3'>
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
                        ? projects.find((p) => p.id === field.value)?.name
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
                                  project.id === field.value ? 0 : project.id
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
              <FormDescription>The description of your event.</FormDescription>
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
              <FormDescription>The end time of your event</FormDescription>
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
                  value={field.value}
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
                  id='remindProjectOwners'
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <div className='grid gap-1.5 leading-none'>
                  <label
                    htmlFor='remindProjectOwners'
                    className='text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  >
                    Remind Project Owners
                  </label>
                </div>
              </div>
            )}
          />

          {form.watch("remindProjectOwners") && (
            <div className='mt-4'>
              <FormLabel>Select Project Owners to Notify</FormLabel>
              <Popover
                open={isMemberSelectorOpen}
                onOpenChange={setIsMemberSelectorOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={isMemberSelectorOpen}
                    className='w-full justify-between'
                  >
                    <div className='flex items-center gap-2'>
                      <Users className='h-4 w-4' />
                      <span>
                        {selectedUsers.length > 0
                          ? `${selectedUsers.length} member${selectedUsers.length > 1 ? "s" : ""} selected`
                          : "Select members to notify"}
                      </span>
                    </div>
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-full p-0'>
                  <Command>
                    <div className='flex items-center border-b px-3'>
                      <Search className='mr-2 h-4 w-4 shrink-0 opacity-50' />
                      <CommandInput
                        placeholder='Search members...'
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                    </div>
                    <CommandList>
                      <CommandEmpty>No members found.</CommandEmpty>
                      <FormField
                        control={form.control}
                        name='users'
                        render={({ field }) => (
                          <CommandGroup>
                            {filteredMembers.map((member) => {
                              const isSelected = selectedUsers.includes(
                                member.userId
                              );
                              return (
                                <CommandItem
                                  key={member.id}
                                  value={member.id}
                                  onSelect={() => handleSelect(member.userId)}
                                >
                                  <div className='flex items-center gap-2'>
                                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10'>
                                      <span className='text-sm font-medium'>
                                        {member.firstName?.[0]}
                                        {member.lastName?.[0] ||
                                          member.email?.[0]}
                                      </span>
                                    </div>
                                    <div>
                                      <div className='text-sm font-medium'>
                                        {member.firstName} {member.lastName}
                                      </div>
                                      <div className='text-xs text-muted-foreground'>
                                        {member.email}
                                      </div>
                                    </div>
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      isSelected ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        )}
                      />
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          <FormField
            control={form.control}
            name='remindClient'
            render={({ field }) => (
              <div className='mt-3 flex items-center space-x-2'>
                <Checkbox
                  id='terms2'
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <div className='grid gap-1.5 leading-none'>
                  <label
                    htmlFor='terms2'
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
          <Button type='submit' disabled={isCreating}>
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
