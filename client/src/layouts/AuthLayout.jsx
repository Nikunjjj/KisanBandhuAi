import React, { useState, useEffect } from "react";
import { Sprout, ShieldCheck, TrendingUp, Sparkles, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { useAccessibility } from "../context/AccessibilityContext";
import { useTheme } from "../context/ThemeContext";
import { localizeText } from "../utils/localize";

export default function AuthLayout({ title, subtitle, children }) {
  const { language } = useAccessibility();
  const { isDark, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#080b11] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans flex flex-col lg:flex-row">
      
      {/* ── LEFT PANEL: PREMIUM SaaS DISPLAY ── */}
      <section className="relative hidden lg:flex w-[45%] flex-col justify-between overflow-hidden bg-gradient-to-br from-leaf-950 via-leaf-800 to-emerald-950 px-12 py-10 text-white">
        
        {/* Dynamic mesh gradient background overlay */}
        <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-300 via-emerald-400 to-slate-900" />
        
        {/* Brand Logo Header */}
        <Link to="/" className="relative z-10 flex items-center gap-3 text-xl font-black tracking-tight">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white dark:bg-slate-900 text-leaf-600 dark:text-leaf-400 shadow-glow-green">
            <Sprout size={22} className="animate-pulse-slow" />
          </span>
          <span className="bg-clip-text bg-gradient-to-r from-white to-green-100">KisanBandhu</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase">AI SaaS</span>
        </Link>

        {/* Content & Floating Cards */}
        <div className="relative z-10 my-auto py-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-green-200 backdrop-blur-md border border-white/10">
            <Sparkles size={13} /> {localizeText("Indian Agriculture Powered by Groq AI", language)}
          </span>
          
          <h1 className="mt-6 max-w-lg text-4xl font-extrabold leading-[1.15] tracking-tight text-white xl:text-5xl">
            {localizeText("The Next-Gen OS for Modern Indian Farmers.", language)}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-green-100/80 font-medium">
            {localizeText("Empowering millions of agricultural producers with real-time AI disease scanning, intelligent scheme matchmakers, and live market intelligence.", language)}
          </p>

          {/* Floating UI Mockup elements */}
          <div className="mt-12 space-y-4">
            
            {/* Stat Card 1 */}
            <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-premium backdrop-blur-md">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-emerald-300 border border-white/10">
                <ShieldCheck size={24} />
              </span>
              <div>
                <p className="text-2xl font-black text-white">4.8M+</p>
                <p className="text-xs font-bold text-green-200/70 uppercase tracking-wider">{localizeText("Farmers Connected Across India", language)}</p>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-premium backdrop-blur-md">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-yellow-300 border border-white/10">
                <TrendingUp size={24} />
              </span>
              <div>
                <p className="text-2xl font-black text-white">99.4%</p>
                <p className="text-xs font-bold text-green-200/70 uppercase tracking-wider">{localizeText("AI Crop Diagnostics Accuracy", language)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-green-200/60 font-semibold border-t border-white/10 pt-4">
          <p>© 2026 KisanBandhu AgriTech</p>
          <p>v2.4.0-release</p>
        </div>
      </section>

      {/* ── RIGHT PANEL: AUTH FORMS ── */}
      <section className="flex flex-1 flex-col justify-between px-6 py-8 sm:px-12 lg:px-20 relative">
        
        {/* Top Control Bar with Theme Toggle */}
        <div className="flex justify-end items-center gap-4 relative z-10">
          <img src="/uba-logo.jpg" alt="Unnat Bharat Abhiyan" className="h-48 object-contain rounded-lg shadow-md bg-white p-2" />
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm focus-ring transition-all"
            title="Toggle Theme"
          >
            {isDark ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} />}
          </button>
        </div>

        {/* Form Container */}
        <div className="my-auto mx-auto w-full max-w-lg relative z-10 py-10">
          
          {/* Mobile brand presentation */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-leaf text-white shadow-glow-green">
              <Sprout size={20} />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">KisanBandhu</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{localizeText(title, language)}</h2>
            <p className="mt-2.5 text-sm font-semibold text-slate-500 dark:text-slate-400">{localizeText(subtitle, language)}</p>
          </div>

          <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl dark:shadow-none">
            {children}
          </div>
        </div>

        {/* Empty footer area to align page */}
        <div className="h-6" />
      </section>
    </main>
  );
}
