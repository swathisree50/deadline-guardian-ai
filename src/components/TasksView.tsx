import React, { useState } from "react";
import { useApp } from "../context/AppContext.tsx";
import { Task, Subtask } from "../types.ts";
import {
  Plus,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  BrainCircuit,
  Clock,
  Calendar,
  Layers,
  ArrowUpRight,
  ChevronRight,
  FolderMinus,
  Tag,
  Trash2,
  Check,
  Play
} from "lucide-react";

export const TasksView: React.FC = () => {
  const { tasks, createTask, updateTask, deleteTask, triggerTaskBreakdown } = useApp();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Detailed task creation form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [category, setCategory] = useState<"Work" | "Study" | "Health" | "Personal" | "Finance">("Work");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [estimatedTime, setEstimatedTime] = useState("60");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  // Process filters
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    const matchesCategory = categoryFilter === "all" || task.category === categoryFilter;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadline) return;
    setAddLoading(true);
    try {
      const parsedTags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const created = await createTask({
        title,
        description,
        priority,
        category,
        difficulty,
        estimatedTime: Number(estimatedTime) || 30,
        deadline: new Date(deadline).toISOString(),
        notes,
        tags: parsedTags,
        subtasks: [],
      });

      // Reset
      setTitle("");
      setDescription("");
      setNotes("");
      setTagsInput("");
      setShowAddForm(false);
      setSelectedTaskId(created.id); // auto open details
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setAddLoading(false);
    }
  };

  // Toggle subtask checklist item
  const handleToggleSubtask = async (subtaskId: string) => {
    if (!selectedTask) return;
    const updatedSubtasks = selectedTask.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    await updateTask(selectedTask.id, { subtasks: updatedSubtasks });
  };

  // AI generate task subtasks
  const [aiBreakdownLoading, setAiBreakdownLoading] = useState(false);
  const handleTriggerAIBreakdown = async () => {
    if (!selectedTask) return;
    setAiBreakdownLoading(true);
    try {
      await triggerTaskBreakdown(selectedTask.id);
    } catch (err) {
      console.error("AI breakdown failed:", err);
    } finally {
      setAiBreakdownLoading(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    if (diff === "hard") return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    if (diff === "medium") return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  };

  const getPriorityColor = (prio: string) => {
    if (prio === "high") return "text-rose-400 bg-rose-500/5";
    if (prio === "medium") return "text-amber-400 bg-amber-500/5";
    return "text-gray-400 bg-gray-500/5";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-140px)] items-stretch">
      {/* Task Filters & Lists */}
      <div className="lg:col-span-3 flex flex-col h-full bg-gray-950/20 rounded-3xl border border-gray-900 overflow-hidden">
        {/* Search & Action bar */}
        <div className="p-5 border-b border-gray-900 bg-gray-900/10 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks, descriptions, tags..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 pl-9 pr-4 text-xs text-gray-300 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/10"
            >
              <Plus className="w-3.5 h-3.5" /> New Task
            </button>
          </div>

          {/* Inline filters */}
          <div className="grid grid-cols-3 gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-gray-400 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-gray-400 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-gray-400 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Work">Work</option>
              <option value="Study">Study</option>
              <option value="Health">Health</option>
              <option value="Personal">Personal</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
        </div>

        {/* Task lists scrollable container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center">
              <FolderMinus className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-400">No matching tasks found</p>
              <p className="text-xs text-gray-500 mt-1">Try relaxing filters or add your first task!</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isSelected = selectedTaskId === task.id;
              const subtasksDone = task.subtasks.filter((s) => s.completed).length;

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 group ${
                    isSelected
                      ? "bg-indigo-600/10 border-indigo-500/40"
                      : "bg-gray-900/20 border-gray-800/80 hover:bg-gray-900/40 hover:border-gray-700/80"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${getDifficultyColor(task.difficulty)}`}>
                        {task.difficulty}
                      </span>
                      <span className="text-[10px] text-indigo-400 font-semibold">
                        {task.category}
                      </span>
                    </div>

                    <h4 className={`text-sm font-semibold truncate ${task.status === "completed" ? "line-through text-gray-500" : "text-white"}`}>
                      {task.title}
                    </h4>

                    <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-500" /> {task.estimatedTime}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" /> Due:{" "}
                        {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      {task.subtasks.length > 0 && (
                        <span className="text-indigo-400 font-semibold bg-indigo-500/5 px-1.5 py-0.2 rounded-md">
                          {subtasksDone}/{task.subtasks.length} Checkpoints
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${isSelected ? "translate-x-1" : ""}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Task Details Right Panel */}
      <div className="lg:col-span-2 glass-panel rounded-3xl border border-gray-800 overflow-hidden flex flex-col h-full">
        {selectedTask ? (
          <div className="flex flex-col h-full divide-y divide-gray-900">
            {/* Header */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/15 px-2.5 py-1 rounded-lg">
                  AI Weight: {selectedTask.priorityScore}
                </span>

                <div className="flex items-center gap-2">
                  {selectedTask.status !== "completed" && (
                    <button
                      onClick={() => updateTask(selectedTask.id, { status: "completed" })}
                      className="px-2.5 py-1.5 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-600/20 text-emerald-400 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Check className="w-3 h-3" /> Finish
                    </button>
                  )}
                  {selectedTask.status === "todo" && (
                    <button
                      onClick={() => updateTask(selectedTask.id, { status: "in_progress" })}
                      className="px-2.5 py-1.5 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-600/20 text-indigo-400 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Play className="w-3 h-3" /> Focus
                    </button>
                  )}
                  <button
                    onClick={() => {
                      deleteTask(selectedTask.id);
                      setSelectedTaskId(null);
                    }}
                    className="p-1.5 hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 border border-transparent hover:border-rose-500/20 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-wide">{selectedTask.title}</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{selectedTask.description}</p>
              </div>

              {/* Badges metrics grids */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-gray-900/40 border border-gray-800/50 p-2.5 rounded-xl text-xs">
                  <span className="text-gray-500 block">AI Risk Score</span>
                  <span className="font-semibold text-gray-200 block mt-0.5">{selectedTask.riskScore}/100</span>
                </div>
                <div className="bg-gray-900/40 border border-gray-800/50 p-2.5 rounded-xl text-xs">
                  <span className="text-gray-500 block">Miss Probability</span>
                  <span className="font-semibold text-rose-400 block mt-0.5">{selectedTask.deadlineProbability}%</span>
                </div>
              </div>
            </div>

            {/* AI Action and Subtasks Checklist */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" /> Milestone Checkpoints
                </h4>
                {selectedTask.subtasks.length === 0 && (
                  <button
                    onClick={handleTriggerAIBreakdown}
                    disabled={aiBreakdownLoading}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 uppercase tracking-wide disabled:opacity-50"
                  >
                    <BrainCircuit className="w-3.5 h-3.5 animate-pulse" /> Auto-Breakdown (AI)
                  </button>
                )}
              </div>

              {aiBreakdownLoading && (
                <div className="py-6 text-center text-xs text-gray-400 space-y-2">
                  <Clock className="w-6 h-6 animate-spin text-indigo-400 mx-auto" />
                  <p>Gemini is orchestrating detailed execution checkpoints...</p>
                </div>
              )}

              {selectedTask.subtasks.length > 0 && (
                <div className="space-y-2">
                  {selectedTask.subtasks.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => handleToggleSubtask(st.id)}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-950/40 border border-gray-900 hover:border-gray-800/60 transition-all cursor-pointer group"
                    >
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                          st.completed
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-gray-700 group-hover:border-gray-500"
                        }`}
                      >
                        {st.completed && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span className={`text-xs ${st.completed ? "line-through text-gray-500" : "text-gray-300 font-medium"}`}>
                        {st.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes block */}
              {selectedTask.notes && (
                <div className="space-y-1.5 pt-3 border-t border-gray-900">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Notes & Guidelines</h4>
                  <div className="p-3 bg-gray-950/60 border border-gray-900 rounded-xl">
                    <p className="text-xs text-gray-400 leading-normal font-mono">{selectedTask.notes}</p>
                  </div>
                </div>
              )}

              {/* Tags panel */}
              {selectedTask.tags.length > 0 && (
                <div className="space-y-1.5 pt-3 border-t border-gray-900">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-400" /> Active Tags
                  </h4>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedTask.tags.map((tag) => (
                      <span key={tag} className="text-[10px] text-gray-400 bg-gray-900 border border-gray-800 px-2.5 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="m-auto text-center p-6 space-y-3">
            <Layers className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-sm font-semibold text-gray-400">Select a task to review details</p>
            <p className="text-xs text-gray-500 max-w-[250px] mx-auto">
              Inspect AI prediction margins, recommended start timings, and launch auto-breakdown milestones.
            </p>
          </div>
        )}
      </div>

      {/* detailed add form modal backdrop overlay */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel rounded-3xl border border-gray-800 p-6 shadow-2xl">
            <h3 className="font-display font-semibold text-lg text-white mb-4">Create New Task</h3>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-400 font-semibold block uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Finalise Hackathon Pitch Deck"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-semibold block uppercase tracking-wider">Description</label>
                <textarea
                  placeholder="Details and objectives of this task..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-gray-200 focus:outline-none focus:border-indigo-500 h-16 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold block uppercase tracking-wider">Priority</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-gray-200 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold block uppercase tracking-wider">Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-gray-200 focus:outline-none"
                  >
                    <option value="Work">Work</option>
                    <option value="Study">Study</option>
                    <option value="Health">Health</option>
                    <option value="Personal">Personal</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold block uppercase tracking-wider">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e: any) => setDifficulty(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-gray-200 focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold block uppercase tracking-wider">Est. Duration (mins)</label>
                  <input
                    type="number"
                    required
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold block uppercase tracking-wider">Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold block uppercase tracking-wider">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="hackathon, deck, demo"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-semibold block uppercase tracking-wider">Guidelines & Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Review slide 5 styling carefully before saving draft"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3.5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-800 hover:bg-gray-900 rounded-xl text-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-1 shadow-lg shadow-indigo-600/15"
                >
                  {addLoading ? (
                    "Analyzing Parameters..."
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Deploy Task
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
