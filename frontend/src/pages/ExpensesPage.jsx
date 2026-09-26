import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Eye,
  SlidersHorizontal,
  Calendar,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR, formatDate, getCategoryMeta } from '../utils/formatters';
import EmptyState from '../components/EmptyState';

const CATEGORIES = [
  'All',
  'Food & Dining',
  'Entertainment',
  'Transportation',
  'Groceries',
  'Bills & Utilities',
  'Shopping',
  'General',
];

export default function ExpensesPage() {
  const {
    expenses,
    setIsAddExpenseOpen,
    setEditingExpense,
    handleDeleteExpense,
    selectedCategory,
    setSelectedCategory,
    selectedSplitType,
    setSelectedSplitType,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, amount-desc, amount-asc
  const [viewingExpense, setViewingExpense] = useState(null);

  // Filtered & Sorted expenses with strict deduplication
  const filteredExpenses = useMemo(() => {
    const map = new Map();
    for (const exp of expenses) {
      if (!exp) continue;
      const key = exp.id || exp._id;
      if (key && !map.has(key)) {
        map.set(key, { ...exp, id: key });
      }
    }
    let result = Array.from(map.values());

    // Category
    if (selectedCategory && selectedCategory !== 'all' && selectedCategory !== 'All') {
      result = result.filter(
        (e) => e.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Split Type
    if (selectedSplitType && selectedSplitType !== 'all') {
      result = result.filter(
        (e) => e.splitType?.toLowerCase() === selectedSplitType.toLowerCase()
      );
    }

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.description?.toLowerCase().includes(q) ||
          e.paidBy?.name?.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date || 0) - new Date(a.date || 0);
      if (sortBy === 'date-asc') return new Date(a.date || 0) - new Date(b.date || 0);
      if (sortBy === 'amount-desc') return (b.amount || 0) - (a.amount || 0);
      if (sortBy === 'amount-asc') return (a.amount || 0) - (b.amount || 0);
      return 0;
    });

    return result;
  }, [expenses, selectedCategory, selectedSplitType, searchQuery, sortBy]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Expenses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track, filter, and audit all group and personal transactions
          </p>
        </div>

        <button
          onClick={() => {
            setEditingExpense(null);
            setIsAddExpenseOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-semibold text-xs sm:text-sm shadow-glow-indigo transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by description or payer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c.toLowerCase()}>
                Category: {c}
              </option>
            ))}
          </select>

          {/* Split Type Filter */}
          <select
            value={selectedSplitType}
            onChange={(e) => setSelectedSplitType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">Split: All</option>
            <option value="equal">Equal</option>
            <option value="custom">Custom</option>
            <option value="percentage">Percentage</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Expenses Table / Cards Hybrid */}
      {filteredExpenses.length === 0 ? (
        <EmptyState
          type={searchQuery ? 'search' : 'expenses'}
          title={searchQuery ? 'No matching expenses' : undefined}
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setSelectedSplitType('all');
            setIsAddExpenseOpen(true);
          }}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-sm">
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="col-span-4">Expense Details</span>
            <span className="col-span-2">Paid By</span>
            <span className="col-span-2">Group & Split</span>
            <span className="col-span-2 text-right">Amount</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>

          {/* Items */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredExpenses.map((expense) => {
              const meta = getCategoryMeta(expense.category);
              return (
                <motion.div
                  key={expense.id}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                  className="p-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center transition-colors"
                >
                  {/* Col 1: Expense Details */}
                  <div className="md:col-span-4 flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border shrink-0 ${meta.bg}`}
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
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(expense.date)}</span>
                        <span>•</span>
                        <span className="capitalize">{expense.category}</span>
                      </p>
                    </div>
                  </div>

                  {/* Col 2: Paid By */}
                  <div className="md:col-span-2 flex items-center gap-2">
                    <img
                      src={expense.paidBy?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'}
                      alt={expense.paidBy?.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {expense.paidBy?.name || 'Gayathiri'}
                    </span>
                  </div>

                  {/* Col 3: Group & Split Type */}
                  <div className="md:col-span-2">
                    <span className="text-xs text-slate-300 font-semibold block">
                      {expense.groupName || 'Direct Split'}
                    </span>
                    <span className="text-[11px] text-indigo-400 capitalize">
                      {expense.splitType} split • {expense.participants?.length || 4} ppl
                    </span>
                  </div>

                  {/* Col 4: Amount */}
                  <div className="md:col-span-2 text-left md:text-right">
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {formatINR(expense.amount)}
                    </span>
                    <span className="block text-[10px] text-emerald-400 font-semibold uppercase">
                      Completed
                    </span>
                  </div>

                  {/* Col 5: Actions */}
                  <div className="md:col-span-2 flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setViewingExpense(expense)}
                      aria-label="View Details"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingExpense(expense);
                        setIsAddExpenseOpen(true);
                      }}
                      aria-label="Edit Expense"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      aria-label="Delete Expense"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* View Expense Detail Modal */}
      <AnimatePresence>
        {viewingExpense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] shadow-glass p-6 text-slate-800 dark:text-slate-100 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-base">Expense Breakdown</h3>
                <button
                  onClick={() => setViewingExpense(null)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div>
                <h4 className="text-xl font-bold">{viewingExpense.description}</h4>
                <p className="text-2xl font-black text-cyan-400 mt-1">
                  {formatINR(viewingExpense.amount)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Paid by <span className="font-semibold text-white">{viewingExpense.paidBy?.name}</span> on{' '}
                  {formatDate(viewingExpense.date)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400">Individual Participant Shares</span>
                <div className="divide-y divide-slate-800 text-xs">
                  {viewingExpense.splits?.map((s, i) => (
                    <div key={i} className="py-1.5 flex items-center justify-between">
                      <span className="text-slate-300">{s.userName}</span>
                      <span className="font-bold text-white">{formatINR(s.amount, 2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
