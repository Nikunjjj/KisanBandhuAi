import React from "react";
export default function ComingSoon({ title }) {
  return (
    <section className="rounded-md border border-green-100 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        This module is planned for the next phase. The current foundation already connects authenticated farmer profile data so scheme discovery, advisories, AI chatbot, and notifications can plug in cleanly.
      </p>
    </section>
  );
}
