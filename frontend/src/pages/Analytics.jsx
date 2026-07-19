import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import api from "../services/api";
import DashboardCard from "../components/DashboardCard";
import { Users, Briefcase, FileText, TrendingUp } from "lucide-react";

const COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe"];

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [topSkills, setTopSkills] = useState([]);

  useEffect(() => {
    api.get("/analytics/overview").then((res) => setOverview(res.data.data));
    api.get("/analytics/top-skills").then((res) => setTopSkills(res.data.data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Total Jobs" value={overview?.totalJobs ?? "—"} icon={Briefcase} accent="indigo" />
        <DashboardCard title="Total Candidates" value={overview?.totalCandidates ?? "—"} icon={Users} accent="green" />
        <DashboardCard title="Parsed Resumes" value={overview?.totalResumes ?? "—"} icon={FileText} accent="amber" />
        <DashboardCard title="Avg. Match Score" value={overview ? `${overview.averageMatchScore}%` : "—"} icon={TrendingUp} accent="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
          <h2 className="font-semibold mb-4">Top Candidate Skills</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSkills} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="_id" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
          <h2 className="font-semibold mb-4">Skill Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={topSkills.slice(0, 5)} dataKey="count" nameKey="_id" outerRadius={100} label>
                {topSkills.slice(0, 5).map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
