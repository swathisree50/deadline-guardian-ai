import { GoogleGenAI, Type } from "@google/genai";
import { Task, Goal, Habit } from "./db.js"; // Wait, in Node ESM, use standard imports, or relative paths. 
// Since TS is transpiled/bundled, relative import './db' is safe.

// Initialize the GoogleGenAI SDK with user telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key-for-now", // Fallback gracefully if key is not set yet
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper to check if API key exists
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
}

// 1. Task Prioritization & Context-Aware Reminders
export async function analyzeTaskPrioritization(
  task: { title: string; description: string; priority: string; category: string; difficulty: string; estimatedTime: number; deadline: string },
  userScheduleSummary: string = ""
) {
  if (!isGeminiConfigured()) {
    // Fallback if Gemini key is missing
    const isOverdue = new Date(task.deadline).getTime() < Date.now();
    return {
      priorityScore: task.priority === "high" ? 85 : task.priority === "medium" ? 60 : 35,
      urgencyScore: isOverdue ? 100 : 70,
      riskScore: task.difficulty === "hard" ? 50 : 20,
      recommendedStartTime: new Date(new Date(task.deadline).getTime() - (task.estimatedTime * 2 + 60) * 60000).toISOString(),
      deadlineProbability: task.difficulty === "hard" ? 45 : 15,
      contextReminder: `You need around ${task.estimatedTime} minutes to finish "${task.title}". Starting now gives you enough time before the deadline.`,
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analyze this task and generate smart priority scores and scheduling.
Task Details:
- Title: ${task.title}
- Description: ${task.description}
- Stated Priority: ${task.priority}
- Category: ${task.category}
- Difficulty: ${task.difficulty}
- Estimated Time: ${task.estimatedTime} minutes
- Deadline: ${task.deadline}

Current User Schedule/Context Summary:
${userScheduleSummary}

Determine:
1. priorityScore: A smart score (0-100) based on importance, deadline, and difficulty.
2. urgencyScore: A score (0-100) based on how quickly the user needs to start this task.
3. riskScore: A score (0-100) of completion risk (likelihood of missing the deadline).
4. recommendedStartTime: Suggested start date/time (ISO string format) optimized for user productivity.
5. deadlineProbability: Estimated probability percentage (0-100) of missing the deadline if they don't follow recommended starting time.
6. contextReminder: A human-centric, highly motivating, context-aware notification message like "You still need around 40 minutes to finish your assignment. Starting now gives you enough time." instead of generic "due in 1 hour".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priorityScore: { type: Type.INTEGER },
            urgencyScore: { type: Type.INTEGER },
            riskScore: { type: Type.INTEGER },
            recommendedStartTime: { type: Type.STRING },
            deadlineProbability: { type: Type.INTEGER },
            contextReminder: { type: Type.STRING },
          },
          required: ["priorityScore", "urgencyScore", "riskScore", "recommendedStartTime", "deadlineProbability", "contextReminder"],
        },
      },
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    return data;
  } catch (err) {
    console.error("Gemini prioritization analysis failed, falling back:", err);
    return {
      priorityScore: task.priority === "high" ? 80 : 50,
      urgencyScore: 65,
      riskScore: 30,
      recommendedStartTime: new Date(new Date(task.deadline).getTime() - (task.estimatedTime + 120) * 60000).toISOString(),
      deadlineProbability: 25,
      contextReminder: `Friendly reminder: "${task.title}" is scheduled to start soon. You have ${task.estimatedTime} minutes of estimated work remaining.`,
    };
  }
}

// 2. Task Breakdown (Subtask Generator)
export async function generateTaskBreakdown(title: string, description: string) {
  if (!isGeminiConfigured()) {
    return [
      { id: "sb_1", title: "Review requirements", completed: false },
      { id: "sb_2", title: "Implement core layout and logic", completed: false },
      { id: "sb_3", title: "Conduct self-testing and polish", completed: false },
    ];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Break down the large task "${title}" (${description}) into 3 to 6 logical, highly actionable subtask titles. Keep titles short, practical, and punchy.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
            },
            required: ["title"],
          },
        },
      },
    });

    const list = JSON.parse(response.text?.trim() || "[]");
    return list.map((item: any, idx: number) => ({
      id: `ai_sub_${idx}_${Date.now()}`,
      title: item.title,
      completed: false,
    }));
  } catch (err) {
    console.error("Gemini subtask generator failed, falling back:", err);
    return [
      { id: `fallback_sub_1_${Date.now()}`, title: "Initial Preparation", completed: false },
      { id: `fallback_sub_2_${Date.now()}`, title: "Core Execution Phases", completed: false },
      { id: `fallback_sub_3_${Date.now()}`, title: "Final Validation and Polish", completed: false },
    ];
  }
}

