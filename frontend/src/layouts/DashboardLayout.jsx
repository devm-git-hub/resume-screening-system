// import React from "react";
// import { Outlet } from "react-router-dom";
// import Sidebar from "../components/Sidebar";
// import Navbar from "../components/Navbar";

// export default function DashboardLayout({ children }) {
//   return (
//     <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
//       <Sidebar />
//       <div className="flex-1 flex flex-col min-w-0">
//         <Navbar />
//         <main className="p-6 flex-1">
//           {children ?? <Outlet />}
//         </main>
//       </div>
//     </div>
//   );
// }  


import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

// Accepts optional `children` so it works both as a nested-route layout
// (<Outlet />) and wrapping a page directly (guest dashboard on "/").
export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="max-w-7xl mx-auto p-6">{children ?? <Outlet />}</main>
    </div>
  );
}