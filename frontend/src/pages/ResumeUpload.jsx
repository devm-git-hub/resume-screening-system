import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { UploadCloud, FileCheck2, Loader2, LogIn } from "lucide-react";
import { uploadResume } from "../redux/slices/resumeSlice";
import Card from "../components/Card";
import JobMeta from "../components/JobMeta";
import MatchScoreBadge from "../components/MatchScoreBadge";

const VALID_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Shown after an upload: every open job with this resume's match for it.
function MatchResults({ resume, matches }) {
  if (resume?.status === "failed") {
    return (
      <Card>
        <p className="text-sm text-rose-600 dark:text-rose-400">
          ⚠ We couldn't read this resume: {resume.parsingError || "unknown error"}. Try a text-based PDF or DOCX
          (not a scanned image).
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Job matches for your resume</h2>
        <p className="text-gray-500 text-sm">
          {matches.length > 0
            ? `Your resume was matched against ${matches.length} open job${matches.length === 1 ? "" : "s"}, best match first.`
            : "Your resume was parsed, but there are no open jobs to match against yet."}
        </p>
      </div>

      {resume?.parsedData?.skills?.length > 0 && (
        <Card>
          <p className="text-sm font-medium mb-2">Skills we found in your resume</p>
          <div className="flex flex-wrap gap-1.5">
            {resume.parsedData.skills.map((s) => (
              <span key={s} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{s}</span>
            ))}
          </div>
        </Card>
      )}

      {matches.map((m) => (
        <Card key={m._id}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{m.job?.title}</h3>
              <JobMeta job={m.job} />
            </div>
            <MatchScoreBadge score={m.finalMatchPercentage} />
          </div>

          {m.matchedSkills?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-gray-500">Matched:</span>
              {m.matchedSkills.map((s) => (
                <span key={s} className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">{s}</span>
              ))}
            </div>
          )}

          {m.missingSkills?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-gray-500">Missing:</span>
              {m.missingSkills.map((s) => (
                <span key={s} className="text-xs px-2 py-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400">{s}</span>
              ))}
            </div>
          )}

          {m.insights && <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">{m.insights}</p>}
        </Card>
      ))}
    </div>
  );
}

export default function ResumeUpload() {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const inputRef = useRef();
  const dispatch = useDispatch();
  const { loading, list, lastMatches } = useSelector((state) => state.resume);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleFile = (file) => {
    if (!file) return;
    if (!VALID_TYPES.includes(file.type)) {
      alert("Only PDF and DOCX files are supported");
      return;
    }
    setSelectedFile(file);
    setUploaded(false); // hide the previous results when a new file is chosen
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const result = await dispatch(uploadResume(selectedFile));
    if (result.meta.requestStatus === "fulfilled") {
      setUploaded(true);
      setSelectedFile(null);
    }
  };

  // Not logged in: show a login prompt instead of the upload form.
  if (!isAuthenticated) {
    return (
      <Card padding="p-10" className="max-w-md mx-auto mt-20 text-center">
        <UploadCloud size={40} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">Login required</h2>
        <p className="text-gray-500 text-sm mb-6">Please log in to upload and parse your resume with our AI.</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-5 py-2.5 rounded-xl"
        >
          <LogIn size={18} /> Login to Continue
        </Link>
        <p className="text-sm text-gray-500 mt-4">
          Don't have an account? <Link to="/register" className="text-primary-600 font-medium">Create one</Link>
        </p>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload Resume</h1>
        <p className="text-gray-500 text-sm">
          Our AI will parse your resume, extract your skills & experience, and instantly match you to open jobs.
        </p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
          dragOver ? "border-primary-500 bg-primary-50 dark:bg-primary-950" : "border-gray-300 dark:border-gray-700"
        }`}
      >
        <input ref={inputRef} type="file" accept=".pdf,.docx" hidden onChange={(e) => handleFile(e.target.files[0])} />
        {selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <FileCheck2 className="text-emerald-500" size={40} />
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <UploadCloud size={40} />
            <p className="font-medium">Drag & drop your resume here</p>
            <p className="text-xs">or click to browse (PDF or DOCX, max 5MB)</p>
          </div>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!selectedFile || loading}
        className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors"
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
        {loading ? "Uploading, parsing & matching with AI..." : "Upload & Match Resume"}
      </button>

      {uploaded && <MatchResults resume={list[0]} matches={lastMatches} />}
    </div>
  );
}