// 3. Goal conversion into daily and weekly actionable plans
export async function generateGoalPlans(title: string, description: string, deadline: string) {
  if (!isGeminiConfigured()) {
    return {
      dailyPlan: "Dedicate 30 minutes every morning to progress smaller milestones of this goal.",
      weeklyPlan: "Week 1: Foundations and planning. Week 2: Build MVP. Week 3: Testing and soft release.",
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Translate this long-term goal into daily and weekly actionable roadmaps.
Goal: "${title}"
Details: "${description}"
Target Deadline: ${deadline}

Provide:
1. dailyPlan: A compact, 1-2 sentence daily routine or micro-habit required to meet this goal.
2. weeklyPlan: A weekly milestones guide (e.g. Week 1: Setup, Week 2: Core, Week 3: Launch) to map the progression.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dailyPlan: { type: Type.STRING },
            weeklyPlan: { type: Type.STRING },
          },
          required: ["dailyPlan", "weeklyPlan"],
        },
      },
    });

    return JSON.parse(response.text?.trim() || "{}");
  } catch (err) {
    console.error("Gemini Goal Planner failed:", err);
    return {
      dailyPlan: "Commit at least 45 minutes daily toward completing critical paths.",
      weeklyPlan: "Break the milestones into three equal phases: Setup, Development, and Launch.",
    };
  }
}

// 4. Daily Planner & Schedule Optimizer
export async function generateDailyPlanner(tasks: Task[], habits: Habit[], goals: Goal[]) {
  if (!isGeminiConfigured()) {
    return [
      { time: "09:00 AM", item: "Review today's high priority tasks", type: "system" },
      ...habits.map((h, i) => ({ time: `${10 + i}:00 AM`, item: `Habit: ${h.title}`, type: "habit" })),
      ...tasks.slice(0, 3).map((t, i) => ({ time: `${1 + i}:30 PM`, item: `Focus: ${t.title}`, type: "task" })),
      { time: "05:00 PM", item: "Daily review and log habits", type: "system" },
    ];
  }

  try {
    const tasksData = tasks
      .filter((t) => t.status !== "completed")
      .map((t) => `[${t.priority} Priority] ${t.title} (${t.estimatedTime}m, difficulty: ${t.difficulty})`);
    
    const habitsData = habits.map((h) => `${h.title} (${h.frequency})`);
    const goalsData = goals.map((g) => g.title);

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an elite schedule optimizer. Generate a chronological, highly optimized daily timeline schedule incorporating the user's tasks, habits, and goals.
Pending Tasks:
${tasksData.join("\n")}

Active Habits:
${habitsData.join("\n")}

Active Long-term Goals:
${goalsData.join("\n")}

Construct a schedule with specific, realistic local times (e.g., 09:00 AM, 11:30 AM, 02:00 PM) for the day. Avoid scheduling items overlapping. Allocate breaks between intense hard tasks.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING, description: "Time of the day, e.g. 09:00 AM" },
              item: { type: Type.STRING, description: "Task, habit, or break description" },
              type: { type: Type.STRING, description: "One of: task, habit, goal, break, system" },
            },
            required: ["time", "item", "type"],
          },
        },
      },
    });

    return JSON.parse(response.text?.trim() || "[]");
  } catch (err) {
    console.error("Daily schedule generation failed:", err);
    return [
      { time: "09:00 AM", item: "Daily Standup & Schedule Review", type: "system" },
      { time: "10:00 AM", item: "Deep Work Session - High Urgency Tasks", type: "task" },
      { time: "12:00 PM", item: "Lunch Break & Recharge", type: "break" },
      { time: "01:30 PM", item: "Habit Stacking & Routine Checks", type: "habit" },
      { time: "03:00 PM", item: "Secondary Goals Progression", type: "goal" },
      { time: "05:00 PM", item: "Email review & daily wrap-up", type: "system" },
    ];
  }
}

