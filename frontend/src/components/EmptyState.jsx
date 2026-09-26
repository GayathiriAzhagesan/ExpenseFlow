import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, Users, ArrowLeftRight, Bell, Search, Plus } from 'lucide-react';

export default function EmptyState({
  type = 'expenses',
  title,
  description,
  actionLabel,
  onAction,
}) {
  const getIcon = () => {
    switch (type) {
      case 'groups':
        return <Users className="w-8 h-8 text-indigo-400" />;
      case 'settlements':
        return <ArrowLeftRight className="w-8 h-8 text-cyan-400" />;
      case 'notifications':
        return <Bell className="w-8 h-8 text-amber-400" />;
      case 'search':
        return <Search className="w-8 h-8 text-purple-400" />;
      default:
        return <Receipt className="w-8 h-8 text-indigo-400" />;
    }
  };

  const defaults = {
    expenses: {
      title: 'No expenses yet',
      desc: 'Start tracking your shared spending by adding your first expense.',
      action: '+ Add Expense',
    },
    groups: {
      title: 'No groups created',
      desc: 'Create a group for your trip, housemates, or outings to easily split balances.',
      action: '+ Create Group',
    },
    settlements: {
      title: 'All squared up!',
      desc: 'No outstanding balances or pending settlements at the moment.',
      action: null,
    },
    notifications: {
      title: 'No notifications',
      desc: "You're all caught up! Updates and payment alerts will show up here.",
      action: null,
    },
    search: {
      title: 'No results found',
      desc: 'Try refining your search keyword or clearing the applied filters.',
      action: null,
    },
  };

  const defaultMeta = defaults[type] || defaults.expenses;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 backdrop-blur-sm my-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center mb-4 shadow-sm">
        {getIcon()}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
        {title || defaultMeta.title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description || defaultMeta.desc}
      </p>

      {(actionLabel || defaultMeta.action) && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-medium text-sm shadow-glow-indigo transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          {actionLabel || defaultMeta.action}
        </button>
      )}
    </motion.div>
  );
}
