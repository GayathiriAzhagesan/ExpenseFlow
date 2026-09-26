import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Users,
  ArrowLeftRight,
  BarChart3,
  User,
  Settings,
  LogOut,
  Plus,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar({ currentRoute, setCurrentRoute }) {
  const { logout, setIsAddExpenseOpen, setIsCreateGroupOpen } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'settlements', label: 'Settlements', icon: ArrowLeftRight },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-[#080C15]/95 backdrop-blur-2xl p-4 transition-colors z-40">
      {/* Brand Logo */}
      <div
        onClick={() => setCurrentRoute('dashboard')}
        className="flex items-center gap-3 px-3 py-3 cursor-pointer group mb-4"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 p-[1px] shadow-glow-indigo">
          <div className="w-full h-full bg-[#080C15] rounded-[11px] flex items-center justify-center">
            <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20 group-hover:scale-110 transition-transform" />
          </div>
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            ExpenseFlow
          </span>
          <span className="block text-[10px] tracking-wider text-slate-400 font-semibold uppercase -mt-0.5">
            Fintech Engine
          </span>
        </div>
      </div>

      {/* Quick Action Button */}
      <button
        onClick={() => setIsAddExpenseOpen(true)}
        className="w-full mb-6 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 text-white font-semibold text-sm shadow-glow-indigo hover:shadow-glow-cyan transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        <span>Add Expense</span>
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentRoute(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500/15 to-cyan-500/10 text-indigo-500 dark:text-cyan-400 border border-indigo-500/30 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-500 dark:text-cyan-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-glow-cyan" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Logout */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80">
        <button
          onClick={() => {
            logout();
            setCurrentRoute('login');
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
