/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import orgInfoState from '@atoms/orgInfoState'
import teamMembersState from '@atoms/teamMembers'
import PrimaryButton from '@components/DesignSystem/Buttons/PrimaryButton'
import TertiaryButton from '@components/DesignSystem/Buttons/TertiaryButton'
import GradientText from '@components/DesignSystem/GradientText'
import OrgMembersSection from '@components/Settings/Organization/TeamManagement/OrgMembersSection'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { trpc } from '@utils/trpc'
import Image from 'next/image'
import { useRecoilState } from 'recoil'

const people = [
  {
    name: 'Lindsay Walton',
    role: 'Front-end Developer',
    imageUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Courtney Henry',
    role: 'Designer',
    imageUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Tom Cook',
    role: 'Director, Product Development',
    imageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
]

export default function InviteInitialUsers() {
  const [orgInfo] = useRecoilState(orgInfoState)
  const [teamMembers] = useRecoilState(teamMembersState)
  const trpcContext = trpc.useContext()

  const setOnboardingStatus =
    trpc.onboardingStatus.setOnboardingStatus.useMutation({
      onSettled(result) {
        trpcContext.onboardingStatus.getOnboardingStatus.invalidate()
      },
    })

  const onContinue = () => {
    setOnboardingStatus.mutate({
      status: {
        seenInviteInitialUsers: true,
      },
    })
  }

  return (
    <div className="flex flex-col items-center justify-center pb-8 sm:mt-0">
      <div className="mb-8 flex flex-col items-center justify-center md:flex-row">
        <div className="relative flex h-64 w-64">
          <Image
            src="/images/onboarding/welcome-org.svg"
            height={861}
            width={853}
            alt="Man waving"
          />
        </div>
        <div>
          <h1 className="text-3xl sm:max-w-md">
            Welcome to Restoration<GradientText>X</GradientText>,
          </h1>
          <h1 className="text-3xl sm:max-w-md">
            <span className="font-bold">{orgInfo.name}</span>!
          </h1>
          <h2 className="my-4 text-xl font-medium leading-6 text-gray-900 sm:max-w-md">
            We&apos;re happy you&apos;re here.
          </h2>
          <p className="mt-1 text-base text-gray-500 sm:max-w-sm">
            Get started by inviting additional members to your organization.
          </p>
        </div>
      </div>
      <div className="w-full max-w-2xl">
        <h3 className="block text-sm font-medium text-gray-700">
          Invite Teammates
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Add members to your organization. They will recieve an invitation
          email allowing them to access the projects within this organization.
        </p>
        <OrgMembersSection
          invitations={[]}
          hideEmptyState
          hideDescription
          useSecondaryButton={teamMembers.length > 0}
          noPadding
        >
          <div>
            <PrimaryButton
              loading={setOnboardingStatus.isLoading}
              onClick={onContinue}
            >
              Continue <ArrowRightIcon className="ml-2 h-5 w-5" />
            </PrimaryButton>
            <h3 className="mt-4 block text-sm font-medium text-gray-700">
              Invited Teammates
            </h3>
          </div>
        </OrgMembersSection>
        <div>
          {teamMembers.length === 1 && (
            <TertiaryButton noPadding className="!p-0" onClick={onContinue}>
              Skip for now <ArrowRightIcon className="ml-2 h-5 w-5" />
            </TertiaryButton>
          )}
        </div>
      </div>
    </div>
  )
}
