import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  PieChart,
  Split,
  Sparkles,
  CheckCircle2,
  Users2,
  Lock,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import FloatingCard from '../three/FloatingCard';
import FinancialOrb from '../three/FinancialOrb';

export default function LandingPage({ onGetStarted, onExploreDashboard }) {
  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-400 overflow-hidden">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-slate-800/60 bg-[#070B14]/80 backdrop-blur-xl px-6 lg:px-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 p-[1px] shadow-glow-indigo">
            <div className="w-full h-full bg-[#080C15] rounded-[11px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-300 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            ExpenseFlow
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">
            How It Works
          </a>
          <a href="#features" className="hover:text-cyan-400 transition-colors">
            Features
          </a>
          <a href="#security" className="hover:text-cyan-400 transition-colors">
            Security
          </a>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onExploreDashboard}
            className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 transition-colors"
          >
            Explore Dashboard
          </button>
          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-400 text-white font-semibold text-sm shadow-glow-indigo hover:shadow-glow-cyan transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-6 lg:px-16 max-w-7xl mx-auto">
        {/* Glow ambient backdrops */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-[130px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Payments & Expense Sharing</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15]">
              Split expenses.{' '}
              <span className="block bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Simplify life.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
              ExpenseFlow makes shared spending, group expenses, and settlements simple,
              transparent, and effortless. Calculate equal, custom, or percentage splits with live
              real-time synchronization.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onGetStarted}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-bold text-sm shadow-glow-indigo hover:shadow-glow-cyan transition-all transform hover:scale-[1.03] active:scale-[0.98]"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreDashboard}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-900/60 backdrop-blur-xl text-slate-200 font-semibold text-sm transition-all"
              >
                <span>Live Interactive Demo</span>
                <ChevronRight className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

            {/* Micro stats banner */}
            <div className="pt-6 grid grid-cols-3 gap-6 border-t border-slate-800/80">
              <div>
                <p className="text-2xl font-black text-white">₹0</p>
                <p className="text-xs text-slate-400">Hidden Math or Fees</p>
              </div>
              <div>
                <p className="text-2xl font-black text-cyan-400">Instant</p>
                <p className="text-xs text-slate-400">Real-time Settlement</p>
              </div>
              <div>
                <p className="text-2xl font-black text-indigo-400">100%</p>
                <p className="text-xs text-slate-400">Audit Transparency</p>
              </div>
            </div>
          </motion.div>

          {/* 3D Visual & Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {/* 3D Floating Financial Card */}
            <div className="relative w-full rounded-3xl p-2 bg-gradient-to-b from-indigo-500/20 to-transparent border border-indigo-500/30 shadow-glass">
              <FloatingCard className="h-64 sm:h-72 w-full" />

              {/* Floating transaction preview cards */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-6 -left-4 sm:-left-8 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-2xl shadow-glass flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-slate-200">Priya settled ₹500</p>
                  <p className="text-[10px] text-slate-400">College Friends Group</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -right-4 sm:-right-6 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-2xl shadow-glass flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold">
                  🍕
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-slate-200">Dinner at Bistro</p>
                  <p className="text-cyan-400 font-bold">₹2,000 (Split 4 ways)</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 lg:px-16 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Effortless Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            How ExpenseFlow Works
          </h2>
          <p className="text-sm text-slate-400">
            Three simple steps to keep every group dinner, flat expense, and vacation trip sorted.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-lg mb-6 group-hover:scale-110 transition-transform">
              1
            </div>
            <h3 className="text-lg font-bold text-white mb-2">1. Add an expense</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Enter description, amount in ₹ INR, and tag who paid. Choose Equal, Custom, or
              Percentage splitting.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-cyan-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-black text-lg mb-6 group-hover:scale-110 transition-transform">
              2
            </div>
            <h3 className="text-lg font-bold text-white mb-2">2. Split with your group</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              ExpenseFlow calculates exact individual shares immediately with zero rounding friction
              and net balance tracking.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-purple-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-black text-lg mb-6 group-hover:scale-110 transition-transform">
              3
            </div>
            <h3 className="text-lg font-bold text-white mb-2">3. Settle instantly</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Hit "Settle" to clear balances via UPI or cash with live real-time sync across all
              devices.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 lg:px-16 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Engineered For Precision
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Enterprise-Grade Features
          </h2>
          <p className="text-sm text-slate-400">
            A comprehensive fintech architecture built for students, travelers, flatmates, and
            teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Split,
              title: 'Smart Splitting',
              desc: 'Equal, custom rupee values, or percentage distributions with backend verification.',
            },
            {
              icon: Users2,
              title: 'Group Expenses',
              desc: 'Dedicated groups for Goa Trips, Flat Rent, and College Outings with shared ledger history.',
            },
            {
              icon: Zap,
              title: 'Real-Time Balances',
              desc: 'WebSocket powered live updates keep everyone synchronized across browsers without refreshing.',
            },
            {
              icon: PieChart,
              title: 'Expense Analytics',
              desc: 'Interactive monthly spending graphs, category breakdowns, and settlement velocity metrics.',
            },
            {
              icon: CheckCircle2,
              title: 'Easy Settlements',
              desc: 'One-click debt resolution with UPI/Cash badges, audit logs, and celebratory animations.',
            },
            {
              icon: Lock,
              title: 'Secure Accounts',
              desc: 'JWT authentication, bcrypt hashed credentials, and strictly scoped authorization.',
            },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-cyan-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-white">{f.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 px-6 lg:px-16 max-w-5xl mx-auto">
        <div className="relative rounded-3xl p-10 sm:p-14 bg-gradient-to-r from-indigo-900/60 via-slate-900/80 to-cyan-900/60 border border-indigo-500/30 text-center space-y-6 shadow-glass overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Take control of shared expenses.
          </h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto">
            Join thousands of roommates, friends, and travel groups splitting smarter with
            ExpenseFlow.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-bold text-sm shadow-glow-indigo hover:shadow-glow-cyan transition-all transform hover:scale-[1.03]"
          >
            Launch ExpenseFlow Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-12 px-6 lg:px-16 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <p className="font-bold text-slate-200">ExpenseFlow</p>
              <p className="text-[11px] text-slate-500">Payments made simple.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <span className="hover:text-white cursor-pointer">Product</span>
            <span className="hover:text-white cursor-pointer">Features</span>
            <span className="hover:text-white cursor-pointer">Analytics</span>
            <span className="hover:text-white cursor-pointer">Security</span>
            <span className="hover:text-white cursor-pointer">About</span>
            <span className="hover:text-white cursor-pointer">Privacy</span>
            <span className="hover:text-white cursor-pointer">Terms</span>
          </div>

          <p className="text-slate-500 text-[11px]">© 2026 ExpenseFlow Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
