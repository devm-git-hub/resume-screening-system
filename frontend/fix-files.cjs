const fs = require("fs");
const path = require("path");

const files = {
  "src/App.jsx": `import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

import CandidateDashboard from "./pages/CandidateDashboard";
import ResumeUpload from "./pages/ResumeUpload";
import MyResumes from "./pages/MyResumes";
import JobMatches from "./pages/JobMatches";

import RecruiterDashboard from "./pages/RecruiterDashboard";
import PostJob from "./pages/PostJob";
import JobsList from "./pages/JobsList";
import RankedCandidates from "./pages/RankedCandidates";
import CandidateSearch from "./pages/CandidateSearch";
import Analytics from "./pages/Analytics";

import AdminDashboard from "./pages/AdminDashboard";

function RootRedirect() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    if (user?.role === "recruiter") return <Navigate to="/recruiter/dashboard" replace />;
    if (user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/candidate/dashboard" replace />;
  }

  return (
    <DashboardLayout>
      <CandidateDashboard />
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route path="/upload" element={<ResumeUpload />} />

      <Route
        path="/candidate"
        element={
          <ProtectedRoute roles={["candidate"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<CandidateDashboard />} />
        <Route path="upload" element={<ResumeUpload />} />
        <Route path="resumes" element={<MyResumes />} />
        <Route path="matches" element={<JobMatches />} />
      </Route>

      <Route
        path="/recruiter"
        element={
          <ProtectedRoute roles={["recruiter"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<RecruiterDashboard />} />
        <Route path="jobs" element={<JobsList />} />
        <Route path="jobs/new" element={<PostJob />} />
        <Route path="jobs/:jobId/candidates" element={<RankedCandidates />} />
        <Route path="candidates" element={<CandidateSearch />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="candidates" element={<CandidateSearch />} />
        <Route path="jobs" element={<JobsList />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
`,

  "src/layouts/DashboardLayout.jsx": `import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-6 flex-1">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
`,

  "src/components/Navbar.jsx": `import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Sun, Moon, LogOut, LogIn, Menu } from "lucide-react";
import { toggleTheme, toggleSidebar } from "../redux/slices/uiSlice";
import { logout } from "../redux/slices/authSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector((state) => state.ui);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
      <button className="lg:hidden p-2" onClick={() => dispatch(toggleSidebar())}>
        <Menu size={20} />
      </button>

      <h1 className="font-semibold text-lg hidden md:block">AI Resume Screening & Job Matching</h1>

      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Toggle dark mode"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {isAuthenticated && user && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-semibold">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm hidden sm:block">{user.name}</span>
          </div>
        )}

        {!isAuthenticated && (
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <LogIn size={16} /> Login
          </Link>
        )}

        {isAuthenticated && (
          <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="Logout">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </header>
  );
}
`,
};

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, relPath);
  fs.writeFileSync(fullPath, content, "utf8");
  console.log("Written:", relPath);
}
console.log("Done.");