import { ChangeEvent, useState } from "react";
import DatePicker from "react-datepicker";
import Address from "@components/DesignSystem/Address";
import { Alert } from "@components/components/alert";
import { PrimaryButton } from "@components/components/button";
import UserAvatar from "@components/DesignSystem/UserAvatar";
import AssignStakeholders from "@components/Project/overview/DetailsInput/AssignStakeholders";
import { Member } from "@components/Settings/Organization/types";
import { Dialog } from "@headlessui/react";
import {
  SpeakerWaveIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Stakeholders } from "@servicegeek/db/queries/project/getUsersForProject";
import { ProjectInfo } from "@lib/serverSidePropsUtils/getProjectInfo";
import {
  CalendarEventPatchBody,
  calenderEvents,
  createCalenderEventBody,
  deleteCalenderBody,
} from "@utils/hooks/useScheduler";
import clsx from "clsx";
import { getUnixTime, subDays, subMinutes } from "date-fns";
import { format } from "date-fns";
import Link from "next/link";

import "react-datepicker/dist/react-datepicker.css";

const CalenderEventModal = ({
  date,
  createEvent,
  editEvent,
  setOpen,
  existingCalenderEventSelected,
  projectId,
  projectInfo,
  deleteCalenderEvent,
  stakeholders,
}: {
  date: Date | undefined;
  createEvent: (body: createCalenderEventBody) => void;
  setOpen: (open: boolean) => void;
  existingCalenderEventSelected: calenderEvents | undefined;
  editEvent: (body: CalendarEventPatchBody) => void;
  deleteCalenderEvent?: (body: deleteCalenderBody) => void;
  projectId: string;
  projectInfo: ProjectInfo;
  teamMembers: Member[];
  stakeholders: Stakeholders[];
}) => {
  const [editAssignees, setEditAssignees] = useState(false);
  console.log("existingCalenderEventSelected", existingCalenderEventSelected);
  // submit button state
  const [loading, setIsLoading] = useState(false);
  // form state
  const [subject, setSubject] = useState(
    existingCalenderEventSelected?.subject ||
      projectInfo.clientName + " - reminder"
  );
  const [payload, setPayload] = useState(
    existingCalenderEventSelected?.payload || ""
  );
  const [remindClient, setRemindClient] = useState(
    existingCalenderEventSelected?.remindClient || false
  );
  const [remindProjectOwners, setRemindProjectOwners] = useState(
    existingCalenderEventSelected?.remindProjectOwners || false
  );
  const [inputError, setInputError] = useState("");
  const buttonTitle = existingCalenderEventSelected ? "Update" : "Save";
  const titleText = existingCalenderEventSelected
    ? "Edit Event"
    : "Schedule Event";
  const [startDate, setStartDate] = useState(
    existingCalenderEventSelected
      ? new Date(existingCalenderEventSelected?.date)
      : date
  );

  const [thirtyMin, setThirtyMin] = useState(false);
  const [oneHour, setOneHour] = useState(false);
  const [oneDay, setOneDay] = useState(false);

  const onSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    if (!subject || !startDate) {
      setInputError("Please complete the form to continue.");
      setIsLoading(false);
      return;
    }

    const calenderPromises = [];
    const starttime = startDate?.getTime() || new Date().getTime();
    const zone = new Date()
      .toLocaleTimeString("en-us", { timeZoneName: "short" })
      .split(" ")[2];
    try {
      calenderPromises.push(
        createEvent({
          subject,
          payload,
          date: getUnixTime(starttime),
          reminderDate: getUnixTime(
            oneDay
              ? subDays(starttime, 1)
              : oneHour
                ? subMinutes(starttime, 60)
                : thirtyMin
                  ? subMinutes(starttime, 30)
                  : starttime
          ),
          localizedTimeString: format(startDate, `h aa '${zone}' - MMM do`),
          remindClient,
          remindProjectOwners,
        })
      );

      await Promise.all(calenderPromises);

      setIsLoading(false);
      setOpen(false);
    } catch (error) {
      console.log(error);
      setInputError(
        "Failed to create event. Please reload the page and try again."
      );
      setIsLoading(false);
      return;
    }
  };

  // method to submit form on edit event
  const onEditSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    if (!subject || !payload || (!remindClient && !remindProjectOwners)) {
      setInputError("Please complete the form to continue.");
      setIsLoading(false);
      return;
    }

    const starttime = startDate?.getTime() || new Date().getTime();
    const zone = new Date()
      .toLocaleTimeString("en-us", { timeZoneName: "short" })
      .split(" ")[2];
    try {
      const res = await editEvent({
        calendarEventPublicId: existingCalenderEventSelected?.publicId || "",
        subject,
        payload,
        date: getUnixTime(starttime),
        reminderDate: getUnixTime(
          oneDay
            ? subDays(starttime, 1)
            : oneHour
              ? subMinutes(starttime, 60)
              : thirtyMin
                ? subMinutes(starttime, 30)
                : starttime
        ),
        localizedTimeString: format(
          startDate || new Date(),
          `h aa '${zone}' - MMM do`
        ),
        remindClient,
        remindProjectOwners,
      });
      setIsLoading(false);
      setOpen(false);
    } catch (error) {
      console.log(error);
      setInputError(
        "Failed to create event. Please reload the page and try again."
      );
      setIsLoading(false);
      return;
    }
  };

  const handleDate = (date: Date) => {
    setStartDate(date);
  };

  const canSetReminder = startDate
    ? startDate.getTime() > new Date().getTime()
    : false;
  const team = [
    {
      name: "Tom Cook",
      email: "tom.cook@example.com",
      href: "#",
      imageUrl:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      name: "Whitney Francis",
      email: "whitney.francis@example.com",
      href: "#",
      imageUrl:
        "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      name: "Leonard Krasner",
      email: "leonard.krasner@example.com",
      href: "#",
      imageUrl:
        "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      name: "Floyd Miles",
      email: "floyd.miles@example.com",
      href: "#",
      imageUrl:
        "https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      name: "Emily Selman",
      email: "emily.selman@example.com",
      href: "#",
      imageUrl:
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
  ];
  return (
    <>
      <form
        className='flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl'
        onSubmit={existingCalenderEventSelected ? onEditSubmit : onSubmit}
      >
        <div className='h-0 flex-1 overflow-y-auto'>
          <div className='bg-blue-600 px-4 py-6 sm:px-6'>
            <div className='flex items-center justify-between'>
              <Dialog.Title className='text-lg font-medium text-white'>
                {titleText}
              </Dialog.Title>
              <div className='ml-3 flex h-7 items-center'>
                <button
                  type='button'
                  className='rounded-md bg-blue-600 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white'
                  onClick={() => setOpen(false)}
                >
                  <span className='sr-only'>Close panel</span>
                  <XMarkIcon className='size-6' aria-hidden='true' />
                </button>
              </div>
            </div>
            <div className='mt-1'>
              <p className='text-sm text-indigo-300'>
                Get started by filling in the information below to create an
                event.
              </p>
            </div>
          </div>
          <div className='flex flex-1 flex-col justify-between'>
            {canSetReminder && !projectInfo.clientPhoneNumber && (
              <div className='p- m-5 flex flex-1 items-center rounded-md bg-gray-300 p-2'>
                <span className='flex rounded-lg p-2'>
                  <SpeakerWaveIcon
                    className='size-6 text-black'
                    aria-hidden='true'
                  />
                </span>
                <p className='ml-3 flex flex-col font-medium text-black'>
                  <span className='font-bold'>Missing client phone number</span>
                  <span className='inline'>
                    <>
                      If you would like to text a client, add their phone number
                      in{" "}
                      <Link
                        className='text-blue-600 hover:text-blue-800'
                        key={projectId}
                        href={`/projects/${projectId}/overview`}
                      >
                        project details
                      </Link>
                      .
                    </>
                  </span>
                </p>
              </div>
            )}
            <div className='divide-y divide-gray-200 px-4 sm:px-6'>
              <div className='space-y-6 pb-5 pt-6'>
                <div>
                  <label
                    htmlFor='project-name'
                    className='block text-sm font-medium text-gray-900'
                  >
                    Subject
                  </label>
                  <div className='mt-1'>
                    <input
                      type='text'
                      id='subject'
                      name='subject'
                      required
                      value={subject}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setSubject(e.target.value)
                      }
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm'
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor='project-name'
                    className='block text-sm font-medium text-gray-900'
                  >
                    Date
                  </label>
                  <div className='mt-1'>
                    <DatePicker
                      placeholderText='Click to pick a date'
                      selected={startDate}
                      onChange={(date: Date) => handleDate(date)}
                      showTimeSelect
                      dateFormat='MMMM d h:mm aa'
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm'
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor='description'
                    className='block text-sm font-medium text-gray-900'
                  >
                    Description
                  </label>
                  <div className='mt-1'>
                    <textarea
                      id='payload'
                      name='payload'
                      rows={3}
                      value={payload}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                        setPayload(e.target.value)
                      }
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm'
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor='description'
                    className='block text-sm font-medium text-gray-900'
                  >
                    Location
                  </label>
                  <div className='mt-1'>
                    <Address address={projectInfo.location} />
                  </div>
                </div>
                <hr />
                <div className='block text-sm font-medium text-gray-900'>
                  Text message options
                </div>

                {canSetReminder ? (
                  <>
                    <div className='flex-auto'>
                      <dl className='mt-2 flex flex-row text-gray-700'>
                        <div className='flex items-start space-x-3'>
                          <dt className='mt-0.5'>
                            <UserIcon
                              className='size-5 text-gray-400'
                              aria-hidden='true'
                            />
                          </dt>
                          <dd>Project Assignees to be notified</dd>
                          <button
                            onClick={() => setEditAssignees(!editAssignees)}
                            type='button'
                            className='ml-2 inline-flex items-center rounded border border-transparent bg-blue-100 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                          >
                            Edit
                          </button>
                        </div>
                      </dl>
                    </div>

                    {stakeholders && (
                      <div className='flex-auto'>
                        <dl className='flex flex-row text-gray-500'>
                          <div className='flex w-full items-start space-x-3'>
                            <ul className='grow space-y-4 bg-white px-4'>
                              {stakeholders?.map(({ user }) => (
                                <li
                                  key={`staleholder-${user.email}`}
                                  className='flex items-center'
                                >
                                  <UserAvatar
                                    email={user?.email}
                                    userId={user.email}
                                    firstName={user.firstName || undefined}
                                    lastName={user.lastName || undefined}
                                  />
                                  <div className='ml-4 flex flex-col justify-start truncate'>
                                    <div
                                      className={clsx(
                                        "font-semibold",
                                        "block truncate"
                                      )}
                                    >
                                      {user.firstName && user.lastName && (
                                        <span className='mr-2'>
                                          {user.firstName} {user.lastName}
                                        </span>
                                      )}
                                    </div>
                                    <span
                                      className={clsx(
                                        "text-gray-500",
                                        "font-semibold"
                                      )}
                                    >
                                      {user.phone}
                                    </span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </dl>
                      </div>
                    )}
                    {editAssignees && <AssignStakeholders />}
                    <div
                      className={clsx("text-base font-medium text-gray-700")}
                      aria-hidden='true'
                    >
                      Reminder Settings
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='col-span-2 sm:col-span-1'>
                        <div className='md:grid'>
                          <div className='md:col-span-2'>
                            <div className='overflow-hidden border border-gray-200 shadow sm:rounded-md'>
                              <div className='space-y-6 bg-white p-4'>
                                <fieldset>
                                  <div className='space-y-4'>
                                    <div className='flex items-start'>
                                      <div className='flex h-5 items-center'>
                                        <input
                                          id='30-before'
                                          name='30-before'
                                          type='checkbox'
                                          className='size-4 rounded border-gray-300 text-primary focus:ring-blue-500'
                                          checked={thirtyMin}
                                          onChange={(
                                            e: ChangeEvent<HTMLInputElement>
                                          ) => {
                                            setThirtyMin(e.target.checked);
                                          }}
                                        />
                                      </div>
                                      <div className='ml-3 text-sm'>
                                        <label
                                          htmlFor='30-before'
                                          className='font-medium text-gray-700'
                                        >
                                          30 mins before
                                        </label>
                                      </div>
                                    </div>
                                    <div className='flex items-start'>
                                      <div className='flex h-5 items-center'>
                                        <input
                                          id='1-hour-before'
                                          name='1-hour-before'
                                          type='checkbox'
                                          className='size-4 rounded border-gray-300 text-primary focus:ring-blue-500'
                                          checked={oneHour}
                                          onChange={(
                                            e: ChangeEvent<HTMLInputElement>
                                          ) => {
                                            setOneHour(e.target.checked);
                                          }}
                                        />
                                      </div>
                                      <div className='ml-3 text-sm'>
                                        <label
                                          htmlFor='1-hour-before'
                                          className='font-medium text-gray-700'
                                        >
                                          1 hour before
                                        </label>
                                      </div>
                                    </div>
                                    <div className='flex items-start'>
                                      <div className='flex h-5 items-center'>
                                        <input
                                          id='1-day-before'
                                          name='1-day-before'
                                          type='checkbox'
                                          className='size-4 rounded border-gray-300 text-primary focus:ring-blue-500'
                                          checked={oneDay}
                                          onChange={(
                                            e: ChangeEvent<HTMLInputElement>
                                          ) => {
                                            setOneDay(e.target.checked);
                                          }}
                                        />
                                      </div>
                                      <div className='ml-3 text-sm'>
                                        <label
                                          htmlFor='1-day-before'
                                          className='font-medium text-gray-700'
                                        >
                                          1 day before
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                </fieldset>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='col-span-2 sm:col-span-1'>
                        <fieldset className='space-y-5'>
                          <div className='relative flex items-start'>
                            <div className='flex h-5 items-center'>
                              <input
                                id='remind-project-assignees'
                                aria-describedby='remind-project-assignees'
                                name='remind-project-assignees'
                                disabled={!stakeholders.length}
                                type='checkbox'
                                checked={remindProjectOwners}
                                onChange={(
                                  e: ChangeEvent<HTMLInputElement>
                                ) => {
                                  // @ts-ignore
                                  setRemindProjectOwners(e.target.checked);
                                }}
                                className={`size-4 rounded border-gray-300 ${
                                  !stakeholders.length
                                    ? "text-gray-600"
                                    : "text-primary"
                                } focus:ring-blue-500`}
                              />
                            </div>
                            <div className='ml-3 text-sm'>
                              <label
                                htmlFor='remind-project-assignees'
                                className='font-medium text-gray-700'
                              >
                                Text Project Assignees
                              </label>
                              <p
                                id='remind-project-assignees'
                                className='text-gray-500'
                              >
                                Sends project assignees a reminder
                              </p>
                            </div>
                          </div>
                          <div className='relative flex items-start'>
                            <div className='flex h-5 items-center'>
                              <input
                                id='remind-client'
                                aria-describedby='remind-client'
                                name='Remind Client'
                                type='checkbox'
                                checked={remindClient}
                                disabled={!projectInfo.clientPhoneNumber}
                                onChange={(
                                  e: ChangeEvent<HTMLInputElement>
                                ) => {
                                  // @ts-ignore
                                  setRemindClient(e?.target?.checked);
                                }}
                                className={`size-4 rounded border-gray-300 ${
                                  !projectInfo.clientPhoneNumber
                                    ? "text-gray-600"
                                    : "text-primary"
                                } focus:ring-blue-500`}
                              />
                            </div>
                            <div className='ml-3 text-sm'>
                              <label
                                htmlFor='remind-client'
                                className='font-medium text-gray-700'
                              >
                                Text Client
                              </label>
                              <p id='remind-client' className='text-gray-500'>
                                Let the client know you are on your way @{" "}
                                {projectInfo.clientPhoneNumber}.
                              </p>
                            </div>
                          </div>
                        </fieldset>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    Note: Cannot schedule reminders for events in the past
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {inputError && (
          <Alert
            type='error'
            title='There was a problem, please try again later'
          >
            {inputError}
          </Alert>
        )}
        <div className='flex justify-end'>
          {existingCalenderEventSelected && deleteCalenderEvent && (
            <PrimaryButton
              className='my-4'
              onClick={() => {
                deleteCalenderEvent({
                  calendarEventPublicId: existingCalenderEventSelected.publicId,
                });
                setOpen(false);
              }}
              variant='danger'
            >
              Delete
            </PrimaryButton>
          )}
          <PrimaryButton type='submit' loading={loading} className='m-4 ml-2'>
            {buttonTitle}
          </PrimaryButton>
        </div>
      </form>
    </>
  );
};
export default CalenderEventModal;
