import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FileText, Briefcase, TrendingUp, UploadCloud } from "lucide-react";
import DashboardCard from "../components/DashboardCard";
import MatchScoreBadge from "../components/MatchScoreBadge";
import { fetchMyResumes } from "../redux/slices/resumeSlice";
import { fetchMyMatches } from "../redux/slices/matchSlice";

export default function CandidateDashboard() {
  const dispatch = useDispatch();
  const { list: resumes } = useSelector((state) => state.resume);
  const { myMatches } = useSelector((state) => state.match);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) return; // guest view on "/" - skip authenticated calls
    dispatch(fetchMyResumes());
    dispatch(fetchMyMatches());
  }, [dispatch, isAuthenticated]);

  const bestMatch = myMatches?.[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0] || "Guest"} 👋</h1>
        <p className="text-gray-500 text-sm">Here's how your job search is going.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Resumes Uploaded" value={resumes.length} icon={FileText} accent="indigo" />
        <DashboardCard title="Job Matches" value={myMatches.length} icon={Briefcase} accent="green" />
        <DashboardCard
          title="Best Match Score"
          value={bestMatch ? `${Math.round(bestMatch.finalMatchPercentage)}%` : "—"}
          icon={TrendingUp}
          accent="amber"
        />
        <Link
          to="/candidate/upload"
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-2xl p-5 flex flex-col items-center justify-center gap-2 transition-colors"
        >
          <UploadCloud size={24} />
          <span className="font-medium text-sm">Upload New Resume</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
        <h2 className="font-semibold mb-4">Top Job Matches</h2>
        {myMatches.length === 0 && (
          <p className="text-sm text-gray-500">
            No matches yet. Upload a resume and wait for a recruiter to run matching to see your compatibility scores here.
          </p>
        )}
        <div className="space-y-3">
          {myMatches.slice(0, 5).map((m) => (
            <div key={m._id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800">
              <div>
                <p className="font-medium">{m.job?.title}</p>
                <p className="text-xs text-gray-500">{m.job?.location} · {m.job?.employmentType}</p>
              </div>
              <MatchScoreBadge score={m.finalMatchPercentage} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}