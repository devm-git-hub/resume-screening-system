import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard, FileText, Briefcase, Users, BarChart3, Settings, UploadCloud, LogOut, Sun, Moon,
} from "lucide-react";
import { logout } from "../redux/slices/authSlice";
import { toggleTheme } from "../redux/slices/uiSlice";
import AnimatedLogo from "./AnimatedLogo";

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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { sidebarOpen, theme } = useSelector((state) => state.ui);

  const isDark = theme === "dark";

  let links = candidateLinks;
  if (user?.role === "recruiter") links = recruiterLinks;
  if (user?.role === "admin") links = adminLinks;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside
      className={`flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 transition-all ${
        sidebarOpen ? "w-64" : "w-0 overflow-hidden lg:w-64"
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-200 dark:border-gray-800">
        <AnimatedLogo size={32} letter="R" />
        <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
          ResuMatch AI
        </span>
      </div>

      {/* Menu - takes all the free space so the bottom section sticks to the bottom */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
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

      {/* Bottom section: profile, dark mode switch, logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
        {isAuthenticated && user && (
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl bg-gray-50 dark:bg-gray-800/60">
            <div className="w-9 h-9 shrink-0 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-semibold">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                <span className="capitalize">{user.role}</span>
                {user.email ? ` · ${user.email}` : ""}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => dispatch(toggleTheme())}
          role="switch"
          aria-checked={isDark}
          title="Toggle dark mode"
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="flex items-center gap-3">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            Dark mode
          </span>
          <span
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              isDark ? "bg-primary-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                isDark ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </span>
        </button>

        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}