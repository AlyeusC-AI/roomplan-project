"use client";

import { Fragment, useState } from "react";
import { ScaleLoader } from "react-spinners";
import { PrimaryButton } from "@components/components/button";
import { Dialog, Transition } from "@headlessui/react";
import useScheduler, { calenderEvents } from "@utils/hooks/useScheduler";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

import CalenderEventModal from "../../../calendar/components/event-modal";

const FullCalendar = dynamic(() => import("../../../calendar/components"), {
  ssr: false,
  loading: () => (
    <div className='flex size-full items-center justify-center'>
      <ScaleLoader color='#2563eb' />
    </div>
  ),
});

export default function Calender() {
  const router = useSearchParams();
  const id = router?.get("id");
  const {
    calenderEvents,
    createCalenderEvent,
    updateCalenderEvent,
    deleteCalenderEvent,
  } = useScheduler({
    projectId: id as string,
  });
  const [timeStamp, setTimeStamp] = useState<Date>();
  const [isCreateCalenderEventModalOpen, setIsCreateCalenderEventModalOpen] =
    useState(false);
  const [existingCalenderEventSelected, setExistingCalenderEventSelected] =
    useState<calenderEvents>();

  const handleDateSelect = (selectInfo: any) => {
    setExistingCalenderEventSelected(undefined);
    const timeStamp: Date = new Date(selectInfo.start.getTime());
    setTimeStamp(timeStamp);
    setIsCreateCalenderEventModalOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    setExistingCalenderEventSelected(
      calenderEvents.find(
        (event) => event.publicId === clickInfo.event._def.publicId
      )
    );
    setIsCreateCalenderEventModalOpen(true);
  };

  return (
    <>
      <div className='mb-4 flex justify-between space-x-6'>
        <div className='max-w-[220px] sm:max-w-none sm:flex-auto'>
          <div className='col-span-2 flex-col'>
            <h3 className='text-2xl font-medium leading-6 text-gray-900'>
              Calendar
            </h3>
            <p className='mt-2 pr-8 text-base text-gray-500'>
              Create calendar events and text reminders for your project.
            </p>
          </div>
        </div>
        <div className='flex min-w-[100px] flex-col space-y-6'>
          <PrimaryButton
            onClick={() => {
              setExistingCalenderEventSelected(undefined);
              setIsCreateCalenderEventModalOpen(true);
            }}
          >
            New Event
          </PrimaryButton>
        </div>
      </div>
      <div className='lg:flex lg:h-full lg:flex-col'>
        <FullCalendar
          events={calenderEvents.map((event) => ({
            title: event.subject,
            start: event.date,
            id: event.publicId,
          }))}
          select={handleDateSelect}
          eventClick={handleEventClick}
        ></FullCalendar>

        <Transition.Root show={isCreateCalenderEventModalOpen} as={Fragment}>
          <Dialog
            as='div'
            className='relative z-10'
            onClose={setIsCreateCalenderEventModalOpen}
          >
            <Transition.Child
              as={Fragment}
              enter='ease-in-out duration-2000'
              enterFrom='opacity-0'
              enterTo='opacity-50'
              leave='ease-in-out duration-2000'
              leaveFrom='opacity-50'
              leaveTo='opacity-0'
            >
              <div className='fixed inset-0 bg-gray-500 bg-opacity-30 transition-opacity' />
            </Transition.Child>

            <div className='fixed inset-0 overflow-hidden'>
              <div className='absolute inset-0 overflow-hidden'>
                <div className='pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10'>
                  <Transition.Child
                    as={Fragment}
                    enter='transform transition ease-in-out duration-500 sm:duration-700'
                    enterFrom='translate-x-full'
                    enterTo='translate-x-0'
                    leave='transform transition ease-in-out duration-500 sm:duration-700'
                    leaveFrom='translate-x-0'
                    leaveTo='translate-x-full'
                  >
                    <Dialog.Panel className='pointer-events-auto relative w-96'>
                      <CalenderEventModal
                        date={timeStamp}
                        teamMembers={teamMembers}
                        projectId={id as string}
                        projectInfo={projectInfo}
                        createEvent={createCalenderEvent}
                        editEvent={updateCalenderEvent}
                        setOpen={setIsCreateCalenderEventModalOpen}
                        deleteCalenderEvent={deleteCalenderEvent}
                        existingCalenderEventSelected={
                          existingCalenderEventSelected
                        }
                        stakeholders={stakeholders}
                      ></CalenderEventModal>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </div>
    </>
  );
}
