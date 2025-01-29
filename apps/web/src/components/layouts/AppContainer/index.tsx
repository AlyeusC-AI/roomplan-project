// import Content from "./Content";
// import Header from "./Header";

// export default function AppContainer({
//   overflow = true,
//   children,
//   hideParentNav = false,
//   renderSecondaryNavigation,
//   skeleton = false,
// }: {
//   overflow?: boolean;
//   children: React.ReactNode;
//   hideParentNav?: boolean;
//   renderSecondaryNavigation?: () => React.ReactNode;
//   skeleton?: boolean;
// }) {
//   return (
//     <>
//       <div className='h-vh flex flex-col'>
//         <Header skeleton={skeleton} />
//         <Content
//           hideParentNav={hideParentNav}
//           overflow={overflow}
//           renderSecondaryNavigation={renderSecondaryNavigation}
//         >
//           {children}
//         </Content>
//       </div>
//     </>
//   );
// }
