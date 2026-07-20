import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { UploadCloud, FileCheck2, Loader2, LogIn } from "lucide-react";
import { uploadResume } from "../redux/slices/resumeSlice";

export default function ResumeUpload() {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.resume);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

  const handleFile = (file) => {
    if (!file) return;
    if (!validTypes.includes(file.type)) {
      alert("Only PDF and DOCX files are supported");
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) dispatch(uploadResume(selectedFile));
  };

  // Not logged in: show a login prompt instead of the upload form.
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-10">
        <UploadCloud size={40} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">Login required</h2>
        <p className="text-gray-500 text-sm mb-6">
          Please log in to upload and parse your resume with our AI.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-5 py-2.5 rounded-xl"
        >
          <LogIn size={18} /> Login to Continue
        </Link>
        <p className="text-sm text-gray-500 mt-4">
          Don't have an account? <Link to="/register" className="text-primary-600 font-medium">Create one</Link>
        </p>
      </div>
    );
  }

  // Logged in: original upload UI, unchanged.
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload Resume</h1>
        <p className="text-gray-500 text-sm">
          Our AI will parse your resume, extract your skills & experience, and match you to relevant jobs.
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
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          hidden
          onChange={(e) => handleFile(e.target.files[0])}
        />
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
        {loading ? "Uploading & parsing with AI..." : "Upload & Parse Resume"}
      </button>
    </div>
  );
}