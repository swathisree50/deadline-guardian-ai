import React, { useState } from "react";
import { useApp } from "../context/AppContext.tsx";
import { Habit, Goal } from "../types.ts";
import {
  Flame,
  Plus,
  Compass,
  CheckCircle,
  Calendar,
  Sparkles,
  Award,
  BookOpen,
  TrendingUp,
  Trash2,
  Check,
  BrainCircuit,
  Smile
} from "lucide-react";

export const HabitsGoalsView: React.FC = () => {
  const {
    habits,
    goals,
    createHabit,
    deleteHabit,
    toggleHabit,
    createGoal,
    deleteGoal,
  } = useApp();

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  // New Habit Form State
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [habitTitle, setHabitTitle] = useState("");
  const [habitDesc, setHabitDesc] = useState("");
  const [habitFreq, setHabitFreq] = useState<"daily" | "weekly">("daily");
  const [habitCat, setHabitCat] = useState("Study");
  const [habitLoading, setHabitLoading] = useState(false);

  // New Goal Form State
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDesc, setGoalDesc] = useState("");
  const [goalCat, setGoalCat] = useState("Work");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [subGoalsInput, setSubGoalsInput] = useState("");
  const [goalLoading, setGoalLoading] = useState(false);

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  // Handle Habit Submission
  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle) return;
    setHabitLoading(true);
    try {
      await createHabit({
        title: habitTitle,
        description: habitDesc,
        frequency: habitFreq,
        category: habitCat,
      });
      setHabitTitle("");
      setHabitDesc("");
      setShowHabitForm(false);
    } catch (err) {
      console.error("Habit creation failed:", err);
    } finally {
      setHabitLoading(false);
    }
  };

  // Handle Goal Submission
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle || !goalDeadline) return;
    setGoalLoading(true);
    try {
      const parsedSubGoals = subGoalsInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const created = await createGoal({
        title: goalTitle,
        description: goalDesc,
        category: goalCat,
        deadline: new Date(goalDeadline).toISOString(),
        subGoals: parsedSubGoals,
      });

      setGoalTitle("");
      setGoalDesc("");
      setSubGoalsInput("");
      setGoalDeadline("");
      setShowGoalForm(false);
      setSelectedGoalId(created.id); // select new goal
    } catch (err) {
      console.error("Goal creation failed:", err);
    } finally {
      setGoalLoading(false);
    }
  };

  // Verify if completed today
  const isCompletedToday = (habit: Habit) => {
    const todayStr = new Date().toISOString().split("T")[0];
    return habit.history.some((h) => h.date === todayStr && h.status === "completed");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-140px)] items-stretch">
      {/* Habit Tracker Section */}
      <div className="lg:col-span-2 flex flex-col h-full bg-gray-950/20 rounded-3xl border border-gray-900 overflow-hidden">
        <div className="p-5 border-b border-gray-900 bg-gray-900/10 flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500 fill-rose-500/20" /> Habit Multiplier
            </h3>
            <p className="text-[10px] text-gray-500 uppercase font-medium tracking-wide">Daily consistency trackers</p>
          </div>
          <button
            onClick={() => setShowHabitForm(true)}
            className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Habit Card List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {habits.length === 0 ? (
            <div className="py-12 text-center text-gray-600">
              <Smile className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Establish your first habits to build streaks!</p>
            </div>
          ) : (
            habits.map((habit) => {
              const isDone = isCompletedToday(habit);
              return (
                <div
                  key={habit.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    isDone
                      ? "bg-rose-950/5 border-rose-950/20 opacity-75"
                      : "bg-gray-900/20 border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] text-rose-400 font-bold tracking-wider bg-rose-500/5 px-2 py-0.5 rounded-md uppercase border border-rose-500/10">
                      {habit.category}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-1.5 truncate">{habit.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{habit.description}</p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Flame className="w-4.5 h-4.5 text-rose-500" />
                      <span className="text-xs font-bold text-rose-400 font-mono">
                        {habit.streak} Day Streak
                      </span>
                    </div>
                  </div>

                  {/* Toggle Completed */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                        isDone
                          ? "bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-600/15"
                          : "bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-600"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="text-gray-600 hover:text-rose-400 p-1.5 hover:bg-rose-500/5 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Goal Planner Roadmap Section */}
      <div className="lg:col-span-3 flex flex-col h-full bg-gray-950/20 rounded-3xl border border-gray-900 overflow-hidden">
        <div className="p-5 border-b border-gray-900 bg-gray-900/10 flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-500" /> Goal Planner Roadmaps
            </h3>
            <p className="text-[10px] text-gray-500 uppercase font-medium tracking-wide">AI-Generated Long-term Sprints</p>
          </div>
          <button
            onClick={() => setShowGoalForm(true)}
            className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Goal bento-grid distribution content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-900 overflow-hidden h-full">
          {/* Left: Goals directory list */}
          <div className="overflow-y-auto p-4 space-y-3 h-full">
            {goals.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-12">Establish strategic goals with milestones.</p>
            ) : (
              goals.map((goal) => {
                const isSelected = selectedGoalId === goal.id;
                return (
                  <div
                    key={goal.id}
                    onClick={() => setSelectedGoalId(goal.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600/10 border-indigo-500/40 shadow-sm"
                        : "bg-gray-900/20 border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded-md uppercase border border-indigo-500/10">
                        {goal.category}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white truncate">{goal.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1.5 line-clamp-2">{goal.description}</p>

                    <div className="flex items-center justify-between mt-3.5 pt-2 border-t border-gray-900/40 text-[10px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Due:{" "}
                        {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteGoal(goal.id);
                          if (selectedGoalId === goal.id) setSelectedGoalId(null);
                        }}
                        className="text-gray-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: AI Plan details */}
          <div className="overflow-y-auto p-5 h-full bg-gray-950/40">
            {selectedGoal ? (
              <div className="space-y-5">
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide">{selectedGoal.title}</h4>
                  <p className="text-[11px] text-gray-400 mt-1">{selectedGoal.description}</p>
                </div>

                {/* AI Daily strategy */}
                {selectedGoal.dailyPlan && (
                  <div className="p-3.5 bg-gray-900/40 border border-gray-800/60 rounded-2xl space-y-1.5">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <BrainCircuit className="w-4 h-4 text-indigo-400" /> AI Daily Routine Plan
                    </span>
                    <p className="text-xs text-gray-300 leading-normal italic">
                      "{selectedGoal.dailyPlan}"
                    </p>
                  </div>
                )}

                {/* AI Weekly roadmap milestones */}
                {selectedGoal.weeklyPlan && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                      AI Weekly Milestones roadmap
                    </span>
                    <div className="p-4 bg-gray-950 border border-gray-900 rounded-2xl">
                      <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line font-mono">
                        {selectedGoal.weeklyPlan}
                      </p>
                    </div>
                  </div>
                )}

                {/* Subgoals checklists */}
                {selectedGoal.subGoals.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                      Core Subgoal Checkpoints
                    </span>
                    <div className="space-y-2">
                      {selectedGoal.subGoals.map((sub, idx) => (
                        <div key={idx} className="flex gap-2 text-xs text-gray-400 leading-normal p-2 rounded-xl bg-gray-900/20 border border-gray-900/50">
                          <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                          <p>{sub}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                <Compass className="w-10 h-10 text-gray-600 animate-pulse" />
                <p className="text-xs font-semibold text-gray-400">Select a goal roadmap</p>
                <p className="text-[10px] text-gray-500 max-w-[200px] leading-normal">
                  Unlock Gemini AI conversion to review exact daily plan integrations and weekly roadmaps.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Habit Modal Form */}
      {showHabitForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel rounded-3xl border border-gray-800 p-6 shadow-2xl">
            <h3 className="font-display font-semibold text-base text-white mb-4">Create New Habit</h3>
            <form onSubmit={handleAddHabit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-400 font-semibold block uppercase tracking-wider">Habit Title</label>
                <input
                  type="text"
                  required
                  placeholder="90 Minutes Deep Work"
                  value={habitTitle}
                  onChange={(e) => setHabitTitle(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-semibold block uppercase tracking-wider">Description</label>
                <textarea
                  placeholder="Describe details of the routine..."
                  value={habitDesc}
                  onChange={(e) => setHabitDesc(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-gray-200 focus:outline-none focus:border-indigo-500 h-16 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold block uppercase tracking-wider">Frequency</label>
                  <select
                    value={habitFreq}
                    onChange={(e: any) => setHabitFreq(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-gray-200 focus:outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold block uppercase tracking-wider">Category</label>
                  <select
                    value={habitCat}
                    onChange={(e) => setHabitCat(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-gray-200 focus:outline-none"
                  >
                    <option value="Work">Work</option>
                    <option value="Study">Study</option>
                    <option value="Health">Health</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowHabitForm(false)}
                  className="px-4 py-2 border border-gray-800 hover:bg-gray-900 rounded-xl text-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={habitLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl transition-all"
                >
                  Create Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Modal Form */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel rounded-3xl border border-gray-800 p-6 shadow-2xl">
            <h3 className="font-display font-semibold text-base text-white mb-4">Create Strategic Goal</h3>
            <form onSubmit={handleAddGoal} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-400 font-semibold block uppercase tracking-wider">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="Launch SaaS Product MVP"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-semibold block uppercase tracking-wider">Strategic Intent</label>
                <textarea
                  placeholder="Define long-term target objective..."
                  value={goalDesc}
                  onChange={(e) => setGoalDesc(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-gray-200 focus:outline-none focus:border-indigo-500 h-16 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-semibold block uppercase tracking-wider">Category</label>
                <select
                  value={goalCat}
                  onChange={(e) => setGoalCat(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-gray-200 focus:outline-none"
                >
                  <option value="Work">Work</option>
                  <option value="Study">Study</option>
                  <option value="Health">Health</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-semibold block uppercase tracking-wider">Milestone Subgoals (comma separated)</label>
                <input
                  type="text"
                  placeholder="Deploy backend API, Connect Atlas, Draft emails"
                  value={subGoalsInput}
                  onChange={(e) => setSubGoalsInput(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-semibold block uppercase tracking-wider">Target Deadline</label>
                <input
                  type="date"
                  required
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowGoalForm(false)}
                  className="px-4 py-2 border border-gray-800 hover:bg-gray-900 rounded-xl text-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={goalLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-1 transition-all"
                >
                  {goalLoading ? (
                    "Generating AI Strategy..."
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Initialize Goal
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
