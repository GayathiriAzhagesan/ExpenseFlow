import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LoginPage({ onNavigateRegister, onLoginSuccess }) {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex items-center justify-center p-4 relative overflow-hidden text-slate-100">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-[#0B1120]/90 backdrop-blur-2xl shadow-glass p-8 sm:p-10"
      >
        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 p-[1px] shadow-glow-indigo mb-3">
            <div className="w-full h-full bg-[#080C15] rounded-[15px] flex items-center justify-center">
              <Zap className="w-6 h-6 text-cyan-400 fill-cyan-400/20" />
            </div>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Welcome back</h2>
          <p className="text-xs text-slate-400 mt-1">Log in to manage your ExpenseFlow balances</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Demo Fast Login Pills */}
        <div className="mb-6 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quick Demo Accounts:</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillQuickDemo('gayathiri@expenseflow.dev')}
              className="flex-1 py-1.5 px-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/30 text-[11px] font-medium transition-colors"
            >
              Gayathiri (Admin)
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('priya@expenseflow.dev')}
              className="flex-1 py-1.5 px-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-400/30 text-[11px] font-medium transition-colors"
            >
              Priya (Member)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="gayathiri@expenseflow.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white font-bold text-sm shadow-glow-indigo transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <button
            onClick={onNavigateRegister}
            className="text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Create one free
          </button>
        </div>
      </motion.div>
    </div>
  );
}
