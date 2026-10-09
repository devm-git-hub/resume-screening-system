import React from "react";

export default function SubmitButton({ loading, loadingText, icon: Icon, children, ...props }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-60"
      {...props}
    >
      {Icon && <Icon size={18} />} {loading ? loadingText : children}
    </button>
  );
}