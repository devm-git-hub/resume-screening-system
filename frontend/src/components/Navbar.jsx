// import React from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Link } from "react-router-dom";
// import { LogIn, Menu } from "lucide-react";
// import { toggleSidebar } from "../redux/slices/uiSlice";

// export default function Navbar() {
//   const dispatch = useDispatch();
//   const { isAuthenticated } = useSelector((state) => state.auth);

//   return (
//     <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
//       <button className="lg:hidden p-2" onClick={() => dispatch(toggleSidebar())}>
//         <Menu size={20} />
//       </button>

//       <h1 className="font-semibold text-lg hidden md:block">AI Resume Screening & Job Matching</h1>

//       {/* Guests still get a Login button; logged-in users see their profile in the sidebar */}
//       <div className="flex items-center gap-3">
//         {!isAuthenticated && (
//           <Link
//             to="/login"
//             className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
//           >
//             <LogIn size={16} /> Login
//           </Link>
//         )}
//       </div>
//     </header>
//   );
// }



import React, { useEffect, useRef, useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Home, Briefcase, Target, FileText, UploadCloud, Users, BarChart3,
  Bell, ChevronDown, LogOut, Sun, Moon, Menu, X,
} from "lucide-react";
import AnimatedLogo from "./AnimatedLogo";
import { logout } from "../redux/slices/authSlice";
import { toggleTheme } from "../redux/slices/uiSlice";
import { fetchMyMatches } from "../redux/slices/matchSlice";

// Navigation shown in the bar, per role (only pages that really exist)
const NAV_LINKS = {
  candidate: [
    { to: "/candidate/dashboard", label: "Home", icon: Home },
    { to: "/candidate/jobs", label: "Jobs", icon: Briefcase },
    { to: "/candidate/matches", label: "Matches", icon: Target },
    { to: "/candidate/resumes", label: "Resumes", icon: FileText },
    { to: "/candidate/upload", label: "Upload", icon: UploadCloud },
  ],
  recruiter: [
    { to: "/recruiter/dashboard", label: "Home", icon: Home },
    { to: "/recruiter/jobs", label: "Jobs", icon: Briefcase },
    { to: "/recruiter/candidates", label: "Candidates", icon: Users },
    { to: "/recruiter/analytics", label: "Analytics", icon: BarChart3 },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Home", icon: Home },
    { to: "/admin/candidates", label: "Candidates", icon: Users },
    { to: "/admin/jobs", label: "Jobs", icon: Briefcase },
  ],
  guest: [
    { to: "/", label: "Home", icon: Home, end: true },
    { to: "/upload", label: "Upload", icon: UploadCloud },
  ],
};

// Calls onOutside() when the user clicks anywhere outside `ref`
function useClickOutside(ref, onOutside) {
  const callback = useRef(onOutside);
  callback.current = onOutside;
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) callback.current();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref]);
}

