import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { User, Task, Goal, Habit, Notification, CoachAdvice, AnalyticsData } from "../types.ts";

interface AppContextType {
  user: User | null;
  token: string | null;
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  notifications: Notification[];
  coachAdvice: CoachAdvice | null;
  analytics: AnalyticsData | null;
  loading: boolean;
  authLoading: boolean;
  coachLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  fetchTasks: () => Promise<void>;
  createTask: (taskData: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  triggerTaskBreakdown: (id: string) => Promise<void>;
  fetchGoals: () => Promise<void>;
  createGoal: (goalData: Partial<Goal>) => Promise<Goal>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  fetchHabits: () => Promise<void>;
  createHabit: (habitData: Partial<Habit>) => Promise<Habit>;
  toggleHabit: (id: string, date?: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  fetchCoachAdvice: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  refreshAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("guardian_token"));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [coachAdvice, setCoachAdvice] = useState<CoachAdvice | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [coachLoading, setCoachLoading] = useState<boolean>(false);

  // Set default axios headers
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }

  // Load User profile on mount or token change
  useEffect(() => {
    const initializeUser = async () => {
      if (!token) {
        setUser(null);
        setAuthLoading(false);
        return;
      }
      try {
        setAuthLoading(true);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const res = await axios.get("/api/auth/profile");
        setUser(res.data);
      } catch (err) {
        console.error("Token invalid or expired. Logging out.");
        logout();
      } finally {
        setAuthLoading(false);
      }
    };
    initializeUser();
  }, [token]);

  // Load data when user logs in
  useEffect(() => {
    if (user) {
      refreshAllData();
    } else {
      // Reset state on logout
      setTasks([]);
      setGoals([]);
      setHabits([]);
      setNotifications([]);
      setCoachAdvice(null);
      setAnalytics(null);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    const res = await axios.post("/api/auth/login", { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem("guardian_token", receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
  };

  const signup = async (email: string, password: string, name: string) => {
    const res = await axios.post("/api/auth/signup", { email, password, name });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem("guardian_token", receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
  };

  const logout = () => {
    localStorage.removeItem("guardian_token");
    setToken(null);
    setUser(null);
  };

  // Helper to fetch all primary resources
  const refreshAllData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await Promise.all([
        fetchTasks(),
        fetchGoals(),
        fetchHabits(),
        fetchNotifications(),
        fetchAnalytics(),
      ]);
      // Advice can load secondary
      fetchCoachAdvice();
    } catch (err) {
      console.error("Failed to refresh application data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    const res = await axios.get("/api/tasks");
    setTasks(res.data);
  };

  const createTask = async (taskData: Partial<Task>): Promise<Task> => {
    const res = await axios.post("/api/tasks", taskData);
    const newTask = res.data;
    setTasks((prev) => [newTask, ...prev]);
    fetchAnalytics(); // update statistics
    fetchNotifications();
    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const res = await axios.put(`/api/tasks/${id}`, updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    // If complete status was toggled, update profile score indicators
    if (updates.status === "completed") {
      axios.get("/api/auth/profile").then((r) => setUser(r.data));
    }
    fetchAnalytics();
    fetchNotifications();
  };

  const deleteTask = async (id: string) => {
    await axios.delete(`/api/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    fetchAnalytics();
  };

  const triggerTaskBreakdown = async (id: string) => {
    const res = await axios.post(`/api/tasks/${id}/breakdown`);
    setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
  };

  const fetchGoals = async () => {
    const res = await axios.get("/api/goals");
    setGoals(res.data);
  };

  const createGoal = async (goalData: Partial<Goal>): Promise<Goal> => {
    const res = await axios.post("/api/goals", goalData);
    const newGoal = res.data;
    setGoals((prev) => [newGoal, ...prev]);
    return newGoal;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const res = await axios.put(`/api/goals/${id}`, updates);
    setGoals((prev) => prev.map((g) => (g.id === id ? res.data : g)));
  };

  const deleteGoal = async (id: string) => {
    await axios.delete(`/api/goals/${id}`);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const fetchHabits = async () => {
    const res = await axios.get("/api/habits");
    setHabits(res.data);
  };

  const createHabit = async (habitData: Partial<Habit>): Promise<Habit> => {
    const res = await axios.post("/api/habits", habitData);
    const newHabit = res.data;
    setHabits((prev) => [newHabit, ...prev]);
    fetchAnalytics();
    return newHabit;
  };

  const toggleHabit = async (id: string, date?: string) => {
    const res = await axios.post(`/api/habits/${id}/toggle`, { date });
    setHabits((prev) => prev.map((h) => (h.id === id ? res.data : h)));
    fetchAnalytics();
  };

  const deleteHabit = async (id: string) => {
    await axios.delete(`/api/habits/${id}`);
    setHabits((prev) => prev.filter((h) => h.id !== id));
    fetchAnalytics();
  };

  const fetchNotifications = async () => {
    const res = await axios.get("/api/notifications");
    setNotifications(res.data);
  };

  const markNotificationRead = async (id: string) => {
    await axios.post(`/api/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = async (id: string) => {
    await axios.delete(`/api/notifications/${id}`);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const fetchCoachAdvice = async () => {
    setCoachLoading(true);
    try {
      const res = await axios.get("/api/ai/coach-advice");
      setCoachAdvice(res.data);
    } catch (err) {
      console.error("Failed to load Coach insights:", err);
    } finally {
      setCoachLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get("/api/analytics");
      setAnalytics(res.data);
    } catch (err) {
      console.error("Failed to load Analytics dashboard metrics:", err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        tasks,
        goals,
        habits,
        notifications,
        coachAdvice,
        analytics,
        loading,
        authLoading,
        coachLoading,
        login,
        signup,
        logout,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        triggerTaskBreakdown,
        fetchGoals,
        createGoal,
        updateGoal,
        deleteGoal,
        fetchHabits,
        createHabit,
        toggleHabit,
        deleteHabit,
        fetchNotifications,
        markNotificationRead,
        deleteNotification,
        fetchCoachAdvice,
        fetchAnalytics,
        refreshAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
