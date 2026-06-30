import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext.tsx";
import { Sidebar } from "./components/Sidebar.tsx";
import { Navbar } from "./components/Navbar.tsx";
import { AuthView } from "./components/AuthView.tsx";
import { DashboardView } from "./components/DashboardView.tsx";
import { TasksView } from "./components/TasksView.tsx";
import { HabitsGoalsView } from "./components/HabitsGoalsView.tsx";
import { AnalyticsView } from "./components/AnalyticsView.tsx";
import { ProfileView } from "./components/ProfileView.tsx";
import { Loader2 } from "lucide-react";

const MainLayout: React.FC = () => {
  const { user, authLoading } = useApp();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-gray-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-xs font-semibold tracking-wider uppercase">Aligning AI parameters...</p>
      </div>
    );
  }

  // Auth Guard
  if (!user) {
    return <AuthView />;
  }

  // Get active tab content and title
  const renderContent = () => {
    switch (activeTab) {
      case "tasks":
        return <TasksView />;
      case "habits-goals":
        return <HabitsGoalsView />;
      case "analytics":
        return <AnalyticsView />;
      case "profile":
        return <ProfileView />;
      default:
        return <DashboardView />;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "tasks":
        return "Task Management Engine";
      case "habits-goals":
        return "Habit Stack & Strategic Roadmaps";
      case "analytics":
        return "Cognitive Analytics & Coach Insights";
      case "profile":
        return "Ecosystem Profile Configurations";
      default:
        return "Productivity Control Center";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 flex font-sans">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col pl-64 min-h-screen overflow-hidden">
        {/* Navbar */}
        <Navbar title={getTabTitle()} />

        {/* Workspace Canvas Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
