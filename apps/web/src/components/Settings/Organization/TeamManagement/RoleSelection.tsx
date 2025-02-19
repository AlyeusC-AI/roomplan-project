import { Fragment, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@components/components";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import useAmplitudeTrack from "@utils/hooks/useAmplitudeTrack";
import clsx from "clsx";
import { teamMembersStore } from "@atoms/team-members";
import { Database } from "@/types/database";

type AccessLevel = Database["public"]["Enums"]["AccessLevel"];

const RoleToDescription: Record<AccessLevel, string> = {
  admin: "Account Administrator",
  accountManager: "Account Manager",
  projectManager: "Project Manager",
  contractor: "Contractor",
  viewer: "Viewer",
  owner: "Owner",
};

interface PublishingOption {
  title: string;
  description: string;
  current: boolean;
  accessLevel: AccessLevel;
}
const publishingOptions: PublishingOption[] = [
  {
    title: RoleToDescription["admin"],
    description: "Full access.",
    current: true,
    accessLevel: "admin",
  },
  {
    title: RoleToDescription["accountManager"],
    description: "Access to everything except billing.",
    current: false,
    accessLevel: "accountManager",
  },
  {
    title: "projectManager",
    description:
      "Access to everything except billing, and organization settings",
    current: false,
    accessLevel: "projectManager",
  },
  {
    title: "contractor",
    description: "Only able to access projects that they are assigned to",
    current: false,
    accessLevel: "contractor",
  },
  {
    title: "viewer",
    description: "Only able to view projects that they are assigned to",
    current: false,
    accessLevel: "viewer",
  },
];

export default function RollSelection({ member }: { member: Assignee }) {
  const [loading, setIsLoading] = useState(false);
  const { track } = useAmplitudeTrack();
  const selected = publishingOptions.find(
    (o) => o.accessLevel === member.accessLevel
  );
  const onSelect = async (option: PublishingOption) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/organization/member/${member.user.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          accessLevel: option.accessLevel,
        }),
      });
      if (res.ok) {
        track("Update Organization Team Member Role");
        teamMembersStore
          .getState()
          .changeAccessLevel(member.user.id, option.accessLevel);
        // setTeamMembers((prevTeamMembers) => {
        //   const nextState = produce(prevTeamMembers, (draft) => {
        //     const memberIndex = prevTeamMembers.findIndex(
        //       (m) => m.user.id === member.user.id
        //     )
        //     draft[memberIndex] = {
        //       ...member,
        //       accessLevel: option.accessLevel,
        //     }
        //   })
        //   return nextState
        // })
        toast.success("Successfully updated user role");
      } else {
        toast.error("Could not update user role.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not update user role.");
    }
    setIsLoading(false);
  };
  return (
    <Listbox value={selected} onChange={onSelect} disabled={loading}>
      {({ open }) => (
        <>
          <Listbox.Label className='sr-only'>Change Role</Listbox.Label>
          <div className='relative'>
            <div className='inline-flex rounded-md shadow-sm'>
              <div className='inline-flex items-center rounded-l-md border border-gray-400 py-2 pl-3 pr-4 text-gray-500'>
                <p className='ml-2.5 text-sm font-medium'>
                  {loading ? (
                    <Spinner />
                  ) : (
                    <>{selected?.title || "Unset Role"}</>
                  )}
                </p>
              </div>
              <Listbox.Button
                disabled={loading}
                className='inline-flex items-center rounded-l-none rounded-r-md border border-l-0 border-gray-400 p-2 text-sm font-medium text-gray-500'
              >
                <span className='sr-only'>Change Role</span>
                <ChevronDownIcon
                  className='size-5 text-gray-500'
                  aria-hidden='true'
                />
              </Listbox.Button>
            </div>

            <Transition
              show={open}
              as={Fragment}
              leave='transition ease-in duration-100'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'
            >
              <Listbox.Options className='absolute right-0 z-10 mt-2 w-96 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
                {publishingOptions.map((option) => (
                  <Listbox.Option
                    key={option.title}
                    className={({ active }) =>
                      clsx(
                        active ? "bg-blue-500 text-white" : "text-gray-900",
                        "cursor-default select-none px-4 py-2 text-sm hover:cursor-pointer"
                      )
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <div className='flex flex-col'>
                        <div className='flex justify-between'>
                          <p
                            className={
                              selected ? "font-semibold" : "font-normal"
                            }
                          >
                            {option.title}
                          </p>
                          {selected ? (
                            <span
                              className={
                                active ? "text-white" : "text-blue-500"
                              }
                            >
                              <CheckIcon
                                className='size-5'
                                aria-hidden='true'
                              />
                            </span>
                          ) : null}
                        </div>
                        <p
                          className={clsx(
                            active ? "text-blue-200" : "text-gray-500",
                            "mt-1"
                          )}
                        >
                          {option.description}
                        </p>
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}
