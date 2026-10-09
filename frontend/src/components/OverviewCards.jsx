import React, { useEffect, useState } from "react";
import { Briefcase, Users, FileText, TrendingUp } from "lucide-react";
import api from "../services/api";
import DashboardCard from "./DashboardCard";

// lastCard: "avgMatch" (recruiter/analytics) or "applications" (admin)
export default function OverviewCards({ lastCard = "avgMatch" }) {
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    api.get("/analytics/overview").then((res) => setOverview(res.data.data)).catch(() => {});
  }, []);

  const last =
    lastCard === "applications"
      ? { title: "Applications", value: overview?.totalApplications ?? "—" }
      : { title: "Avg. Match Score", value: overview ? `${overview.averageMatchScore}%` : "—" };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardCard title="Total Jobs" value={overview?.totalJobs ?? "—"} icon={Briefcase} accent="indigo" />
      <DashboardCard title="Total Candidates" value={overview?.totalCandidates ?? "—"} icon={Users} accent="green" />
      <DashboardCard title="Parsed Resumes" value={overview?.totalResumes ?? "—"} icon={FileText} accent="amber" />
      <DashboardCard title={last.title} value={last.value} icon={lastCard === "applications" ? FileText : TrendingUp} accent="rose" />
    </div>
  );
}