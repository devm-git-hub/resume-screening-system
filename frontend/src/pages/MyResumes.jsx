import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trash2, FileText } from "lucide-react";
import { fetchMyResumes, deleteResume } from "../redux/slices/resumeSlice";

const statusColors = {
  parsed: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950",
  processing: "text-amber-600 bg-amber-50 dark:bg-amber-950",
  failed: "text-rose-600 bg-rose-50 dark:bg-rose-950",
  uploaded: "text-gray-600 bg-gray-100 dark:bg-gray-800",
};

export default function MyResumes() {
  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.resume);

  useEffect(() => { dispatch(fetchMyResumes()); }, [dispatch]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Resumes</h1>

      <div className="grid gap-4">
        {list.length === 0 && <p className="text-gray-500 text-sm">You haven't uploaded any resumes yet.</p>}

        {list.map((resume) => (
          <div key={resume._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="p-3 rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="font-medium">{resume.originalFileName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                  </p>
                  <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full capitalize ${statusColors[resume.status]}`}>
                    {resume.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => dispatch(deleteResume(resume._id))}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {resume.parsedData?.skills?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {resume.parsedData.skills.slice(0, 10).map((skill) => (
                  <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    {skill}
                  </span>
                ))}
              </div>
            )}

           {resume.status === "failed" && resume.parsingError && (
              <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">
                ⚠ Parsing failed: {resume.parsingError}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
