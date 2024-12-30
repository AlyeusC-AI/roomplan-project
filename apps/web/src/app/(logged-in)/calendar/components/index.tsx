import Calendar, { CalendarOptions } from '@fullcalendar/react' // ALERT: ordering of these imports matter https://github.com/fullcalendar/fullcalendar/issues/6371
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import '@fullcalendar/common/main.css' // @fullcalendar/react imports @fullcalendar/common
import '@fullcalendar/daygrid/main.css' // @fullcalendar/timegrid imports @fullcalendar/daygrid
import '@fullcalendar/timegrid/main.css' // @fullcalendar/timegrid is a direct import

export default function FullCalendar(props: CalendarOptions) {
  return (
    <div className="relative z-0 flex flex-col overflow-auto break-words rounded-2xl border-0 bg-white bg-clip-border p-1 shadow-xl marker:min-w-0">
      <Calendar
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        eventStartEditable={false}
        initialView="dayGridMonth"
        editable={true}
        businessHours={{
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6, 7],
          startTime: '09:00',
          endTime: '17:30',
        }}
        scrollTime="09:00"
        selectable={true}
        allDaySlot={false}
        duration={'00:30:00'}
        slotLabelInterval={'00:30:00'}
        selectMirror={true}
        dayMaxEvents={true}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        {...props}
      />
    </div>
  )
}
