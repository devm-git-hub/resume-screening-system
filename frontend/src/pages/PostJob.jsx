import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createJob } from "../redux/slices/jobSlice";
import { Send } from "lucide-react";

export default function PostJob() {
  const [form, setForm] = useState({
    title: "", description: "", requiredSkills: "", minExperienceYears: 0,
    location: "", employmentType: "full-time",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.job);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      requiredSkills: form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
      minExperienceYears: Number(form.minExperienceYears),
    };
    const result = await dispatch(createJob(payload));
    if (result.meta.requestStatus === "fulfilled") {
      navigate(`/recruiter/jobs/${result.payload._id}/candidates`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Post a New Job</h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Job Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent"
            placeholder="e.g. Senior Full Stack Developer"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Job Description</label>
          <textarea
            required
            rows={6}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent"
            placeholder="Paste the full job description here — this text is embedded with SBERT and semantically compared against candidate resumes."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Required Skills (comma separated)</label>
            <input
              value={form.requiredSkills}
              onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent"
              placeholder="react, node.js, mongodb"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Min. Experience (years)</label>
            <input
              type="number"
              min={0}
              value={form.minExperienceYears}
              onChange={(e) => setForm({ ...form, minExperienceYears: e.target.value })}
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent"
              placeholder="Bengaluru, India / Remote"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Employment Type</label>
            <select
              value={form.employmentType}
              onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent"
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl disabled:opacity-60"
        >
          <Send size={18} /> {loading ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
}
