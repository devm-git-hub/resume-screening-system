import React from "react";

/** Color-coded circular badge showing a candidate's match percentage. */
export default function MatchScoreBadge({ score }) {
  const pct = Math.round(score || 0);
  let colorClasses = "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400";
  if (pct >= 80) colorClasses = "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400";
  else if (pct >= 60) colorClasses = "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400";
  else if (pct >= 40) colorClasses = "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400";

  return (
    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold ${colorClasses}`}>
      {pct}% match
    </span>
  );
}
