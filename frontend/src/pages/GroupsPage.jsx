import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/formatters';
import EmptyState from '../components/EmptyState';

const EMPTY_ARRAY = [];

export default function GroupsPage({ onSelectGroup, groups: propGroups }) {
  const {
    groups: contextGroups = EMPTY_ARRAY,
    expenses = EMPTY_ARRAY,
    setIsCreateGroupOpen,
    setActiveGroupForExpense,
    setIsAddExpenseOpen,
  } = useApp();

  // 1. Ensure groups is always declared
  const groupsData = propGroups !== undefined ? propGroups : contextGroups;
  const groups = groupsData || EMPTY_ARRAY;

  // 2. Defensive check before rendering or iterating
  const safeGroups = Array.isArray(groups) ? groups : EMPTY_ARRAY;

  // Calculate real total expenses per group from database expenses
  const groupTotalsMap = React.useMemo(() => {
    const map = new Map();
    if (!Array.isArray(expenses)) return map;
    for (const exp of expenses) {
      if (!exp) continue;
      // Actual group ID stored on the expense document
      const gId = exp.groupId || exp.group_id || (typeof exp.group === 'object' ? exp.group?.id : exp.group);
      if (gId) {
        const amt = Number(exp.amount) || 0;
        map.set(gId, (map.get(gId) || 0) + amt);
      }
    }
    return map;
  }, [expenses]);

  const uniqueGroups = React.useMemo(() => {
    if (!Array.isArray(safeGroups)) return EMPTY_ARRAY;
    const map = new Map();
    for (const g of safeGroups) {
      if (!g) continue;
      const key = g.id || g._id;
      if (key && !map.has(key)) map.set(key, { ...g, id: key });
    }
    return Array.from(map.values());
  }, [safeGroups]);

  // Safe groups for rendering
  const safeRenderGroups = Array.isArray(uniqueGroups) ? uniqueGroups : EMPTY_ARRAY;
  const groupsCount = safeRenderGroups.length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Expense Groups
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Collaborate on shared trips, flat expenses, and circle outings
          </p>
        </div>

        <button
          onClick={() => setIsCreateGroupOpen?.(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-semibold text-xs sm:text-sm shadow-glow-indigo transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create Group</span>
        </button>
      </div>

      {/* Groups Grid */}
      {groupsCount === 0 ? (
        <EmptyState
          type="groups"
          title="No groups yet"
          onAction={setIsCreateGroupOpen ? () => setIsCreateGroupOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeRenderGroups.map((group) => {
            if (!group) return null;
            const members = Array.isArray(group.members) ? group.members : [];
            const calculatedTotal = groupTotalsMap.get(group.id) ?? groupTotalsMap.get(group._id);
            const totalAmount = calculatedTotal !== undefined ? calculatedTotal : (Number(group.totalExpenses) || 0);

            return (
              <motion.div
                key={group.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-sm flex flex-col justify-between group"
              >
                {/* Cover Banner */}
                <div className="relative h-32 w-full overflow-hidden">
                  <img
                    src={
                      group.avatar ||
                      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={group.name || 'Group'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <span className="absolute bottom-3 left-4 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-[10px] font-bold text-cyan-400">
                    {members.length > 0 ? members.length : (group.membersCount || 1)} members
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors">
                      {group.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {group.description || 'Shared activities and trip expenses'}
                    </p>
                  </div>

                  {/* Total expenses & Member avatars */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                        Total Expenses
                      </span>
                      <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {formatINR(totalAmount)}
                      </span>
                    </div>

                      <div className="flex -space-x-2">
                        {Array.isArray(members) &&
                          members.slice(0, 4).map((m, i) => (
                            <img
                              key={i}
                              src={m?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                              alt={m?.name || 'Member'}
                              title={m?.name || 'Member'}
                              className="w-7 h-7 rounded-full ring-2 ring-slate-900 object-cover bg-slate-800"
                            />
                          ))}
                        {members.length > 4 && (
                          <div className="w-7 h-7 rounded-full ring-2 ring-slate-900 bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                            +{members.length - 4}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 flex items-center gap-2">
                      <button
                        onClick={() => onSelectGroup?.(group.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>View Group</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveGroupForExpense?.(group.id);
                          setIsAddExpenseOpen?.(true);
                        }}
                        title="Add Expense to Group"
                        className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      )}
    </div>
  );
}
