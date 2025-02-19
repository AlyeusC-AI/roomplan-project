// import React from 'react'
// import { List, Table,  } from 'lucide-react'
// import clsx from 'clsx'

// export default function ViewSwitcher({
//   view,
//   setView,
// }: {
//   view: DashboardViews
//   setView: (view: DashboardViews) => void
// }) {
//   const savePreference = (preference: DashboardViews) => {
//     setView(preference)
//     try {
//       fetch('/api/user/save-dashboard-preference', {
//         method: 'PATCH',
//         body: JSON.stringify({
//           preference,
//         }),
//       })
//     } catch (error) {
//       console.error(error)
//     }
//   }

//   return (
//     <div className="hidden space-x-2 overflow-hidden rounded-lg bg-gray-300 p-1 font-semibold md:flex">
//       <button
//         className={clsx(
//           'flex items-center justify-center rounded-md px-2 py-1 text-xs text-neutral-800',
//           view === DashboardViews.listView && 'bg-white'
//         )}
//         onClick={() => savePreference(DashboardViews.listView)}
//       >
//         <List className={clsx('mr-2 h-4 text-neutral-800')} /> List
//         View
//       </button>
//       <button
//         className={clsx(
//           'flex items-center justify-center rounded-md px-2 py-1 text-xs text-neutral-800',
//           view === DashboardViews.boardView && 'bg-white'
//         )}
//         onClick={() => savePreference(DashboardViews.boardView)}
//       >
//         <Table className={clsx('mr-2 h-4 text-neutral-800')} />
//         Board View
//       </button>
//     </div>
//   )
// }
