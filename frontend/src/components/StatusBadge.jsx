import React from "react";

const STYLES = {
  open: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950",
  parsed: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950",
  processing: "text-amber-600 bg-amber-50 dark:bg-amber-950",
  failed: "text-rose-600 bg-rose-50 dark:bg-rose-950",
  closed: "text-gray-600 bg-gray-100 dark:bg-gray-800",
  draft: "text-gray-600 bg-gray-100 dark:bg-gray-800",
  uploaded: "text-gray-600 bg-gray-100 dark:bg-gray-800",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${STYLES[status] || STYLES.draft}`}>
      {status}
    </span>
  );
}