"use client";

import { projectStore } from "@atoms/project";

import { LoadingPlaceholder } from "@components/ui/spinner";

// const Description = ({ location }: { location: string }) => {
//   const propertyDataInfo = propertyDataStore((state) => state);
//   return (
//     <span className='flex flex-col'>
//       <span className='block'>{location}</span>
//       <span className='flex flex-row'>
//         {propertyDataInfo.bathrooms && (
//           <span className='flex flex-row items-center justify-center text-sm'>
//             {propertyDataInfo.bathrooms} Bath <span className='mx-2'>-</span>
//           </span>
//         )}
//         {propertyDataInfo.bedrooms && (
//           <span className='flex flex-row items-center justify-center text-sm'>
//             {propertyDataInfo.bedrooms} Bedrooms <span className='mx-2'>-</span>
//           </span>
//         )}
//         {propertyDataInfo.squareFootage && (
//           <span className='flex flex-row items-center justify-center text-sm'>
//             {propertyDataInfo.squareFootage} Sqft
//           </span>
//         )}
//       </span>
//     </span>
//   );
// };
