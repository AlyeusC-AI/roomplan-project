// "use client";

// import { userInfoStore } from "@atoms/user-info";
// import clsx from "clsx";
// import { usePathname } from "next/navigation";

// const MainContent = ({
//   children,
//   className,
// }: {
//   children: React.ReactNode;
//   className?: string;
// }) => {
//   const userInfo = userInfoStore((state) => state.user);
//   const router = usePathname();
//   return (
//     <div
//       className={clsx(
//         "flex flex-col px-8 pt-4",
//         router === "/projects"
//           ? userInfo && userInfo.savedDashboardView !== DashboardViews.boardView
//             ? "overflow-scroll"
//             : "overflow-hidden"
//           : "overflow-scroll",
//         className
//       )}
//     >
//       {children}
//     </div>
//   );
// };

// export default MainContent;
