import React from "react";
import { useApp } from "../context/AppContext.tsx";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Flame,
  Award,
  Sparkles,
  PieChart as PieIcon,
  TrendingUp
} from "lucide-react";

const COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#3b82f6"];

export const AnalyticsView: React.FC = () => {
  const { analytics, loading } = useApp();

  if (loading || !analytics) {
    return (
      <div className="space-y-6 py-12 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-900 border border-gray-800 rounded-3xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-gray-900 border border-gray-800 rounded-3xl"></div>
          <div className="h-80 bg-gray-900 border border-gray-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Task Completion Rate",
      value: `${analytics.completionRate}%`,
      sub: `${analytics.tasksBreakdown.completed} finished out of ${analytics.tasksBreakdown.total}`,
      icon: CheckCircle2,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/15",
    },
    {
      title: "Urgent Overdue Tasks",
      value: `${analytics.missedDeadlines}`,
      sub: "Immediate attention required",
      icon: AlertTriangle,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/15",
    },
    {
      title: "Focus Time Invested",
      value: `${analytics.focusHours} hrs`,
      sub: "Total deep execution logs",
      icon: Clock,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/15",
    },
    {
      title: "Habit Stack Consistency",
      value: `${analytics.habitConsistency}%`,
      sub: "Historical routine sync index",
      icon: Flame,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/15",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <div key={idx} className="glass-panel rounded-3xl p-6 border border-gray-800 flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${stat.color}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block font-medium">{stat.title}</span>
                <span className="text-2xl font-bold font-display text-white block mt-1">
                  {stat.value}
                </span>
                <span className="text-[10px] text-gray-500 block mt-1">{stat.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Trends Over Time */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-gray-800 flex flex-col justify-between h-96">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-sm text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-400" /> Focus & Productivity Trends
              </h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mt-0.5">
                Past 7-day metric logs
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Productivity
              </span>
              <span className="flex items-center gap-1 text-rose-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Focus
              </span>
            </div>
          </div>

          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.history7Days} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="prodColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="focusColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(17, 24, 39, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
                <Area type="monotone" dataKey="productivityScore" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#prodColor)" />
                <Area type="monotone" dataKey="focusScore" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#focusColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category distribution pie */}
        <div className="glass-panel rounded-3xl p-6 border border-gray-800 flex flex-col justify-between h-96">
          <div>
            <h3 className="font-display font-semibold text-sm text-white flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-indigo-400" /> Category Allocation
            </h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mt-0.5">
              Density distribution of tasks
            </p>
          </div>

          <div className="flex-1 w-full h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Pie
                  data={analytics.categoryDistribution.filter((x) => x.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(17, 24, 39, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Centered label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-xl font-bold text-white">{analytics.tasksBreakdown.total}</span>
              <span className="text-[9px] uppercase tracking-wider text-gray-500">Total Tasks</span>
            </div>
          </div>

          {/* Custom legends */}
          <div className="space-y-1.5 pt-2 border-t border-gray-900">
            {analytics.categoryDistribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="text-gray-400">{entry.name}</span>
                </div>
                <span className="font-semibold text-gray-200">{entry.value} tasks</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
