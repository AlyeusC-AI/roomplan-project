import { format, isSameDay } from "date-fns";
import { Clock, Edit, Trash2, CalendarPlus, ChevronRight } from "lucide-react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { type CalendarEvent } from "./types";
import { type Project } from "@/types/project";

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
      const eventDate = event.start ? new Date(event.start) : new Date(event.date);
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
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{dateTitle}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateEvent}
          className="text-blue-600 hover:text-blue-700"
        >
          Add Event
        </Button>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-6">
          <CalendarPlus className="w-10 h-10 text-gray-400 mb-3" />
          <h4 className="text-base font-medium text-gray-900 mb-1">
            {isToday ? "No events for today" : "No events for this day"}
          </h4>
          <p className="text-sm text-gray-500 text-center mb-4">
            {isToday 
              ? "Create an event to get started" 
              : "Select another date or create a new event"}
          </p>
          <Button
            onClick={onCreateEvent}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create Event
          </Button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredEvents.map((event) => {
            const eventDate = event.start ? new Date(event.start) : new Date(event.date);
            const status = getEventStatus(eventDate);
            const project = projects.find((p) => p.id === event.projectId);

            return (
              <Card
                key={event.publicId}
                className="p-3 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => onEventClick(event)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {event.subject}
                          </h4>
                          <Badge
                            variant="secondary"
                            className={`bg-${status.color}-50 text-${status.color}-700 text-xs px-1.5 py-0`}
                          >
                            {status.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {event.payload}
                        </p>
                      </div>
                      <div className="flex flex-col items-end text-xs text-gray-500 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {format(eventDate, "h:mm a")}
                        </div>
                        {!isToday && (
                          <div className="text-gray-400">
                            {format(eventDate, "MMM d")}
                          </div>
                        )}
                      </div>
                    </div>
                    {project && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 text-xs px-1.5 py-0"
                        >
                          {project.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditEvent(event);
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEvent(event);
                      }}
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
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