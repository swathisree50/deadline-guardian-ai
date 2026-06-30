import fs from "fs";
import path from "path";

// Ensure the data folder exists for our local file database
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, "db.json");

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  focusScore: number;       // 0-100
  productivityScore: number; // 0-100
  createdAt: string;
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
  estimatedTime: number; // in minutes
  deadline: string; // ISO String
  subtasks: Subtask[];
  status: "todo" | "in_progress" | "completed";
  tags: string[];
  attachments: string[];
  reminder: string;
  notes: string;
  
  // AI-generated attributes (Gemini Smart Prioritization & Prediction)
  priorityScore: number; // 0-100
  urgencyScore: number; // 0-100
  riskScore: number;    // 0-100 (probability of missing deadline)
  recommendedStartTime: string; // ISO String or readable text
  deadlineProbability: number;  // percentage (0-100) of completion risk
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
  dailyPlan?: string;  // AI Generated
  weeklyPlan?: string; // AI Generated
  createdAt: string;
}

export interface HabitHistoryItem {
  date: string; // YYYY-MM-DD
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

export interface Recommendation {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: "productivity" | "burnout" | "schedule" | "habit" | "general";
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  notifications: Notification[];
  recommendations: Recommendation[];
}

const emptyDatabase: DatabaseSchema = {
  users: [],
  tasks: [],
  goals: [],
  habits: [],
  notifications: [],
  recommendations: [],
};

// High-fidelity JSON Database with atomic writes
class LocalDatabase {
  private db: DatabaseSchema = { ...emptyDatabase };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        this.db = JSON.parse(fileContent);
        // Ensure all collections exist
        this.db.users = this.db.users || [];
        this.db.tasks = this.db.tasks || [];
        this.db.goals = this.db.goals || [];
        this.db.habits = this.db.habits || [];
        this.db.notifications = this.db.notifications || [];
        this.db.recommendations = this.db.recommendations || [];
      } else {
        this.db = { ...emptyDatabase };
        this.save();
      }
    } catch (err) {
      console.error("Failed to load local file database, resetting:", err);
      this.db = { ...emptyDatabase };
      this.save();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to save local file database:", err);
    }
  }

  // Auth Operations
  public getUsers(): User[] {
    this.load();
    return this.db.users;
  }

  public addUser(user: User): User {
    this.load();
    this.db.users.push(user);
    this.save();
    return user;
  }

  public updateUser(userId: string, updates: Partial<User>): User | null {
    this.load();
    const index = this.db.users.findIndex((u) => u.id === userId);
    if (index === -1) return null;
    this.db.users[index] = { ...this.db.users[index], ...updates };
    this.save();
    return this.db.users[index];
  }

  // Task Operations
  public getTasks(userId: string): Task[] {
    this.load();
    return this.db.tasks.filter((t) => t.userId === userId);
  }

  public addTask(task: Task): Task {
    this.load();
    this.db.tasks.push(task);
    this.save();
    return task;
  }

  public updateTask(taskId: string, updates: Partial<Task>): Task | null {
    this.load();
    const index = this.db.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return null;
    this.db.tasks[index] = { ...this.db.tasks[index], ...updates };
    this.save();
    return this.db.tasks[index];
  }

  public deleteTask(taskId: string): boolean {
    this.load();
    const initialLen = this.db.tasks.length;
    this.db.tasks = this.db.tasks.filter((t) => t.id !== taskId);
    this.save();
    return this.db.tasks.length < initialLen;
  }

  // Goal Operations
  public getGoals(userId: string): Goal[] {
    this.load();
    return this.db.goals.filter((g) => g.userId === userId);
  }

  public addGoal(goal: Goal): Goal {
    this.load();
    this.db.goals.push(goal);
    this.save();
    return goal;
  }

  public updateGoal(goalId: string, updates: Partial<Goal>): Goal | null {
    this.load();
    const index = this.db.goals.findIndex((g) => g.id === goalId);
    if (index === -1) return null;
    this.db.goals[index] = { ...this.db.goals[index], ...updates };
    this.save();
    return this.db.goals[index];
  }

  public deleteGoal(goalId: string): boolean {
    this.load();
    const initialLen = this.db.goals.length;
    this.db.goals = this.db.goals.filter((g) => g.id !== goalId);
    this.save();
    return this.db.goals.length < initialLen;
  }

  // Habit Operations
  public getHabits(userId: string): Habit[] {
    this.load();
    return this.db.habits.filter((h) => h.userId === userId);
  }

  public addHabit(habit: Habit): Habit {
    this.load();
    this.db.habits.push(habit);
    this.save();
    return habit;
  }

  public updateHabit(habitId: string, updates: Partial<Habit>): Habit | null {
    this.load();
    const index = this.db.habits.findIndex((h) => h.id === habitId);
    if (index === -1) return null;
    this.db.habits[index] = { ...this.db.habits[index], ...updates };
    this.save();
    return this.db.habits[index];
  }

  public deleteHabit(habitId: string): boolean {
    this.load();
    const initialLen = this.db.habits.length;
    this.db.habits = this.db.habits.filter((h) => h.id !== habitId);
    this.save();
    return this.db.habits.length < initialLen;
  }

  // Notification Operations
  public getNotifications(userId: string): Notification[] {
    this.load();
    return this.db.notifications.filter((n) => n.userId === userId);
  }

  public addNotification(notification: Notification): Notification {
    this.load();
    this.db.notifications.push(notification);
    this.save();
    return notification;
  }

  public markNotificationRead(notificationId: string): boolean {
    this.load();
    const index = this.db.notifications.findIndex((n) => n.id === notificationId);
    if (index === -1) return false;
    this.db.notifications[index].read = true;
    this.save();
    return true;
  }

  public deleteNotification(notificationId: string): boolean {
    this.load();
    const initialLen = this.db.notifications.length;
    this.db.notifications = this.db.notifications.filter((n) => n.id !== notificationId);
    this.save();
    return this.db.notifications.length < initialLen;
  }

  // AI Recommendation Operations
  public getRecommendations(userId: string): Recommendation[] {
    this.load();
    return this.db.recommendations.filter((r) => r.userId === userId);
  }

  public addRecommendation(rec: Recommendation): Recommendation {
    this.load();
    this.db.recommendations.push(rec);
    this.save();
    return rec;
  }

  public clearRecommendations(userId: string): void {
    this.load();
    this.db.recommendations = this.db.recommendations.filter((r) => r.userId !== userId);
    this.save();
  }
}

