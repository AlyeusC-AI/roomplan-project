// import UserAvatar from "@components/DesignSystem/UserAvatar";
// import { Assignee } from "@servicegeek/db/queries/project/listProjects";
// import clsx from "clsx";

// const StakeholdersCalendarLegend = ({
//   stakeholders,
// }: {
//   stakeholders: Assignee[];
// }) => {
//   if (!stakeholders) return null;

//   return (
//     <div className='hidden sm:block'>
//       <div
//         className={`relative flex h-full ${
//           stakeholders.length > 0 &&
//           "mr-36 size-4 min-h-4 min-w-4 sm:size-8 sm:min-h-8 sm:min-w-8"
//         }`}
//       >
//         {stakeholders?.map((a, i) => (
//           <div
//             key={a.userId}
//             className='h-full'
//             style={{ left: `${i * 15}px` }}
//           >
//             <UserAvatar
//               className={clsx(
//                 "size-4 min-h-4 min-w-4 sm:size-8 sm:min-h-8 sm:min-w-8"
//               )}
//               textSize='text-xs'
//               userId={a.userId}
//               firstName={a.user.firstName}
//               lastName={a.user.lastName}
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default StakeholdersCalendarLegend;
