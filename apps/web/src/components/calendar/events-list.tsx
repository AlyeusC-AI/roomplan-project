import { format, isSameDay } from "date-fns";
import { Clock, Edit, Trash2, CalendarPlus, ChevronRight } from "lucide-react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { CalendarEvent } from "@service-geek/api-client";

import { Project } from "@service-geek/api-client";
interface EventsListProps {
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  projects: Project[];
  onEventClick: (event: CalendarEvent) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (event: CalendarEvent) => void;
  getEventStatus: (date: Date) => { status: string; color: string };
  onCreateEvent: () => void;
  selectedDate?: Date;
}

export function EventsList({
  events,
  selectedEvent,
  projects,
  onEventClick,
  onEditEvent,
  onDeleteEvent,
  getEventStatus,
  onCreateEvent,
  selectedDate,
}: EventsListProps) {
  const now = new Date();
  const targetDate = selectedDate || now;

  const filteredEvents = events
    .filter((event) => {
      const eventDate = event.start
        ? new Date(event.start)
        : new Date(event.date);
      return isSameDay(eventDate, targetDate);
    })
    .sort((a, b) => {
      const dateA = a.start ? new Date(a.start) : new Date(a.date);
      const dateB = b.start ? new Date(b.start) : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

  const isToday = isSameDay(targetDate, now);
  const dateTitle = isToday
    ? "Today's Events"
    : format(targetDate, "EEEE, MMMM d");

  return (
    <div className='flex h-full flex-col'>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>{dateTitle}</h3>
          <p className='mt-1 text-sm text-gray-500'>
            {filteredEvents.length}{" "}
            {filteredEvents.length === 1 ? "event" : "events"}
          </p>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={onCreateEvent}
          className='text-blue-600 hover:text-blue-700'
        >
          Add Event
        </Button>
      </div>

      {filteredEvents.length === 0 ? (
        <div className='flex flex-1 flex-col items-center justify-center rounded-lg bg-gray-50 p-6'>
          <CalendarPlus className='mb-3 h-10 w-10 text-gray-400' />
          <h4 className='mb-1 text-base font-medium text-gray-900'>
            {isToday ? "No events for today" : "No events for this day"}
          </h4>
          <p className='mb-4 text-center text-sm text-gray-500'>
            {isToday
              ? "Create an event to get started"
              : "Select another date or create a new event"}
          </p>
          <Button
            onClick={onCreateEvent}
            size='sm'
            className='bg-blue-600 text-white hover:bg-blue-700'
          >
            Create Event
          </Button>
        </div>
      ) : (
        <div className='flex-1 space-y-2 overflow-y-auto pr-1'>
          {filteredEvents.map((event) => {
            const eventDate = event.start
              ? new Date(event.start)
              : new Date(event.date);
            const status = getEventStatus(eventDate);
            const project = projects.find((p) => p.id === event.projectId);

            return (
              <Card
                key={event.id}
                className='cursor-pointer p-3 transition-all hover:shadow-sm'
                onClick={() => onEventClick(event)}
              >
                <div className='flex items-start gap-3'>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2'>
                          <h4 className='truncate text-sm font-medium text-gray-900'>
                            {event.subject}
                          </h4>
                          <Badge
                            variant='secondary'
                            className={`bg-${status.color}-50 text-${status.color}-700 px-1.5 py-0 text-xs`}
                          >
                            {status.status}
                          </Badge>
                        </div>
                        <p className='mt-0.5 line-clamp-2 text-xs text-gray-500'>
                          {event.description}
                        </p>
                      </div>
                      <div className='flex flex-col items-end whitespace-nowrap text-xs text-gray-500'>
                        <div className='flex items-center'>
                          <Clock className='mr-1 h-3 w-3' />
                          {format(eventDate, "h:mm a")}
                        </div>
                        {!isToday && (
                          <div className='text-gray-400'>
                            {format(eventDate, "MMM d")}
                          </div>
                        )}
                      </div>
                    </div>
                    {project && (
                      <div className='mt-2 flex items-center gap-1.5'>
                        <Badge
                          variant='secondary'
                          className='bg-blue-50 px-1.5 py-0 text-xs text-blue-700'
                        >
                          {project.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className='flex items-center gap-1'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-6 w-6 hover:bg-gray-100'
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditEvent(event);
                      }}
                    >
                      <Edit className='h-3 w-3' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-6 w-6 hover:bg-red-50'
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEvent(event);
                      }}
                    >
                      <Trash2 className='h-3 w-3 text-red-500' />
                    </Button>
                    <ChevronRight className='h-4 w-4 text-gray-400' />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