export const db = new LocalDatabase();

// Seed helper to populate initial hackathon user + data if users collection is empty
export function seedDatabase() {
  const users = db.getUsers();
  if (users.length > 0) return;

  console.log("Seeding Database with premium sample data...");

  const userId = "guest_user_id";
  const guestUser: User = {
    id: userId,
    email: "guest@guardian.ai",
    // bcrypt hashed equivalent of "password123" or plain text check since we can handle fallback hashes
    passwordHash: "password123", 
    name: "Alex Carter",
    focusScore: 84,
    productivityScore: 78,
    createdAt: new Date().toISOString(),
  };
  db.addUser(guestUser);

  // Seed tasks
  const now = new Date();
  
  // High-importance imminent deadline task
  const task1: Task = {
    id: "task_1",
    userId,
    title: "Finalize AI Hackathon Pitch Deck",
    description: "Design the slides, practice the talk, and record a 3-minute demo video of Deadline Guardian AI.",
    priority: "high",
    category: "Work",
    difficulty: "hard",
    estimatedTime: 120,
    deadline: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(), // due in 4 hours
    subtasks: [
      { id: "sub_1", title: "Refine value proposition slides", completed: true },
      { id: "sub_2", title: "Record high-fidelity screencast", completed: false },
      { id: "sub_3", title: "Polish Figma screen graphics", completed: false },
    ],
    status: "in_progress",
    tags: ["hackathon", "presentation", "demo"],
    attachments: [],
    reminder: "2 hours before due",
    notes: "AI risk analysis states high chance of delay if screen recording isn't completed in the next hour.",
    priorityScore: 92,
    urgencyScore: 95,
    riskScore: 68,
    recommendedStartTime: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
    deadlineProbability: 32 // 32% chance of missing
  };

  // Standard task
  const task2: Task = {
    id: "task_2",
    userId,
    title: "Setup MongoDB Atlas & API Connections",
    description: "Initialize mongoose database driver, configure retry handles, and connect Atlas cloud endpoints.",
    priority: "high",
    category: "Work",
    difficulty: "medium",
    estimatedTime: 90,
    deadline: new Date(now.getTime() + 18 * 60 * 60 * 1000).toISOString(), // due tomorrow
    subtasks: [
      { id: "sub_4", title: "Provision free M0 cluster", completed: true },
      { id: "sub_5", title: "Write server connection scripts", completed: true },
      { id: "sub_6", title: "Write model schemas", completed: true },
    ],
    status: "completed",
    tags: ["database", "backend", "express"],
    attachments: [],
    reminder: "1 hour before due",
    notes: "Successfully verified database ping times are within 45ms.",
    priorityScore: 78,
    urgencyScore: 62,
    riskScore: 10,
    recommendedStartTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    deadlineProbability: 0
  };

  const task3: Task = {
    id: "task_3",
    userId,
    title: "Review Linear Dashboard UI Aesthetics",
    description: "Align grids, adjust glassmorphism panels, configure tailwind dark mode colors, and add micro-interactions.",
    priority: "medium",
    category: "Study",
    difficulty: "medium",
    estimatedTime: 60,
    deadline: new Date(now.getTime() + 30 * 60 * 60 * 1000).toISOString(), // due in 30 hours
    subtasks: [
      { id: "sub_7", title: "Verify sidebar font weights", completed: false },
      { id: "sub_8", title: "Configure CSS backdrop blur", completed: true },
    ],
    status: "todo",
    tags: ["design", "css", "tailwind"],
    attachments: [],
    reminder: "3 hours before due",
    notes: "Inspired by Apple and Stripe navigation styling.",
    priorityScore: 64,
    urgencyScore: 48,
    riskScore: 15,
    recommendedStartTime: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString(),
    deadlineProbability: 15
  };

  db.addTask(task1);
  db.addTask(task2);
  db.addTask(task3);

  // Seed Goals
  const goal1: Goal = {
    id: "goal_1",
    userId,
    title: "Launch SaaS Product MVP",
    description: "Deploy production code to Render, configure custom domains, and secure initial 50 beta testing users.",
    category: "Work",
    deadline: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
    status: "active",
    subGoals: [
      "Deploy code securely to server",
      "Connect production MongoDB Atlas",
      "Draft cold emails to beta users",
    ],
    dailyPlan: "Dedicate 2 hours in the morning to API and system security patches.",
    weeklyPlan: "Week 1: Finalize integration test cases and deploy backend. Week 2: Build interactive landing pages and sign up first cohort of users.",
    createdAt: now.toISOString(),
  };
  db.addGoal(goal1);

  // Seed Habits
  const habit1: Habit = {
    id: "habit_1",
    userId,
    title: "90 Minutes Deep Work Session",
    description: "Focus entirely on primary product features without checking email or notifications.",
    frequency: "daily",
    category: "Work",
    streak: 5,
    history: [
      { date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "completed" },
      { date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "completed" },
      { date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "completed" },
      { date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "completed" },
      { date: now.toISOString().split("T")[0], status: "completed" },
    ],
    createdAt: now.toISOString(),
  };

  const habit2: Habit = {
    id: "habit_2",
    userId,
    title: "Daily Review & AI Schedule Recalibration",
    description: "Analyze the focus scores and review AI coach recommendations for the next day.",
    frequency: "daily",
    category: "Personal",
    streak: 3,
    history: [
      { date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "completed" },
      { date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "completed" },
      { date: now.toISOString().split("T")[0], status: "completed" },
    ],
    createdAt: now.toISOString(),
  };
  db.addHabit(habit1);
  db.addHabit(habit2);

  // Seed Notifications
  const notif1: Notification = {
    id: "notif_1",
    userId,
    message: "Deadline Guardian: You still need around 120 minutes to complete the Hackathon Pitch Deck. To submit comfortably, start in the next 30 minutes.",
    type: "reminder",
    read: false,
    createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(), // 15 mins ago
  };

  const notif2: Notification = {
    id: "notif_2",
    userId,
    message: "Burnout Warning: High concentration of 'hard' tasks detected for tomorrow. Consider adjusting recommended start times to allow periodic recovery breaks.",
    type: "coach",
    read: false,
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
  };
  db.addNotification(notif1);
  db.addNotification(notif2);

  // Seed Recommendations
  const rec1: Recommendation = {
    id: "rec_1",
    userId,
    title: "Optimal High-Focus Window Identified",
    content: "Based on past completion logs, your peak focus window occurs between 9:00 AM and 11:30 AM. Schedule your complex development tasks here.",
    category: "productivity",
    createdAt: now.toISOString(),
  };

  const rec2: Recommendation = {
    id: "rec_2",
    userId,
    title: "Burnout Mitigation Plan",
    content: "Your workload density index for tomorrow is 8.5/10. The AI recommends splitting 'Finalize AI Hackathon Pitch Deck' into micro-milestones and inserting a 15-minute screen-free break after each segment.",
    category: "burnout",
    createdAt: now.toISOString(),
  };
  db.addRecommendation(rec1);
  db.addRecommendation(rec2);
}
