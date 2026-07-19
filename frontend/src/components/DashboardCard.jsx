import React from "react";

/**
 * A single metric card for dashboards (e.g. "Total Candidates: 128").
 * icon: a lucide-react icon component
 */
export default function DashboardCard({ title, value, icon: Icon, accent = "indigo", trend }) {
  const accentMap = {
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400",
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {trend && <p className="text-xs text-emerald-500 mt-1">{trend}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${accentMap[accent]}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}
