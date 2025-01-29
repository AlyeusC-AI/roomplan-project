import { orgStore } from "@atoms/organization";
import { teamMembersStore } from "@atoms/team-members";
import { PrimaryButton, TertiaryButton } from "@components/components/button";
import OrgMembersSection from "@app/(logged-in)/settings/organization/members";
import { ArrowRight } from "lucide-react";
import { trpc } from "@utils/trpc";
import Image from "next/image";

export default function InviteInitialUsers() {
  const orgInfo = orgStore((state) => state.organization);
  const teamMembers = teamMembersStore((state) => state.teamMembers);
  const trpcContext = trpc.useContext();

  const setOnboardingStatus =
    trpc.onboardingStatus.setOnboardingStatus.useMutation({
      onSettled(result) {
        trpcContext.onboardingStatus.getOnboardingStatus.invalidate();
      },
    });

  const onContinue = () => {
    setOnboardingStatus.mutate({
      status: {
        seenInviteInitialUsers: true,
      },
    });
  };

  return (
    <div className='flex flex-col items-center justify-center pb-8 sm:mt-0'>
      <div className='mb-8 flex flex-col items-center justify-center md:flex-row'>
        <div className='relative flex size-64'>
          <Image
            src='/images/onboarding/welcome-org.svg'
            height={861}
            width={853}
            alt='Man waving'
          />
        </div>
        <div>
          <h1 className='text-3xl sm:max-w-md'>Welcome to Service Geek,</h1>
          <h1 className='text-3xl sm:max-w-md'>
            <span className='font-bold'>{orgInfo?.name}</span>!
          </h1>
          <h2 className='my-4 text-xl font-medium leading-6 text-gray-900 sm:max-w-md'>
            We&apos;re happy you&apos;re here.
          </h2>
          <p className='mt-1 text-base text-gray-500 sm:max-w-sm'>
            Get started by inviting additional members to your organization.
          </p>
        </div>
      </div>
      <div className='w-full max-w-2xl'>
        <h3 className='block text-sm font-medium text-gray-700'>
          Invite Teammates
        </h3>
        <p className='mt-1 text-sm text-gray-500'>
          Add members to your organization. They will recieve an invitation
          email allowing them to access the projects within this organization.
        </p>
        {/* <OrgMembersSection
          hideDescription
          useSecondaryButton={teamMembers.length > 0}
          noPadding
        >
          <div>
            <PrimaryButton
              loading={setOnboardingStatus.isLoading}
              onClick={onContinue}
            >
              Continue <ArrowRight className='ml-2 size-5' />
            </PrimaryButton>
            <h3 className='mt-4 block text-sm font-medium text-gray-700'>
              Invited Teammates
            </h3>
          </div>
        </OrgMembersSection> */}
        <div>
          {teamMembers.length === 1 && (
            <TertiaryButton noPadding className='!p-0' onClick={onContinue}>
              Skip for now <ArrowRight className='ml-2 size-5' />
            </TertiaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
