import { motion } from "framer-motion";
import AnimatedLogo from "./AnimatedLogo";
import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  LayoutDashboard, FileText, Briefcase, Users, BarChart3, Settings, UploadCloud,
} from "lucide-react";

const recruiterLinks = [
  { to: "/recruiter/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/recruiter/jobs", label: "Jobs", icon: Briefcase },
  { to: "/recruiter/candidates", label: "Candidates", icon: Users },
  { to: "/recruiter/analytics", label: "Analytics", icon: BarChart3 },
];


const candidateLinks = [
  { to: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/candidate/jobs", label: "Browse Jobs", icon: Briefcase },
  { to: "/candidate/resumes", label: "My Resumes", icon: FileText },
  { to: "/candidate/upload", label: "Upload Resume", icon: UploadCloud },
  { to: "/candidate/matches", label: "Job Matches", icon: Briefcase },
];

const adminLinks = [
  { to: "/admin/dashboard", label: "Admin Panel", icon: Settings },
  { to: "/admin/candidates", label: "Candidates", icon: Users },
  { to: "/admin/jobs", label: "Jobs", icon: Briefcase },
];

export default function Sidebar() {
  const { user } = useSelector((state) => state.auth);
  const { sidebarOpen } = useSelector((state) => state.ui);

  let links = candidateLinks;
  if (user?.role === "recruiter") links = recruiterLinks;
  if (user?.role === "admin") links = adminLinks;

  return (
    <aside
      className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 transition-all ${
        sidebarOpen ? "w-64" : "w-0 overflow-hidden lg:w-64"
      }`}
    >
      <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-200 dark:border-gray-800">
       <AnimatedLogo size={32} letter="R" />
        {/* <span className="font-bold text-lg">ResuMatch AI</span> */}


        <motion.span
  initial={{ opacity: 0, x: -15 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
  whileHover={{
    scale: 1.05,
    textShadow: "0px 0px 12px rgba(59,130,246,0.8)",
  }}
  className="font-bold text-lg cursor-pointer bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:200%_200%] bg-clip-text text-transparent"
>
  <motion.span
    animate={{
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    }}
    transition={{
      duration: 5,
      repeat: Infinity,
      ease: "linear",
    }}
    className="inline-block bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:200%_200%] bg-clip-text text-transparent"
  >
    ResuMatch AI
  </motion.span>
</motion.span>  


</div>


      <nav className="p-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}


