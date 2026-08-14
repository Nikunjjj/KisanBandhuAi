import React, { useState } from "react";
import { 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Store, 
  MessageSquare, 
  MapPinned, 
  Award,
  Bell,
  ShieldCheck
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const adminNav = [
    { label: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "User Management", path: "/admin/users", icon: Users },
    { label: "Jobs Moderation", path: "/admin/jobs", icon: Briefcase },
    { label: "Marketplace", path: "/admin/marketplace", icon: Store },
    { label: "Community", path: "/admin/community", icon: MessageSquare },
    { label: "Map Directory", path: "/admin/map", icon: MapPinned },
    { label: "Schemes", path: "/admin/schemes", icon: Award },
  ];

  return (
    <main className="flex h-screen bg-slate-100 font-sans text-slate-900">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-lg">
            <ShieldCheck size={24} />
            <span>Admin Portal</span>
          </div>
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-6 rounded-lg bg-slate-800 p-3">
            <p className="text-sm font-semibold truncate">{user?.name || "Super Admin"}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>

          <nav className="space-y-1">
            {adminNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-emerald-600 text-white" 
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
          <button
            className="lg:hidden text-slate-600 hover:text-slate-900"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="ml-auto flex items-center gap-4">
            <button className="text-slate-500 hover:text-slate-900">
              <Bell size={20} />
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>

    </main>
  );
}