// 5. Weekly Planner Organizer
export async function generateWeeklyPlanner(tasks: Task[], habits: Habit[], goals: Goal[]) {
  if (!isGeminiConfigured()) {
    return [
      { day: "Monday", focus: "Administrative task setup & goal alignments", tasks: [] },
      { day: "Tuesday", focus: "Core feature engineering & heavy research blocks", tasks: [] },
      { day: "Wednesday", focus: "Execution and testing iterations", tasks: [] },
      { day: "Thursday", focus: "Subtask completions & optimization sprints", tasks: [] },
      { day: "Friday", focus: "Weekly summary reviews, team demos, and deployment", tasks: [] },
    ];
  }

  try {
    const tasksSummary = tasks
      .filter((t) => t.status !== "completed")
      .map((t) => `${t.title} (Est: ${t.estimatedTime}m, due: ${t.deadline})`);
    
    const goalsSummary = goals.map((g) => `${g.title} (due: ${g.deadline})`);

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an expert project manager. Distribute the following goals and tasks across the week (Monday through Sunday) for optimal productivity, balance, and deadline safety.
Pending Tasks:
${tasksSummary.join("\n")}

Active Goals:
${goalsSummary.join("\n")}

Create a high-level focus theme for each day, and map specific tasks or objectives to each day.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING, description: "Monday, Tuesday, etc." },
              focus: { type: Type.STRING, description: "High level focus theme for this day" },
              tasks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Titles of tasks mapped to this day",
              },
            },
            required: ["day", "focus", "tasks"],
          },
        },
      },
    });

    return JSON.parse(response.text?.trim() || "[]");
  } catch (err) {
    console.error("Weekly planner generation failed:", err);
    return [
      { day: "Monday", focus: "Strategy and Admin setup", tasks: ["Review high priority deadlines"] },
      { day: "Tuesday", focus: "Deep Work execution", tasks: ["Execute high difficulty tasks"] },
      { day: "Wednesday", focus: "Mid-week milestones checks", tasks: ["Review subtask completion rates"] },
      { day: "Thursday", focus: "Secondary focus paths", tasks: ["Focus on habit tracking consistency"] },
      { day: "Friday", focus: "Review, Polish & Deployment", tasks: ["Polish open tasks", "Update weekly progress metrics"] },
      { day: "Saturday", focus: "Personal growth & resting", tasks: [] },
      { day: "Sunday", focus: "Weekly retrospective & planning next week", tasks: ["Calibrate goal plans"] },
    ];
  }
}

// 6. Productivity Coach, Burnout Detection & Habit Coaching
export async function getCoachAdvice(tasks: Task[], habits: Habit[], goals: Goal[]) {
  if (!isGeminiConfigured()) {
    return {
      burnoutIndex: 45, // 0-100
      burnoutWarning: "Moderate intensity. Ensure you get 15-minute breaks after every 2 hours of deep focus.",
      habitAdvice: "Your habit consistency is good! Try stacking 'Daily Review' right after 'Deep Work Session' to maintain high flow.",
      generalTips: [
        "Schedule hardest tasks in the morning when mental energy peaks.",
        "Turn off secondary screens and instant messaging during scheduled recommended start times.",
        "Split any task with difficulty 'hard' and duration > 120m into smaller 30m intervals.",
      ],
    };
  }

  try {
    const tasksSummary = tasks.map(
      (t) => `- [${t.status}] ${t.title} (difficulty: ${t.difficulty}, estimated time: ${t.estimatedTime}m, deadline: ${t.deadline})`
    );
    const habitsSummary = habits.map(
      (h) => `- Habit: ${h.title} (streak: ${h.streak}, completed dates count: ${h.history.filter((hItem) => hItem.status === "completed").length})`
    );

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are a legendary high-performance executive productivity coach and behavioral psychologist. Analyze the user's workload, schedules, deadlines, difficulty distribution, and habit consistency to offer highly personalized advice.
Tasks list:
${tasksSummary.join("\n")}

Habits status:
${habitsSummary.join("\n")}

Assess:
1. burnoutIndex: Number between 0 and 100 assessing burnout threat (high concentration of hard tasks with near deadlines, low break periods).
2. burnoutWarning: Practical advice on avoiding exhaustion or how to reschedule tasks to recover.
3. habitAdvice: Strategy to improve habit completion rates and stack routines.
4. generalTips: Array of 3-4 highly specific, scientific, actionable tips to save time and finish tasks faster based on their current load.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            burnoutIndex: { type: Type.INTEGER },
            burnoutWarning: { type: Type.STRING },
            habitAdvice: { type: Type.STRING },
            generalTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["burnoutIndex", "burnoutWarning", "habitAdvice", "generalTips"],
        },
      },
    });

    return JSON.parse(response.text?.trim() || "{}");
  } catch (err) {
    console.error("Productivity Coach failure, falling back:", err);
    return {
      burnoutIndex: 30,
      burnoutWarning: "Healthy workload level. Maintain momentum with 50-minute focused blocks followed by 10-minute rests.",
      habitAdvice: "Excellent habit tracking! Try to tie your habits immediately after trigger events to lock down long-term routines.",
      generalTips: [
        "Plan tomorrow's most critical task tonight before logging off.",
        "Minimize visual multitasking—keep only one browser tab active per focus task.",
        "Establish clear boundaries: do not execute hard work tasks after 8:00 PM.",
      ],
    };
  }
}
