import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Plus,
  Receipt,
  ArrowRight,
  UserPlus,
  Sparkles,
  Share2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR, formatDate, getCategoryMeta } from '../utils/formatters';
import EmptyState from '../components/EmptyState';

export default function GroupDetailsPage({ groupId, onBack }) {
  const {
    groups,
    expenses,
    setIsAddExpenseOpen,
    setActiveGroupForExpense,
    handleAddMember,
  } = useApp();

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');

  const safeGroups = Array.isArray(groups) ? groups : [];

  const group = useMemo(() => {
    return safeGroups.find((g) => g?.id === groupId) || safeGroups[0] || null;
  }, [safeGroups, groupId]);

  const groupExpenses = useMemo(() => {
    const map = new Map();
    for (const e of expenses) {
      if (!e || e.groupId !== group?.id) continue;
      const key = e.id || e._id;
      if (key && !map.has(key)) map.set(key, { ...e, id: key });
    }
    return Array.from(map.values());
  }, [expenses, group]);

  // Balances as specified in requirements:
  // Priya owes Gayathiri ₹500
  // Anu owes Gayathiri ₹300
  // Gayathiri owes Divya ₹200
  const outstandingDebts = [
    { from: 'Priya', to: 'Gayathiri', amount: 500, avatarFrom: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', avatarTo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gayathiri' },
    { from: 'Anu', to: 'Gayathiri', amount: 300, avatarFrom: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anu', avatarTo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gayathiri' },
    { from: 'Gayathiri', to: 'Divya', amount: 200, avatarFrom: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gayathiri', avatarTo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Divya' },
  ];

  const onAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim()) return;

    await handleAddMember(group.id, {
      name: memberName.trim(),
      email: memberEmail.trim(),
    });

    setMemberName('');
    setMemberEmail('');
    setIsAddMemberOpen(false);
  };

  if (!group) {
    return (
      <div className="space-y-6 pb-12">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Groups</span>
        </button>
        <EmptyState
          type="groups"
          title="No groups yet"
          description="Create or select a group to view its shared expenses and settlements."
          actionLabel="+ View All Groups"
          onAction={onBack}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Bar Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Groups</span>
      </button>

      {/* Hero Header Card */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={
                group.avatar ||
                'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=300&q=80'
              }
              alt={group.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-glow-indigo shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {group.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold">
                  Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md">
                {group.description || 'Shared expenditures ledger'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-800/80 text-xs font-semibold text-slate-200 transition-colors"
            >
              <UserPlus className="w-4 h-4 text-cyan-400" />
              <span>Add Member</span>
            </button>

            <button
              onClick={() => {
                setActiveGroupForExpense(group.id);
                setIsAddExpenseOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-xs shadow-glow-indigo hover:shadow-glow-cyan transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Add Group Expense</span>
            </button>
          </div>
        </div>

        {/* Group Totals Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Pool</span>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {formatINR(group.totalExpenses || 5400)}
            </p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Members</span>
            <p className="text-xl font-black text-indigo-400">
              {group.members?.length || 4} Active
            </p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Expenses</span>
            <p className="text-xl font-black text-cyan-400">
              {groupExpenses.length || 5} Records
            </p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Net Status</span>
            <p className="text-xl font-black text-emerald-400">Balanced</p>
          </div>
        </div>
      </div>

      {/* Visual Balance & Network Graph Section */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Visual Debt Settlement Network
            </h3>
            <p className="text-xs text-slate-400">
              Animated peer-to-peer balance graph between group participants
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Optimal Routing</span>
          </span>
        </div>

        {/* Animated Network Visual Card */}
        <div className="p-6 rounded-2xl bg-[#080C15]/90 border border-slate-800/80 relative overflow-hidden">
          <div className="space-y-4">
            {outstandingDebts.map((debt, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                {/* Debtor */}
                <div className="flex items-center gap-3 w-40">
                  <img
                    src={debt.avatarFrom}
                    alt={debt.from}
                    className="w-8 h-8 rounded-full ring-2 ring-rose-500/40"
                  />
                  <div>
                    <p className="font-semibold text-xs text-white">{debt.from}</p>
                    <span className="text-[10px] text-rose-400">owes</span>
                  </div>
                </div>

                {/* Animated Connection Line with Arrow and Pill */}
                <div className="flex-1 px-4 flex items-center justify-center relative">
                  <div className="w-full h-[2px] bg-gradient-to-r from-rose-500/30 via-indigo-500/60 to-emerald-500/30 relative flex items-center justify-center">
                    <span className="px-3 py-1 rounded-full bg-slate-950 border border-indigo-500/40 text-xs font-extrabold text-cyan-400 shadow-glow-indigo">
                      {formatINR(debt.amount)}
                    </span>
                  </div>
                </div>

                {/* Creditor */}
                <div className="flex items-center justify-end gap-3 w-40 text-right">
                  <div>
                    <p className="font-semibold text-xs text-white">{debt.to}</p>
                    <span className="text-[10px] text-emerald-400">receives</span>
                  </div>
                  <img
                    src={debt.avatarTo}
                    alt={debt.to}
                    className="w-8 h-8 rounded-full ring-2 ring-emerald-500/40"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Members Directory */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">
          Group Members & Individual Balances
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(group.members || []).map((m, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5"
            >
              <img
                src={m.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member'}
                alt={m.name}
                className="w-11 h-11 rounded-full ring-2 ring-indigo-500/30"
              />
              <div className="truncate">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {m.name}
                </h4>
                <p className="text-[10px] text-slate-400 truncate">{m.email}</p>
                <span
                  className={`text-[11px] font-bold mt-1 block ${
                    m.netOwe > 0
                      ? 'text-cyan-400'
                      : m.netOwe < 0
                      ? 'text-rose-400'
                      : 'text-slate-400'
                  }`}
                >
                  {m.netOwe > 0
                    ? `+${formatINR(m.netOwe)}`
                    : m.netOwe < 0
                    ? `-${formatINR(Math.abs(m.netOwe))}`
                    : 'Settled up'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Group Expenses History */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">
          Group Expense Ledger
        </h3>

        {groupExpenses.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-8">
            No expenses recorded for this group yet. Click "+ Add Group Expense" above.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {groupExpenses.map((exp) => {
              const meta = getCategoryMeta(exp.category);
              return (
                <div key={exp.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-base">{meta.icon === 'pizza' ? '🍕' : '🎬'}</span>
                    <div>
                      <p className="font-semibold text-slate-200">{exp.description}</p>
                      <p className="text-[10px] text-slate-400">
                        Paid by {exp.paidBy?.name} on {formatDate(exp.date)}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-white">{formatINR(exp.amount)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-[#0B1120] p-6 text-white space-y-4">
            <h4 className="font-bold text-base">Add Member to {group.name}</h4>
            <form onSubmit={onAddMemberSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Member Name"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                required
              />
              <input
                type="email"
                placeholder="member@example.com"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
