import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import { fetchJobs } from "../redux/slices/jobSlice";
import DataTable from "../components/DataTable";

export default function JobsList() {
  const dispatch = useDispatch();
  const { list, pagination } = useSelector((state) => state.job);

  useEffect(() => { dispatch(fetchJobs({ page: 1, limit: 10 })); }, [dispatch]);

  const columns = [
    { key: "title", label: "Job Title" },
    { key: "location", label: "Location" },
    { key: "employmentType", label: "Type" },
    { key: "status", label: "Status", render: (row) => (
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 capitalize">{row.status}</span>
      )
    },
    { key: "actions", label: "Candidates", render: (row) => (
        <Link to={`/recruiter/jobs/${row._id}/candidates`} className="flex items-center gap-1 text-primary-600 text-sm">
          <Users size={14} /> View ranked candidates
        </Link>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Job Postings</h1>
        <Link to="/recruiter/jobs/new" className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm">
          <Plus size={18} /> Post a Job
        </Link>
      </div>

      <DataTable
        columns={columns}
        rows={list}
        pagination={pagination}
        onPageChange={(page) => dispatch(fetchJobs({ page, limit: 10 }))}
        emptyMessage="No jobs posted yet"
      />
    </div>
  );
}
