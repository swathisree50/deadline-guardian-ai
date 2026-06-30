import React from "react";
import { useApp } from "../context/AppContext.tsx";
import {
  LayoutDashboard,
  CheckSquare,
  Activity,
  User as UserIcon,
  Flame,
  Calendar,
  AlertTriangle,
  Sparkles,
  LogOut,
  Clock
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useApp();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tasks", label: "Task Management", icon: CheckSquare },
    { id: "habits-goals", label: "Habits & Goals", icon: Flame },
    { id: "analytics", label: "Insights & Analytics", icon: Activity },
    { id: "profile", label: "Profile", icon: UserIcon },
  ];

  return (
    <div className="w-64 glass-panel border-r border-gray-800 text-gray-300 flex flex-col h-screen fixed top-0 left-0 z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-500/10">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg leading-tight text-white tracking-wide">
            Guardian AI
          </h1>
          <p className="text-xs text-indigo-400 font-medium uppercase tracking-widest">
            Deadline Guardian
          </p>
        </div>
      </div>

      {/* User Quick Info */}
      {user && (
        <div className="p-4 mx-4 mt-6 bg-gray-900/40 rounded-2xl border border-gray-800/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-display font-bold flex items-center justify-center shadow-sm">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-white truncate">{user.name}</h4>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
              <span className="flex items-center gap-0.5 text-indigo-400">
                <Sparkles className="w-3 h-3" /> Focus: {user.focusScore}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 mt-6 space-y-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15 font-semibold"
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};