function NavItem({ to, label, icon: Icon, end, onClick, mobile }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-full text-sm font-medium transition-all ${
          mobile ? "px-4 py-3" : "px-4 py-2"
        } ${
          isActive
            ? "bg-indigo-600/50 text-white shadow-[0_0_24px_rgba(79,70,229,0.45)]"
            : "text-gray-300 hover:text-white hover:bg-white/5"
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}

// Dark-mode switch row used inside the profile dropdown
function ThemeSwitchRow() {
  const dispatch = useDispatch();
  const isDark = useSelector((state) => state.ui.theme) === "dark";

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      role="switch"
      aria-checked={isDark}
      className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 transition-colors"
    >
      <span className="flex items-center gap-3">
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
        Dark mode
      </span>
      <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isDark ? "bg-indigo-500" : "bg-gray-600"}`}>
        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${isDark ? "translate-x-4" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}

// Bell with a dropdown. Candidates see their latest job matches here.
function NotificationBell({ notifications }) {
  const [open, setOpen] = useState(false);
  const [seenCount, setSeenCount] = useState(0);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const showDot = notifications.length > seenCount;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen(!open);
          setSeenCount(notifications.length);
        }}
        aria-label="Notifications"
        className="relative p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
      >
        <Bell size={20} />
        {showDot && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#0a1020]" />}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 max-w-[90vw] rounded-2xl bg-[#0f172a] border border-white/10 shadow-xl shadow-black/40 overflow-hidden z-40">
          <div className="px-4 py-3 border-b border-white/10 text-sm font-semibold text-white">Notifications</div>
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-400 text-center">You're all caught up.</p>
          ) : (
            notifications.map((m) => (
              <Link
                key={m._id}
                to="/candidate/matches"
                onClick={() => setOpen(false)}
                className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{m.job?.title}</p>
                  <p className="text-xs text-gray-400">New match for your resume</p>
                </div>
                <span className="text-xs font-semibold text-emerald-400 shrink-0">{Math.round(m.finalMatchPercentage)}%</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Avatar + name + role, opens a dropdown with dark mode and logout
function ProfileMenu({ user }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-white/5 transition-colors"
      >
        <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white flex items-center justify-center font-semibold">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div className="hidden sm:block text-left leading-tight">
          <p className="text-sm font-semibold text-white">{user.name}</p>
          <p className="text-xs text-gray-400 capitalize">{user.role}</p>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-[#0f172a] border border-white/10 shadow-xl shadow-black/40 overflow-hidden z-40">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
            <span className="inline-block mt-2 text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 capitalize">
              {user.role}
            </span>
          </div>
          <ThemeSwitchRow />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-white/10"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { myMatches } = useSelector((state) => state.match);
  const theme = useSelector((state) => state.ui.theme);

  const role = isAuthenticated ? user?.role : "guest";
  const links = NAV_LINKS[role] || NAV_LINKS.candidate;
  const isCandidate = isAuthenticated && user?.role === "candidate";
  const notifications = isCandidate ? myMatches.slice(0, 5) : [];

  // candidates: load matches so the bell has something to show on every page
  useEffect(() => {
    if (isCandidate) dispatch(fetchMyMatches());
  }, [dispatch, isCandidate]);

  // close the mobile menu after navigating
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-30 bg-[#0a1020] border-b border-white/5 shadow-lg shadow-black/30">
      {/* decorative blue glow at the corners */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 -top-10 h-40 w-64 rounded-full bg-blue-600/30 blur-3xl" />
        <div className="absolute -right-16 -bottom-10 h-40 w-64 rounded-full bg-indigo-600/30 blur-3xl" />
      </div>

      <div className="relative flex h-20 items-center justify-between gap-4 px-4 sm:px-8">
        {/* Brand */}
        <Link to={links[0].to} className="flex items-center gap-3 shrink-0">
          <AnimatedLogo size={40} letter="R" />
          <div className="leading-tight">
            <p className="text-xl font-bold text-white">
              ResuMatch{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">AI</span>
            </p>
            <p className="hidden xl:block text-xs text-gray-400">Smarter Hiring. Better Matches.</p>
          </div>
        </Link>

        {/* Navigation (desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          {links.map((link) => (
            <NavItem key={link.to} {...link} />
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated && user ? (
            <>
              <NotificationBell notifications={notifications} />
              <div className="hidden sm:block h-8 w-px bg-white/10" />
              <ProfileMenu user={user} />
            </>
          ) : (
            <>
              <button
                onClick={() => dispatch(toggleTheme())}
                aria-label="Toggle dark mode"
                className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Link
                to="/login"
                className="px-4 py-2 rounded-full text-sm font-medium text-gray-200 border border-white/15 hover:bg-white/5 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition-opacity"
              >
                Sign up
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/5"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Navigation (mobile) */}
      {mobileOpen && (
        <nav className="relative lg:hidden border-t border-white/5 px-4 py-3 flex flex-col gap-1">
          {links.map((link) => (
            <NavItem key={link.to} {...link} mobile onClick={() => setMobileOpen(false)} />
          ))}
        </nav>
      )}
    </header>
  );
}