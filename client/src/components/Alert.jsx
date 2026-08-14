import React from "react";
export default function Alert({ type = "info", children }) {
  const colors = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-green-200 bg-green-50 text-green-800"
  };

  return <div className={`rounded-md border px-4 py-3 text-sm ${colors[type]}`}>{children}</div>;
}
