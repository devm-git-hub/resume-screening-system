import React, { useEffect, useState } from "react";
import { MapPin, Briefcase, Clock } from "lucide-react";
import api from "../services/api";

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/jobs", { params: { limit: 20 } })
      .then((res) => setJobs(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Browse Jobs</h1>
        <p className="text-gray-500 text-sm">All open positions posted by recruiters.</p>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading jobs...</p>}

      <div className="grid gap-4">
        {!loading && jobs.length === 0 && (
          <p className="text-sm text-gray-500">No jobs posted yet. Check back later.</p>
        )}

        {jobs.map((job) => (
          <div key={job._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <p className="text-sm text-gray-500">{job.recruiter?.companyName}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 capitalize">
                {job.status}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
              <span className="flex items-center gap-1"><MapPin size={12} /> {job.location || "Remote"}</span>
              <span className="flex items-center gap-1"><Briefcase size={12} /> {job.employmentType}</span>
              <span className="flex items-center gap-1"><Clock size={12} /> {job.minExperienceYears}+ yrs exp</span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
              {job.description}
            </p>

            {job.requiredSkills?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.requiredSkills.map((s) => (
                  <span key={s} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}