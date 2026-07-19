import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <ShieldAlert size={48} className="text-rose-500 mb-3" />
      <h1 className="text-2xl font-bold">Access Denied</h1>
      <p className="text-gray-500 mt-2">You don't have permission to view this page.</p>
      <Link to="/login" className="mt-6 text-primary-600 font-medium">Return to login</Link>
    </div>
  );
}
