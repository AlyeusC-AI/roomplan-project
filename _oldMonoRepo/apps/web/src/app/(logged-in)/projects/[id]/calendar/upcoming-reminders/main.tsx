"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import useScheduler, { calenderEvents } from "@utils/hooks/useScheduler";

export default function UpcomingReminders() {
  const router = useSearchParams();
  const id = router?.get("id");
  const {
    calenderEvents,
    createCalenderEvent,
    deleteCalenderEvent,
    updateCalenderEvent,
  } = useScheduler({
    projectId: id as string,
  });
  const [timeStamp, setTimeStamp] = useState<Date>();
  const [isCreateCalenderEventModalOpen, setIsCreateCalenderEventModalOpen] =
    useState(false);
  const [existingCalenderEventSelected, setExistingCalenderEventSelected] =
    useState<calenderEvents>();

  const handleEditUpcomingEvent = (publicId: string) => {
    setExistingCalenderEventSelected(
      calenderEvents.find((event) => event.publicId === publicId)
    );
    setIsCreateCalenderEventModalOpen(true);
  };

  return (
    <></>
    // <div className='lg:flex lg:h-full lg:flex-col'>
    //   <CalenderUpcomingEvents
    //     calenderEvents={calenderEvents}
    //     deleteCalenderEvent={deleteCalenderEvent}
    //     handleEditUpcomingEvent={handleEditUpcomingEvent}
    //     projectId={id as string}
    //   />
    //   <Modal
    //     open={isCreateCalenderEventModalOpen}
    //     setOpen={setIsCreateCalenderEventModalOpen}
    //     className='sm:max-w-3xl'
    //   >
    //     {() => (
    //       <CalenderEventModal
    //         date={timeStamp}
    //         teamMembers={teamMembers}
    //         projectId={id as string}
    //         projectInfo={projectInfo}
    //         createEvent={createCalenderEvent}
    //         editEvent={updateCalenderEvent}
    //         setOpen={setIsCreateCalenderEventModalOpen}
    //         existingCalenderEventSelected={existingCalenderEventSelected}
    //         stakeholders={stakeholders}
    //       ></CalenderEventModal>
    //     )}
    //   </Modal>
    // </div>
  );
}
