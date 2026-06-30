import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.tsx";
import { Bell, Search, Sparkles, Check, Trash2, ShieldAlert, BrainCircuit, Info } from "lucide-react";

interface NavbarProps {
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const { user, notifications, markNotificationRead, deleteNotification } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.read);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "escalation":
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case "coach":
        return <BrainCircuit className="w-4 h-4 text-indigo-400" />;
      case "reminder":
        return <Bell className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <header className="h-20 glass-panel border-b border-gray-800 flex items-center justify-between px-8 sticky top-0 z-20 backdrop-blur-md">
      {/* Title & Time */}
      <div className="flex flex-col">
        <h2 className="font-display font-semibold text-xl text-white tracking-wide">{title}</h2>
        <span className="text-xs text-gray-400 mt-0.5">
          {time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} •{" "}
          {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        {/* Productivity Quick Badge */}
        {user && (
          <div className="hidden md:flex items-center gap-4 bg-gray-900/60 border border-gray-800 rounded-full px-4 py-1.5">
            <div className="flex items-center gap-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-gray-400 font-medium">Productivity Index:</span>
              <span className="text-emerald-400 font-semibold">{user.productivityScore}%</span>
            </div>
            <div className="w-px h-3 bg-gray-800"></div>
            <div className="flex items-center gap-1 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-gray-400 font-medium">Focus:</span>
              <span className="text-indigo-400 font-semibold">{user.focusScore}%</span>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative hidden lg:block w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search deadlines, tags..."
            className="w-full bg-gray-950/40 border border-gray-800 rounded-xl py-2 pl-9 pr-4 text-xs text-gray-300 placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {/* Notifications Panel */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-gray-900/50 border border-gray-800/80 text-gray-400 hover:text-white hover:border-gray-700 transition-all relative"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-gray-950 animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 glass-panel border border-gray-800 rounded-2xl shadow-2xl p-4 overflow-hidden z-50">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  AI Stream Notifications ({unreadNotifications.length})
                </h3>
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto space-y-2.5">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-xs text-gray-500">No active notifications</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-xl border transition-all text-xs flex gap-2.5 ${
                        notif.read
                          ? "bg-gray-950/20 border-gray-900/40 opacity-60"
                          : "bg-indigo-950/10 border-indigo-950/30"
                      }`}
                    >
                      <div className="mt-0.5">{getNotifIcon(notif.type)}</div>
                      <div className="flex-1">
                        <p className="text-gray-300 leading-normal">{notif.message}</p>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-900/40">
                          <span className="text-[10px] text-gray-500">
                            {new Date(notif.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <div className="flex items-center gap-2">
                            {!notif.read && (
                              <button
                                onClick={() => markNotificationRead(notif.id)}
                                className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
                              >
                                <Check className="w-2.5 h-2.5" /> Mark read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notif.id)}
                              className="text-[10px] text-gray-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
