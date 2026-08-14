import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Languages, 
  LogOut, 
  Mic, 
  Sprout, 
  Type, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  MessageSquareCode, 
  Users, 
  User, 
  Sparkles, 
  Award, 
  Bookmark, 
  FileText, 
  IndianRupee, 
  Leaf, 
  BookOpen, 
  CloudSun, 
  TrendingUp, 
  Book, 
  ShieldAlert, 
  HeartHandshake, 
  CalendarDays, 
  Newspaper,
  Sun,
  Moon,
  Volume2,
  MapPinned,
  Briefcase,
  Store,
  ListOrdered,
  HeartPulse
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAccessibility } from "../context/AccessibilityContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getProfileCompleteness } from "../utils/dashboardStats";

function displayName(user) {
  return user?.name || user?.email || user?.phone || "Farmer account";
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { largeText, setLanguage, setLargeText } = useAccessibility();
  const { isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation(["common", "navigation", "notifications"]);
  const location = useLocation();

  // Collapsible sidebar state
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Mobile menu state
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Notifications center state
  const [showNotifications, setShowNotifications] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  // Calculate profile completeness
  const profileComplete = user?.profile ? getProfileCompleteness(user.profile) : 0;

  // Language options for selector
  const languageOptions = [
    { code: "en", label: t("common:languages.en") },
    { code: "hi", label: t("common:languages.hi") },
    { code: "kn", label: t("common:languages.kn") }
  ];

  const changeLanguage = (nextLanguage) => {
    i18n.changeLanguage(nextLanguage);
    setLanguage(nextLanguage);
  };

  // Grouped Navigation Items
  const navSections = [
    {
      title: t("navigation:sections.overview"),
      items: [
        { label: t("navigation:items.dashboard"), path: "/dashboard", icon: LayoutDashboard },
        { label: t("navigation:items.smartRecommendations"), path: "/recommendations", icon: Sparkles },
        { label: t("navigation:items.dbtTracker"), path: "/dbt", icon: IndianRupee },
      ]
    },
    {
      title: t("navigation:sections.aiAdvisory"),
      items: [
        { label: t("navigation:items.plantDoctor"), path: "/plant-doctor", icon: Leaf },
        { label: "Livestock Manager", path: "/livestock", icon: HeartPulse },
        { label: t("navigation:items.chatbot"), path: "/chatbot", icon: MessageSquareCode },
        { label: t("navigation:items.advisory"), path: "/agriculture", icon: BookOpen },
        { label: t("navigation:items.weather"), path: "/agriculture/weather", icon: CloudSun },
        { label: t("navigation:items.markets"), path: "/agriculture/market", icon: TrendingUp },
      ]
    },
    {
      title: t("navigation:sections.services"),
      items: [
        { label: t("navigation:items.schemes"), path: "/schemes", icon: Award },
        { label: t("navigation:items.smartAgriMap"), path: "/agri-map", icon: MapPinned },
        { label: t("navigation:items.bookmarks"), path: "/schemes/bookmarks", icon: Bookmark },
        { label: t("navigation:items.documents", "Documents"), path: "/documents", icon: FileText },
        ...(user?.role === "Admin" ? [{ label: t("navigation:items.manageSchemes", "Manage Schemes"), path: "/schemes/new", icon: Award }] : []),
      ]
    },
    {
      title: t("navigation:sections.farmEconomy", "Farm Economy"),
      items: [
        { label: t("navigation:items.farmJobs", "Farm Jobs"), path: "/jobs", icon: Briefcase },
        { label: t("navigation:items.marketplace", "Marketplace"), path: "/marketplace", icon: Store },
        { label: t("navigation:items.myListings", "My Listings"), path: "/my-listings", icon: ListOrdered },
      ]
    },
    {
      title: t("navigation:sections.knowledge", "Knowledge"),
      items: [
        { label: t("navigation:items.community"), path: "/community", icon: Users },
        { label: t("navigation:items.crops"), path: "/agriculture/crops", icon: Book },
        { label: t("navigation:items.diseases"), path: "/agriculture/diseases", icon: ShieldAlert },
        { label: t("navigation:items.livestock"), path: "/agriculture/livestock", icon: HeartHandshake },
        { label: t("navigation:items.seasonal"), path: "/agriculture/seasonal", icon: CalendarDays },
        { label: t("navigation:items.agricultureNews"), path: "/agriculture/news", icon: Newspaper },
      ]
    }
  ];

  // Dummy notifications
  const notifications = [
    { id: 1, text: t("notifications:items.rainfall"), time: t("notifications:times.tenMinutes"), type: "weather" },
    { id: 2, text: t("notifications:items.solarScheme"), time: t("notifications:times.twoHours"), type: "scheme" },
    { id: 3, text: t("notifications:items.plantDiagnostics"), time: t("notifications:times.oneDay"), type: "health" }
  ];

  return (
    <main className="min-h-screen bg-field dark:bg-field-dark text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 dark:border-slate-800/40 bg-white/75 dark:bg-slate-900/75 backdrop-blur-md">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="rounded-lg p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus-ring"
              aria-label={t("common:openMobileMenu")}
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-leaf-500 to-emerald-600 text-white shadow-glow-green">
                <Sprout size={20} className="animate-pulse-slow" />
              </span>
              <div>
                <p className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  KisanBandhu <span className="rounded-full bg-leaf-500/10 px-2 py-0.5 text-[10px] font-bold text-leaf-600 dark:text-leaf-400">{t("common:saasAi")}</span>
                </p>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{t("common:nextGenAgritech")}</p>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <label className="focus-within:ring-2 focus-within:ring-leaf hover:bg-slate-100 dark:hover:bg-slate-800 hidden items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-slate-600 dark:text-slate-400 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-900 sm:inline-flex cursor-pointer transition-colors">
              <Languages size={16} />
              <select
                value={i18n.language}
                onChange={(event) => changeLanguage(event.target.value)}
                className="bg-transparent text-xs font-semibold outline-none cursor-pointer"
                aria-label={t("common:language")}
              >
                {languageOptions.map(({ code, label }) => (
                  <option key={code} value={code} className="dark:bg-slate-900">
                    {label}
                  </option>
                ))}
              </select>
            </label>

            {/* Accessibility: High Contrast / Large Text */}
            <button
              type="button"
              onClick={() => setLargeText(!largeText)}
              className={`focus-ring hidden rounded-xl border p-2 sm:inline-flex transition-all ${
                largeText 
                  ? "border-leaf bg-leaf-50 text-leaf dark:bg-leaf-950/20" 
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title={t("common:largeText")}
              aria-pressed={largeText}
            >
              <Type size={18} />
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="focus-ring rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title={t("common:toggleDarkMode")}
            >
              {isDark ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} />}
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`focus-ring rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${
                  showNotifications ? "bg-slate-100 dark:bg-slate-800" : ""
                }`}
                title={t("common:notifications")}
              >
                <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <Bell size={18} />
              </button>

              {/* Notification dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2.5 w-80 z-50 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl"
                    >
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">{t("notifications:title")}</h4>
                      <div className="grid gap-2.5">
                        {notifications.map((n) => (
                          <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent dark:border-slate-800/30">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">{n.text}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="focus-ring rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 p-2 text-white transition-colors"
              title={t("common:logout")}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <div className="mx-auto flex max-w-8xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Desktop Sidebar */}
        <aside 
          className={`hidden lg:flex flex-col shrink-0 h-[calc(100vh-6rem)] sticky top-24 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-4 transition-all duration-300 ${
            isCollapsed ? "w-20" : "w-64"
          }`}
        >
          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-white shadow-sm focus-ring"
          >
            {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>

          {/* Nav Items */}
          <div className="flex-1 overflow-y-auto pr-1">
            <nav className="grid gap-5">
              {navSections.map((section, idx) => (
                <div key={idx} className="grid gap-1">
                  {!isCollapsed && (
                    <span className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                      {section.title}
                    </span>
                  )}
                  {section.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition-all ${
                          isActive 
                            ? "bg-leaf-500 text-white shadow-glow-green" 
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                        }`
                      }
                      title={item.label}
                    >
                      <item.icon size={18} className="shrink-0" />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  ))}
                </div>
              ))}
            </nav>
          </div>

          {/* User Profile Card */}
          <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/40">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-tr from-emerald-500 to-leaf-600 text-white font-extrabold text-sm">
                {displayName(user).substring(0, 2).toUpperCase()}
              </span>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-slate-800 dark:text-white truncate" title={displayName(user)}>
                    {displayName(user)}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {user?.profile?.village || t("common:villageNotAdded")}
                  </p>
                </div>
              )}
            </div>

            {/* Profile completeness progress bar */}
            {!isCollapsed && (
              <div className="mt-3.5 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-leaf h-full rounded-full transition-all duration-500" 
                  style={{ width: `${profileComplete}%` }}
                />
              </div>
            )}
            {!isCollapsed && (
              <div className="mt-1 flex items-center justify-between text-[10px] font-bold text-slate-500">
                <span>{t("common:profileMatchScore")}</span>
                <span className="text-leaf-600 dark:text-leaf-400">{profileComplete}%</span>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Menu Drawer (AnimatePresence Overlay) */}
        <AnimatePresence>
          {isMobileOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileOpen(false)}
                className="fixed inset-0 z-50 bg-black lg:hidden"
              />
              
              {/* Drawer Content */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 top-0 z-50 flex w-72 flex-col bg-white dark:bg-slate-900 p-5 shadow-2xl lg:hidden overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-leaf text-white">
                      <Sprout size={16} />
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">KisanBandhu</span>
                  </div>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 focus-ring"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <nav className="grid gap-5">
                    {navSections.map((section, idx) => (
                      <div key={idx} className="grid gap-1.5">
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-3">
                          {section.title}
                        </span>
                        {section.items.map((item) => (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                              `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                                isActive 
                                  ? "bg-leaf-500 text-white" 
                                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                              }`
                            }
                          >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                          </NavLink>
                        ))}
                      </div>
                    ))}
                  </nav>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-leaf text-white font-extrabold">
                      {displayName(user).substring(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                        {displayName(user)}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {user?.profile?.village || t("common:villageNotAdded")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3.5 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-leaf h-full rounded-full" style={{ width: `${profileComplete}%` }} />
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Content Outlet */}
        <section className="flex-1 min-w-0">
          <Outlet />
        </section>

      </div>
    </main>
  );
}
