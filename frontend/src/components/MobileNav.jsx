import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Users,
  ArrowLeftRight,
  BarChart3,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MobileNav({ currentRoute, setCurrentRoute }) {
  const { setIsAddExpenseOpen } = useApp();

  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'add', label: 'Add', icon: Plus, isAction: true },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'settlements', label: 'Settle', icon: ArrowLeftRight },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#080C15]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-3 py-2">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;

          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={() => setIsAddExpenseOpen(true)}
                className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white flex items-center justify-center shadow-glow-indigo active:scale-95 transition-transform"
                aria-label="Add Expense"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setCurrentRoute(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-cyan-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
