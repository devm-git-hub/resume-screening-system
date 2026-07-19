import React, { useEffect, useState } from "react";
import { Users, Briefcase, FileText, TrendingUp } from "lucide-react";
import api from "../services/api";
import DashboardCard from "../components/DashboardCard";

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    api.get("/analytics/overview").then((res) => setOverview(res.data.data));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-gray-500 text-sm">System-wide overview and management.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Total Jobs" value={overview?.totalJobs ?? "—"} icon={Briefcase} accent="indigo" />
        <DashboardCard title="Total Candidates" value={overview?.totalCandidates ?? "—"} icon={Users} accent="green" />
        <DashboardCard title="Parsed Resumes" value={overview?.totalResumes ?? "—"} icon={FileText} accent="amber" />
        <DashboardCard title="Applications" value={overview?.totalApplications ?? "—"} icon={TrendingUp} accent="rose" />
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <h2 className="font-semibold mb-2">System Management</h2>
        <p className="text-sm text-gray-500">
          Use the sidebar to manage candidates and jobs across the platform. Role-based access control (RBAC)
          restricts recruiters and candidates to their own data; only admins can view/manage all records.
        </p>
      </div>
    </div>
  );
}
