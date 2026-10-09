import React from "react";

export default function Card({ as: Tag = "div", padding = "p-5", className = "", children, ...props }) {
  return (
    <Tag
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl ${padding} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}