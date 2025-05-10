import { Fragment, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@components/components";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import {
  OrganizationMembership,
  useUpdateMember,
} from "@service-geek/api-client";
import clsx from "clsx";

const RoleToDescription: Record<string, string> = {
  ADMIN: "Account Administrator",
  ACCOUNT_MANAGER: "Account Manager",
  PROJECT_MANAGER: "Project Manager",
  CONTRACTOR: "Contractor",
  MEMBER: "Member",
  OWNER: "Owner",
};

interface PublishingOption {
  title: string;
  description: string;
  current: boolean;
  role: string;
}

const publishingOptions: PublishingOption[] = [
  {
    title: RoleToDescription["ADMIN"],
    description: "Full access to all organization features.",
    current: true,
    role: "ADMIN",
  },
  {
    title: RoleToDescription["ACCOUNT_MANAGER"],
    description: "Access to everything except billing.",
    current: false,
    role: "ACCOUNT_MANAGER",
  },
  {
    title: RoleToDescription["PROJECT_MANAGER"],
    description:
      "Access to everything except billing and organization settings.",
    current: false,
    role: "PROJECT_MANAGER",
  },
  {
    title: RoleToDescription["CONTRACTOR"],
    description: "Only able to access projects that they are assigned to.",
    current: false,
    role: "CONTRACTOR",
  },
  {
    title: RoleToDescription["MEMBER"],
    description: "Basic access to assigned projects.",
    current: false,
    role: "MEMBER",
  },
  {
    title: RoleToDescription["OWNER"],
    description: "Full access to all organization features.",
    current: false,
    role: "OWNER",
  },
];

interface RoleSelectionProps {
  member: OrganizationMembership;
  orgId: string;
  onRoleChange?: () => void;
}

export default function RoleSelection({
  member,
  orgId,
  onRoleChange,
}: RoleSelectionProps) {
  const [loading, setIsLoading] = useState(false);
  const updateMember = useUpdateMember();
  const selected = publishingOptions.find((o) => o.role === member.role);

  const onSelect = async (option: PublishingOption) => {
    setIsLoading(true);
    try {
      await updateMember.mutateAsync({
        orgId,
        memberId: member.id,
        data: { role: option.role },
      });
      toast.success("Successfully updated user role");
      onRoleChange?.();
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
