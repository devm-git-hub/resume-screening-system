import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RefreshCw, Download } from "lucide-react";
import { runMatching, fetchMatchesForJob } from "../redux/slices/matchSlice";
import MatchScoreBadge from "../components/MatchScoreBadge";

export default function RankedCandidates() {
  const { jobId } = useParams();
  const dispatch = useDispatch();
  const { rankedCandidates, loading } = useSelector((state) => state.match);

  useEffect(() => {
    dispatch(fetchMatchesForJob({ jobId, params: { page: 1, limit: 20 } }));
  }, [dispatch, jobId]);

  const handleRunMatching = () => dispatch(runMatching(jobId));

  const handleExport = () => {
    const rows = rankedCandidates.map((m) => ({
      candidate: m.candidate?.user?.name,
      email: m.candidate?.user?.email,
      matchPercentage: m.finalMatchPercentage,
      matchedSkills: (m.matchedSkills || []).join("; "),
    }));
    const csv = ["Candidate,Email,Match %,Matched Skills", ...rows.map((r) => `${r.candidate},${r.email},${r.matchPercentage},"${r.matchedSkills}"`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ranked-candidates-${jobId}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Ranked Candidates</h1>
          <p className="text-gray-500 text-sm">Ranked by Sentence-BERT semantic similarity + skill/experience/education fit.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium">
            <Download size={16} /> Export CSV
          </button>
          <button
            onClick={handleRunMatching}
            disabled={loading}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> {loading ? "Matching..." : "Run AI Matching"}
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {rankedCandidates.length === 0 && (
          <p className="text-sm text-gray-500">No matches yet. Click "Run AI Matching" to score all parsed resumes against this job.</p>
        )}

        {rankedCandidates.map((m, idx) => (
          <div key={m._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-50 text-primary-600 dark:bg-primary-950 flex items-center justify-center font-bold text-sm">
                  #{m.rank || idx + 1}
                </div>
                <div>
                  <p className="font-semibold">{m.candidate?.user?.name}</p>
                  <p className="text-xs text-gray-500">{m.candidate?.user?.email}</p>
                </div>
              </div>
              <MatchScoreBadge score={m.finalMatchPercentage} />
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 text-center text-xs">
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-gray-500">Semantic Fit</p>
                <p className="font-semibold">{Math.round(m.semanticSimilarity * 100)}%</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-gray-500">Skill Match</p>
                <p className="font-semibold">{Math.round(m.skillMatchScore * 100)}%</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-gray-500">Experience Fit</p>
                <p className="font-semibold">{Math.round(m.experienceMatchScore * 100)}%</p>
              </div>
            </div>

            {m.matchedSkills?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {m.matchedSkills.map((s) => (
                  <span key={s} className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    {s}
                  </span>
                ))}
              </div>
            )}

            {m.insights && <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 italic">"{m.insights}"</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
