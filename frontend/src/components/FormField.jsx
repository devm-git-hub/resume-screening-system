import React from "react";

const FIELD_CLASSES =
  "mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500";

// `as` can be "input" (default), "textarea" or "select".
export default function FormField({ label, as: Tag = "input", className = "", children, ...props }) {
  return (
    <div className={className}>
      <label className="text-sm font-medium">{label}</label>
      <Tag className={FIELD_CLASSES} {...props}>
        {children}
      </Tag>
    </div>
  );
}