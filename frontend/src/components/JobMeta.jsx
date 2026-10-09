import React from "react";
import { MapPin, Briefcase } from "lucide-react";

export default function JobMeta({ job, className = "mt-1", children }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 ${className}`}>
      <span className="flex items-center gap-1"><MapPin size={12} /> {job?.location || "Remote"}</span>
      <span className="flex items-center gap-1"><Briefcase size={12} /> {job?.employmentType}</span>
      {children}
    </div>
  );
}