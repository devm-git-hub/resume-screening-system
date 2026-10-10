import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Plus, Users, Trash2 } from "lucide-react";
import { fetchJobs, deleteJob } from "../redux/slices/jobSlice";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import ConfirmDialog from "../components/ConfirmDialog";

export default function JobsList() {
  const dispatch = useDispatch();
  const { list, pagination } = useSelector((state) => state.job);
  const [toDelete, setToDelete] = useState(null); // the job the confirm popup is about

  useEffect(() => { dispatch(fetchJobs({ page: 1, limit: 10 })); }, [dispatch]);

  const handleDelete = async () => {
    const result = await dispatch(deleteJob(toDelete._id));
    if (result.meta.requestStatus !== "fulfilled") return false;
    // reload the current page so the pagination counts stay correct
    dispatch(fetchJobs({ page: pagination.page || 1, limit: 10 }));
    return true;
  };

  const columns = [
    { key: "title", label: "Job Title" },
    { key: "location", label: "Location" },
    { key: "employmentType", label: "Type" },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "candidates",
      label: "Candidates",
      render: (row) => (
        <Link to={`/recruiter/jobs/${row._id}/candidates`} className="flex items-center gap-1 text-primary-600 text-sm">
          <Users size={14} /> View ranked candidates
        </Link>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      // the delete button only appears on jobs the logged-in recruiter posted
      render: (row) =>
        row.isOwner ? (
          <button
            onClick={() => setToDelete(row)}
            title="Delete job"
            className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
          >
            <Trash2 size={16} />
          </button>
        ) : (
          <span className="text-xs text-gray-400" title="Only the recruiter who posted this job can delete it">—</span>
        ),
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

      <ConfirmDialog
        open={!!toDelete}
        title="Delete job?"
        message={`This permanently deletes "${toDelete?.title}" together with all candidate match scores for it. Candidates will no longer see it. This can't be undone.`}
        onConfirm={handleDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}