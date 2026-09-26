import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Plus,
  Receipt,
  Users,
  ChevronRight,
  Calendar,
  CreditCard,
  QrCode,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatINR, formatDate, getCategoryMeta } from '../utils/formatters';
import FinancialOrb from '../three/FinancialOrb';
import EmptyState from '../components/EmptyState';
import ScanAndPayModal from '../components/ScanAndPayModal';

const PIE_COLORS = ['#6366F1', '#06B6D4', '#8B5CF6', '#10B981', '#F43F5E', '#F59E0B'];

export default function DashboardPage({ onNavigateRoute }) {
  const { currentUser, expenses, settlements, setIsAddExpenseOpen, setEditingExpense } = useApp();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Compute summary figures
  const { totalExpenses, youOwe, youAreOwed, settledTotal } = useMemo(() => {
    let total = 0;
    let owe = 0;
    let owed = 0;
    const currentId = currentUser?.id || 'u1';

    expenses.forEach((e) => {
      total += e.amount;
      if (e.paidBy?.id === currentId) {
        e.splits?.forEach((s) => {
          if (s.userId !== currentId && !s.paid) {
            owed += s.amount;
          }
        });
      } else {
        e.splits?.forEach((s) => {
          if (s.userId === currentId && !s.paid) {
            owe += s.amount;
          }
        });
      }
    });

    let settled = 0;
    settlements.forEach((s) => {
      if (s.status === 'settled') settled += s.amount;
    });

    return {
      totalExpenses: total,
      youOwe: owe,
      youAreOwed: owed,
      settledTotal: settled,
    };
  }, [expenses, settlements, currentUser]);

  // Chart data with dynamic unique data points
  const monthlyData = useMemo(() => {
    const monthNames = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
    const map = new Map();
    monthNames.forEach((m) => map.set(m, 0));

    expenses.forEach((e) => {
      if (!e.date) return;
      const d = new Date(e.date);
      const mName = d.toLocaleString('en-US', { month: 'short' });
      if (map.has(mName)) {
        map.set(mName, map.get(mName) + (Number(e.amount) || 0));
      }
    });

    const hasValues = Array.from(map.values()).some((v) => v > 0);
    if (!hasValues) {
      return [
        { month: 'Nov', amount: 3200 },
        { month: 'Dec', amount: 4800 },
        { month: 'Jan', amount: 4100 },
        { month: 'Feb', amount: 5200 },
        { month: 'Mar', amount: 5400 },
        { month: 'Apr', amount: 2300 },
      ];
    }
    return Array.from(map.entries()).map(([month, amount]) => ({ month, amount }));
  }, [expenses]);

  const categoryBreakdown = useMemo(() => {
    const counts = {};
    expenses.forEach((e) => {
      const cat = e.category || 'General';
      counts[cat] = (counts[cat] || 0) + (Number(e.amount) || 0);
    });
    if (Object.keys(counts).length === 0) {
      return [
        { name: 'Food & Dining', value: 2400 },
        { name: 'Entertainment', value: 1200 },
        { name: 'Transportation', value: 800 },
        { name: 'Shopping', value: 1000 },
      ];
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const recentExpenses = useMemo(() => {
    const map = new Map();
    for (const exp of expenses) {
      if (!exp) continue;
      const key = exp.id || exp._id;
      if (key && !map.has(key)) map.set(key, { ...exp, id: key });
    }
    return Array.from(map.values()).slice(0, 5);
  }, [expenses]);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Greeting & 3D Orb Area */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800/80 bg-gradient-to-r from-indigo-500/10 via-slate-900/40 to-cyan-500/10 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-400 text-xs font-semibold">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Smart Balance Overview</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {greeting}, {currentUser?.name || 'Gayathiri'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg">
              Here is what is happening with your group expenses and settlements today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsScanModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold text-sm shadow-sm transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan & Pay</span>
            </motion.button>

            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-sm shadow-glow-indigo hover:shadow-glow-cyan transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>+ Add Expense</span>
            </button>
          </div>
        </div>

        {/* 3D Orb Widget embedded subtly in the hero right */}
        <div className="hidden lg:block absolute -right-2 -top-6 pointer-events-none opacity-80">
          <FinancialOrb className="h-56 w-56" />
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm hover:border-indigo-500/40 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {formatINR(totalExpenses)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">+12%</span> vs last month
          </p>
        </motion.div>

        {/* You Owe */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm hover:border-rose-500/40 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              You Owe
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-500">
            {formatINR(youOwe)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {youOwe > 0 ? 'Pending repayment' : 'All debts settled'}
          </p>
        </motion.div>

        {/* You Are Owed */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm hover:border-cyan-500/40 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              You Are Owed
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-cyan-400">
            {formatINR(youAreOwed)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {youAreOwed > 0 ? 'Pending collection' : 'No pending balances'}
          </p>
        </motion.div>

        {/* Settled */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm hover:border-emerald-500/40 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Settled
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            {formatINR(settledTotal)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Completed transactions
          </p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Expense Area Chart */}
        <div className="lg:col-span-8 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Monthly Expense Trend
              </h3>
              <p className="text-xs text-slate-400">Total expenditure trajectory across groups</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
              Last 6 Months
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs shadow-glass text-white">
                          <p className="font-semibold">{payload[0].payload.month}</p>
                          <p className="text-cyan-400 font-bold">{formatINR(payload[0].value)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#expenseGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="lg:col-span-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Category Breakdown
            </h3>
            <p className="text-xs text-slate-400">Distribution by spend category</p>
          </div>

          <div className="h-48 w-full my-3 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatINR(value), 'Amount']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {categoryBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <span className="text-slate-400 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Expenses List */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Recent Expenses</h3>
            <p className="text-xs text-slate-400">Latest shared expenditures and receipts</p>
          </div>
          <button
            onClick={() => onNavigateRoute('expenses')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View all</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentExpenses.length === 0 ? (
          <EmptyState
            type="expenses"
            onAction={() => setIsAddExpenseOpen(true)}
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentExpenses.map((expense) => {
              const meta = getCategoryMeta(expense.category);
              return (
                <div
                  key={expense.id}
                  onClick={() => setEditingExpense(expense)}
                  className="py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-3 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base border shrink-0 ${meta.bg}`}
                    >
                      {expense.category.includes('Food')
                        ? '🍕'
                        : expense.category.includes('Entertainment')
                        ? '🎬'
                        : expense.category.includes('Transport')
                        ? '🚌'
                        : expense.category.includes('Groceries')
                        ? '🛒'
                        : '☕'}
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                        {expense.description}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>Paid by {expense.paidBy?.name}</span>
                        <span>•</span>
                        <span>{expense.participants?.length || 4} participants</span>
                        <span>•</span>
                        <span>{formatDate(expense.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-base text-slate-900 dark:text-white">
                      {formatINR(expense.amount)}
                    </span>
                    <span className="block text-[11px] font-medium text-emerald-400 capitalize">
                      {expense.status || 'Active'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Scanner & UPI Payment Modal */}
      <ScanAndPayModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
      />
    </div>
  );
}
