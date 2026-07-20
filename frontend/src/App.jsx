import React from "react";
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

import BrowseJobs from "./pages/BrowseJobs";

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
        <Route path="jobs" element={<BrowseJobs />} />
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
