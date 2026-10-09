import React from "react";
import Card from "./Card";

export default function AuthLayout({ header, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <Card padding="p-8" className="w-full max-w-md shadow-sm">
        {header}
        <h2 className="text-2xl font-bold mb-1">{title}</h2>
        <p className="text-gray-500 text-sm mb-6">{subtitle}</p>
        {children}
        {footer && <p className="text-sm text-gray-500 mt-6 text-center">{footer}</p>}
      </Card>
    </div>
  );
}