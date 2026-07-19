import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Briefcase, Users, FileText, TrendingUp, Plus } from "lucide-react";
import api from "../services/api";
import DashboardCard from "../components/DashboardCard";
import { fetchJobs } from "../redux/slices/jobSlice";

export default function RecruiterDashboard() {
  const dispatch = useDispatch();
  const { list: jobs } = useSelector((state) => state.job);
  const { user } = useSelector((state) => state.auth);
  const [overview, setOverview] = React.useState(null);

  useEffect(() => {
    dispatch(fetchJobs({ limit: 5 }));
    api.get("/analytics/overview").then((res) => setOverview(res.data.data)).catch(() => {});
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-gray-500 text-sm">Here's your recruitment overview.</p>
        </div>
        <Link to="/recruiter/jobs/new" className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm">
          <Plus size={18} /> Post a Job
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Open Jobs" value={overview?.totalJobs ?? "—"} icon={Briefcase} accent="indigo" />
        <DashboardCard title="Total Candidates" value={overview?.totalCandidates ?? "—"} icon={Users} accent="green" />
        <DashboardCard title="Parsed Resumes" value={overview?.totalResumes ?? "—"} icon={FileText} accent="amber" />
        <DashboardCard title="Avg. Match Score" value={overview ? `${overview.averageMatchScore}%` : "—"} icon={TrendingUp} accent="rose" />
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Job Postings</h2>
          <Link to="/recruiter/jobs" className="text-sm text-primary-600">View all</Link>
        </div>
        <div className="space-y-3">
          {jobs.length === 0 && <p className="text-sm text-gray-500">No jobs posted yet.</p>}
          {jobs.map((job) => (
            <Link
              key={job._id}
              to={`/recruiter/jobs/${job._id}/candidates`}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <div>
                <p className="font-medium">{job.title}</p>
                <p className="text-xs text-gray-500">{job.location} · {job.employmentType}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 capitalize">
                {job.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
