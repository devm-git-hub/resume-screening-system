import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MapPin, Briefcase } from "lucide-react";
import MatchScoreBadge from "../components/MatchScoreBadge";
import { fetchMatchesForCandidate } from "../redux/slices/matchSlice";

export default function JobMatches() {
  const dispatch = useDispatch();
  const { myMatches } = useSelector((state) => state.match);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.candidateId) dispatch(fetchMatchesForCandidate(user.candidateId));
  }, [dispatch, user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Your Job Matches</h1>
      <p className="text-gray-500 text-sm -mt-4">
        Ranked using semantic similarity (Sentence-BERT) + skill, experience, and education overlap.
      </p>

      <div className="grid gap-4">
        {myMatches.length === 0 && (
          <p className="text-sm text-gray-500">No matches yet. Make sure you've uploaded a resume.</p>
        )}
        {myMatches.map((m) => (
          <div key={m._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{m.job?.title}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {m.job?.location || "Remote"}</span>
                  <span className="flex items-center gap-1"><Briefcase size={12} /> {m.job?.employmentType}</span>
                </div>
              </div>
              <MatchScoreBadge score={m.finalMatchPercentage} />
            </div>
            {m.insights && <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">{m.insights}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
