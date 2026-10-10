import React from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import ConfirmDialog from "./ConfirmDialog";

/**
 * Delete-candidate popup + API call, shared by the Candidates page and the
 * Ranked Candidates page.
 *   candidate: { id, name } or null (null = closed)
 *   onClose():   hide the dialog
 *   onDeleted(): refresh the list after a successful delete
 */
export default function DeleteCandidateDialog({ candidate, onClose, onDeleted }) {
  const handleDelete = async () => {
    try {
      await api.delete(`/candidates/${candidate.id}`);
      toast.success(`${candidate.name || "Candidate"} was deleted`);
      onDeleted();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete candidate");
      return false;
    }
  };

  return (
    <ConfirmDialog
      open={!!candidate}
      title="Delete candidate?"
      message={`This permanently deletes ${candidate?.name || "this candidate"}'s account, resumes and match scores. They will be removed from the candidate portal and will no longer be able to sign in. This can't be undone.`}
      onConfirm={handleDelete}
      onClose={onClose}
    />
  );
}