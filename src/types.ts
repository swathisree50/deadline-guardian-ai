export interface User {
  id: string;
  email: string;
  name: string;
  focusScore: number;
  productivityScore: number;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  category: "Work" | "Study" | "Health" | "Personal" | "Finance";
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: number;
  deadline: string;
  subtasks: Subtask[];
  status: "todo" | "in_progress" | "completed";
  tags: string[];
  attachments: string[];
  reminder: string;
  notes: string;
  priorityScore: number;
  urgencyScore: number;
  riskScore: number;
  recommendedStartTime: string;
  deadlineProbability: number;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  deadline: string;
  status: "active" | "completed";
  subGoals: string[];
  dailyPlan?: string;
  weeklyPlan?: string;
  createdAt: string;
}

export interface HabitHistoryItem {
  date: string;
  status: "completed" | "skipped";
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description: string;
  frequency: "daily" | "weekly";
  category: string;
  streak: number;
  history: HabitHistoryItem[];
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: "reminder" | "escalation" | "info" | "coach";
  read: boolean;
  createdAt: string;
}

export interface CoachAdvice {
  burnoutIndex: number;
  burnoutWarning: string;
  habitAdvice: string;
  generalTips: string[];
}

export interface AnalyticsData {
  completionRate: number;
  missedDeadlines: number;
  focusHours: number;
  habitConsistency: number;
  categoryDistribution: { name: string; value: number }[];
  history7Days: { date: string; productivityScore: number; focusScore: number }[];
  tasksBreakdown: {
    total: number;
    completed: number;
    pending: number;
    highPriority: number;
  };
}
