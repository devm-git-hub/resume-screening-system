import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import api from "../services/api";
import DataTable from "../components/DataTable";

export default function CandidateSearch() {
  const [filters, setFilters] = useState({ search: "", skills: "", minExperience: "" });
  const [candidates, setCandidates] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchCandidates = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get("/candidates", { params: { ...filters, page, limit: 10 } });
      setCandidates(data.data);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCandidates(1); }, []); // eslint-disable-line

  const columns = [
    { key: "name", label: "Name", render: (row) => row.user?.name },
    { key: "email", label: "Email", render: (row) => row.user?.email },
    { key: "experience", label: "Experience", render: (row) => `${row.totalExperienceYears || 0} yrs` },
    { key: "skills", label: "Skills", render: (row) => (row.skills || []).slice(0, 4).join(", ") },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Search Candidates</h1>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-wrap gap-3">
        <input
          placeholder="Search by name..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="flex-1 min-w-[180px] px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent"
        />
        <input
          placeholder="Skills (comma separated)"
          value={filters.skills}
          onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
          className="flex-1 min-w-[180px] px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent"
        />
        <input
          type="number"
          placeholder="Min. experience (yrs)"
          value={filters.minExperience}
          onChange={(e) => setFilters({ ...filters, minExperience: e.target.value })}
          className="w-48 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent"
        />
        <button
          onClick={() => fetchCandidates(1)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
        >
          <Search size={16} /> {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <DataTable columns={columns} rows={candidates} pagination={pagination} onPageChange={fetchCandidates} />
    </div>
  );
}
