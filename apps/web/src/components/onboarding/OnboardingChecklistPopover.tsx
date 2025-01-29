// import { Fragment, useState } from "react";
// import { PrimaryButton, SecondaryButton } from "@components/components/button";
// import { TertiaryLink } from "@components/components/link";
// import { Dialog, Transition } from "@headlessui/react";
// import { CheckIcon } from "@heroicons/react/20/solid";
// import clsx from "clsx";

// const timeline = [
//   {
//     id: 1,
//     content: "Created your first",
//     target: "Project",
//     href: "#",
//     icon: CheckIcon,
//     iconBackground: "bg-green-500",
//   },
//   {
//     id: 2,
//     content: "Upload your first",
//     target: "Photos",
//     href: "#",
//     icon: CheckIcon,
//     iconBackground: "bg-green-500",
//   },
//   {
//     id: 3,
//     content: "Completed phone screening with",
//     target: "Martha Gardner",
//     href: "#",
//     icon: CheckIcon,
//     iconBackground: "bg-gray-500",
//   },
//   {
//     id: 4,
//     content: "Advanced to interview by",
//     target: "Bethany Blake",
//     href: "#",
//     icon: CheckIcon,
//     iconBackground: "bg-gray-500",
//   },
//   {
//     id: 5,
//     content: "Completed interview with",
//     target: "Katherine Snyder",
//     href: "#",
//     icon: CheckIcon,
//     iconBackground: "bg-gray-500",
//   },
// ];

// function CheckList() {
//   return (
//     <div className='flow-root'>
//       <ul role='list' className='-mb-8'>
//         {timeline.map((event, eventIdx) => (
//           <li key={event.id}>
//             <div className='relative pb-8'>
//               {eventIdx !== timeline.length - 1 ? (
//                 <span
//                   className='absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200'
//                   aria-hidden='true'
//                 />
//               ) : null}
//               <div className='relative flex space-x-3'>
//                 <div>
//                   <span
//                     className={clsx(
//                       event.iconBackground,
//                       "flex size-8 items-center justify-center rounded-full ring-8 ring-white"
//                     )}
//                   >
//                     <event.icon
//                       className='size-5 text-white'
//                       aria-hidden='true'
//                     />
//                   </span>
//                 </div>
//                 <div className='flex min-w-0 max-w-xs flex-1 justify-between space-x-4 pt-1.5'>
//                   <div>
//                     <p className='text-sm text-gray-500'>
//                       {event.content}{" "}
//                       <TertiaryLink href={event.href}>
//                         {event.target}
//                       </TertiaryLink>
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default function OnboardingChecklistPopover() {
//   const [open, setOpen] = useState(true);

//   return (
//     <Transition.Root
//       show={open} // @ts-ignore
//       as={Fragment}
//     >
//       <Dialog as='div' className='relative z-10' onClose={() => null}>
//         <div className='fixed bottom-0 right-0 z-10 overflow-y-auto p-4'>
//           <div className='flex items-end justify-center p-4 text-center sm:items-center sm:p-0'>
//             <Transition.Child
//               // @ts-ignore
//               as={Fragment}
//               enter='ease-out duration-300'
//               enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
//               enterTo='opacity-100 translate-y-0 sm:scale-100'
//               leave='ease-in duration-200'
//               leaveFrom='opacity-100 translate-y-0 sm:scale-100'
//               leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
//             >
//               <Dialog.Panel className='relative overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:w-full sm:max-w-3xl sm:p-6'>
//                 <CheckList />
//                 <div className='mt-5 flex items-center justify-center space-x-4 sm:mt-6'>
//                   <SecondaryButton type='button' onClick={() => setOpen(false)}>
//                     Complete
//                   </SecondaryButton>
//                   <PrimaryButton type='button' onClick={() => setOpen(false)}>
//                     Dismiss
//                   </PrimaryButton>
//                 </div>
//               </Dialog.Panel>
//             </Transition.Child>
//           </div>
//         </div>
//       </Dialog>
//     </Transition.Root>
//   );
// }
