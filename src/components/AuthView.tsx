import React, { useState } from "react";
import { useApp } from "../context/AppContext.tsx";
import { Clock, ShieldAlert, Sparkles, Loader2 } from "lucide-react";

export const AuthView: React.FC = () => {
  const { login, signup } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("guest@guardian.ai");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAuthLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name) {
          setError("Name is required for registration.");
          setAuthLoading(false);
          return;
        }
        await signup(email, password, name);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Authentication failed. Please check credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden px-4">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-900/10 rounded-full blur-3xl pulse-glow"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-4">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white tracking-wide">
            Deadline Guardian AI
          </h2>
          <p className="text-gray-400 text-sm mt-1.5">
            "The AI Productivity Companion That Helps You Finish Tasks Before It's Too Late."
          </p>
        </div>

        {/* Auth Panel */}
        <div className="glass-panel rounded-3xl border border-gray-800 shadow-2xl p-8">
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-900">
            <button
              onClick={() => {
                setIsLogin(true);
                setError(null);
              }}
              className={`text-sm font-semibold tracking-wide pb-1 transition-all border-b-2 ${
                isLogin ? "border-indigo-500 text-white" : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError(null);
              }}
              className={`text-sm font-semibold tracking-wide pb-1 transition-all border-b-2 ${
                !isLogin ? "border-indigo-500 text-white" : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Register Account
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/20 border border-rose-900/30 text-xs text-rose-400 flex items-start gap-2.5">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Carter"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-55 text-white text-sm font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all duration-150 flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>{isLogin ? "Access Dashboard" : "Register and Onboard"}</>
              )}
            </button>
          </form>

          {isLogin && (
            <div className="mt-5 p-3 rounded-xl bg-gray-950/60 border border-gray-900/60 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5" />
              <div className="text-[11px] text-gray-400">
                <span className="font-semibold text-white">Guest mode enabled:</span> Press button above to explore the fully functional dashboard loaded with sample hackathon demo tasks instantly!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
