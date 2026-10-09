// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { MapPin, Briefcase, CalendarClock } from "lucide-react";
// import MatchScoreBadge from "../components/MatchScoreBadge";
// import { fetchMyMatches } from "../redux/slices/matchSlice";
// import api from "../services/api";

// export default function JobMatches() {
//   const dispatch = useDispatch();

//   const { myMatches, loading } = useSelector((state) => state.match);

//   const [hasResume, setHasResume] = useState(true);
//   const [checkingResume, setCheckingResume] = useState(true);

//   // Check whether the candidate currently has a resume
//   useEffect(() => {
//     const checkResume = async () => {
//       try {
//         const res = await api.get("/resumes/my");

//         // Adjust this depending on your API response
//         const resume = res.data?.data || res.data?.resume;

//         setHasResume(!!resume);
//       } catch (error) {
//         console.error("Error checking resume:", error);

//         // If resume is not found
//         if (error.response?.status === 404) {
//           setHasResume(false);
//         }
//       } finally {
//         setCheckingResume(false);
//       }
//     };

//     checkResume();
//   }, []);

//   // Fetch matches only when resume exists
//   useEffect(() => {
//     if (!checkingResume && hasResume) {
//       dispatch(fetchMyMatches());
//     }
//   }, [dispatch, checkingResume, hasResume]);

//   // Resume deleted → don't show previous scores
//   if (!checkingResume && !hasResume) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-2xl font-bold">Your Job Matches</h1>

//           <p className="text-gray-500 text-sm mt-1">
//             Ranked using semantic similarity (Sentence-BERT) + skill,
//             experience, and education overlap.
//           </p>
//         </div>

//         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
//           <p className="text-sm text-gray-500">
//             No resume uploaded. Upload your resume to see your job matches.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold">Your Job Matches</h1>

//         <p className="text-gray-500 text-sm mt-1">
//           Ranked using semantic similarity (Sentence-BERT) + skill,
//           experience, and education overlap.
//         </p>
//       </div>

//       {checkingResume && (
//         <p className="text-sm text-gray-500">
//           Checking your resume...
//         </p>
//       )}

//       {loading && (
//         <p className="text-sm text-gray-500">
//           Loading your matches...
//         </p>
//       )}

//       <div className="grid gap-4">
//         {!loading && myMatches.length === 0 && (
//           <p className="text-sm text-gray-500">
//             No matches yet. Make sure you've uploaded a resume and a recruiter
//             has run AI matching for a job.
//           </p>
//         )}

//         {myMatches.map((m) => (
//           <div
//             key={m._id}
//             className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5"
//           >
//             <div className="flex items-start justify-between">
//               <div>
//                 <h3 className="font-semibold">
//                   {m.job?.title}
//                 </h3>

//                 <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
//                   <span className="flex items-center gap-1">
//                     <MapPin size={12} />
//                     {m.job?.location || "Remote"}
//                   </span>

//                   <span className="flex items-center gap-1">
//                     <Briefcase size={12} />
//                     {m.job?.employmentType}
//                   </span>

//                   {m.createdAt && (
//                     <span className="flex items-center gap-1">
//                       <CalendarClock size={12} />
//                       {new Date(m.createdAt).toLocaleString()}
//                     </span>
//                   )}
//                 </div>
//               </div>

//               <MatchScoreBadge
//                 score={m.finalMatchPercentage}
//               />
//             </div>

//             {m.insights && (
//               <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
//                 {m.insights}
//               </p>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import MatchScoreBadge from "../components/MatchScoreBadge";
import Card from "../components/Card";
import JobMeta from "../components/JobMeta";
import { fetchMyMatches } from "../redux/slices/matchSlice";

export default function JobMatches() {
  const dispatch = useDispatch();
  const { myMatches, loading } = useSelector((state) => state.match);

  useEffect(() => { dispatch(fetchMyMatches()); }, [dispatch]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Your Job Matches</h1>
      <p className="text-gray-500 text-sm -mt-4">
        Ranked using semantic similarity (Sentence-BERT) + skill, experience, and education overlap.
      </p>

      {loading && <p className="text-sm text-gray-500">Loading your matches...</p>}

      <div className="grid gap-4">
        {!loading && myMatches.length === 0 && (
          <p className="text-sm text-gray-500">
            No matches yet. Make sure you've uploaded a resume and a recruiter has run AI matching for a job.
          </p>
        )}
        {myMatches.map((m) => (
          <Card key={m._id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{m.job?.title}</h3>
                <JobMeta job={m.job} />
              </div>
              <MatchScoreBadge score={m.finalMatchPercentage} />
            </div>
            {m.insights && <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">{m.insights}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}