import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt, Users, AlertCircle, Check, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { initialUsers } from '../data/mockData';
import { formatINR } from '../utils/formatters';

const CATEGORIES = [
  'Food & Dining',
  'Entertainment',
  'Transportation',
  'Groceries',
  'Bills & Utilities',
  'Shopping',
  'General',
];

export default function AddExpenseModal() {
  const {
    isAddExpenseOpen,
    setIsAddExpenseOpen,
    groups,
    handleCreateExpense,
    handleUpdateExpense,
    editingExpense,
    setEditingExpense,
    activeGroupForExpense,
  } = useApp();

  const safeGroups = Array.isArray(groups) ? groups : [];

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [groupId, setGroupId] = useState('');
  const [paidBy, setPaidBy] = useState(initialUsers[0]);
  const [selectedParticipants, setSelectedParticipants] = useState(initialUsers);
  const [splitType, setSplitType] = useState('equal'); // 'equal', 'custom', 'percentage'
  const [customSplits, setCustomSplits] = useState({});
  const [percentageSplits, setPercentageSplits] = useState({});
  const [validationError, setValidationError] = useState('');

  // Sync when editing or modal opens
  useEffect(() => {
    if (editingExpense) {
      setDescription(editingExpense.description);
      setAmount(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setDate(editingExpense.date);
      setGroupId(editingExpense.groupId || '');
      setPaidBy(editingExpense.paidBy || initialUsers[0]);
      setSelectedParticipants(editingExpense.participants || initialUsers);
      setSplitType(editingExpense.splitType || 'equal');

      if (editingExpense.splitType === 'custom') {
        const cMap = {};
        editingExpense.splits?.forEach((s) => {
          cMap[s.userId] = s.amount;
        });
        setCustomSplits(cMap);
      } else if (editingExpense.splitType === 'percentage') {
        const pMap = {};
        editingExpense.splits?.forEach((s) => {
          pMap[s.userId] = s.percentage;
        });
        setPercentageSplits(pMap);
      }
    } else {
      setDescription('');
      setAmount('');
      setCategory('Food & Dining');
      setDate(new Date().toISOString().split('T')[0]);
      setGroupId(activeGroupForExpense || '');
      setPaidBy(initialUsers[0]);
      setSelectedParticipants(initialUsers);
      setSplitType('equal');
      setCustomSplits({});
      setPercentageSplits({});
      setValidationError('');
    }
  }, [editingExpense, isAddExpenseOpen, activeGroupForExpense]);

  // Recalculate percentage / custom splits when amount or participants change
  const numericAmount = parseFloat(amount) || 0;
  const numParticipants = selectedParticipants.length;

  const equalSplitAmount = numParticipants > 0 ? numericAmount / numParticipants : 0;
  const othersOwe = paidBy && selectedParticipants.some((p) => p.id === paidBy.id)
    ? Math.max(0, numericAmount - equalSplitAmount)
    : numericAmount;

  // Toggle participant
  const toggleParticipant = (user) => {
    if (selectedParticipants.some((p) => p.id === user.id)) {
      if (selectedParticipants.length <= 1) {
        setValidationError('At least one participant is required');
        return;
      }
      setSelectedParticipants(selectedParticipants.filter((p) => p.id !== user.id));
    } else {
      setSelectedParticipants([...selectedParticipants, user]);
    }
  };

  const handleCustomChange = (userId, val) => {
    setCustomSplits((prev) => ({
      ...prev,
      [userId]: parseFloat(val) || 0,
    }));
  };

  const handlePercentageChange = (userId, val) => {
    setPercentageSplits((prev) => ({
      ...prev,
      [userId]: parseFloat(val) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!description.trim()) {
      setValidationError('Please enter an expense description');
      return;
    }

    if (!amount || numericAmount <= 0) {
      setValidationError('Please enter a valid expense amount');
      return;
    }

    if (numParticipants === 0) {
      setValidationError('Please select at least one participant');
      return;
    }

    // Build splits array
    let splits = [];

    if (splitType === 'equal') {
      const perHead = Math.round((numericAmount / numParticipants) * 100) / 100;
      let allocated = 0;
      splits = selectedParticipants.map((p, idx) => {
        const amt = idx === numParticipants - 1 ? Math.round((numericAmount - allocated) * 100) / 100 : perHead;
        allocated += amt;
        return {
          userId: p.id,
          userName: p.name,
          amount: amt,
          percentage: Math.round((amt / numericAmount) * 10000) / 100,
          paid: p.id === paidBy.id,
        };
      });
    } else if (splitType === 'custom') {
      let sum = 0;
      splits = selectedParticipants.map((p) => {
        const val = customSplits[p.id] || 0;
        sum += val;
        return {
          userId: p.id,
          userName: p.name,
          amount: val,
          paid: p.id === paidBy.id,
        };
      });

      if (Math.abs(sum - numericAmount) > 0.05) {
        setValidationError(
          `Sum of splits (${formatINR(sum)}) does not equal total amount (${formatINR(numericAmount)})`
        );
        return;
      }
    } else if (splitType === 'percentage') {
      let sumPct = 0;
      splits = selectedParticipants.map((p) => {
        const pct = percentageSplits[p.id] || 0;
        sumPct += pct;
        const val = Math.round((numericAmount * (pct / 100)) * 100) / 100;
        return {
          userId: p.id,
          userName: p.name,
          amount: val,
          percentage: pct,
          paid: p.id === paidBy.id,
        };
      });

      if (Math.abs(sumPct - 100) > 0.05) {
        setValidationError(`Sum of percentages (${sumPct.toFixed(1)}%) must equal 100%`);
        return;
      }
    }

    const payload = {
      description,
      amount: numericAmount,
      category,
      date,
      paidBy: {
        id: paidBy.id,
        name: paidBy.name,
        avatar: paidBy.avatar,
      },
      participants: selectedParticipants.map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
      })),
      splitType,
      splits,
      groupId: groupId || undefined,
      groupName: safeGroups.find((g) => g?.id === groupId || g?._id === groupId)?.name || undefined,
    };

    try {
      if (editingExpense) {
        await handleUpdateExpense(editingExpense.id, payload);
      } else {
        await handleCreateExpense(payload);
      }
      setIsAddExpenseOpen(false);
      setEditingExpense(null);
    } catch {
      // Error handled in AppContext
    }
  };

  if (!isAddExpenseOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] shadow-glass p-6 sm:p-8 my-8 text-slate-800 dark:text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white shadow-glow-indigo">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                </h3>
                <p className="text-xs text-slate-400">
                  Splits balances instantly across your group
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsAddExpenseOpen(false);
                setEditingExpense(null);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Validation Notice */}
          {validationError && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Description & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dinner at Bistro, Movie tickets"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="any"
                    placeholder="2000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Category & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            {/* Group & Paid By */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Group (Optional)
                </label>
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="">No Group (Direct split)</option>
                  {Array.isArray(safeGroups) &&
                    safeGroups.map((g) => {
                      const gid = g?.id || g?._id;
                      return (
                        <option key={gid} value={gid}>
                          {g.name}
                        </option>
                      );
                    })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Paid By
                </label>
                <select
                  value={paidBy.id}
                  onChange={(e) => {
                    const u = initialUsers.find((user) => user.id === e.target.value);
                    if (u) setPaidBy(u);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {initialUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Participants Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Participants ({selectedParticipants.length})
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {initialUsers.map((u) => {
                  const isSelected = selectedParticipants.some((p) => p.id === u.id);
                  return (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => toggleParticipant(u)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full" />
                      <span className="truncate">{u.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Split Type</label>
              <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {['equal', 'custom', 'percentage'].map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setSplitType(type)}
                    className={`py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                      splitType === type
                        ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Split Details Breakdown */}
            <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
              {splitType === 'equal' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Equal Share per person:</span>
                    <span className="text-cyan-400 font-bold">{formatINR(equalSplitAmount, 2)}</span>
                  </div>

                  <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs pt-1">
                    {selectedParticipants.map((p) => (
                      <div key={p.id} className="py-1.5 flex items-center justify-between">
                        <span className="text-slate-300">{p.name}</span>
                        <span className="font-semibold text-slate-200">
                          {formatINR(equalSplitAmount, 2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {numericAmount > 0 && (
                    <div className="pt-2 text-xs text-indigo-400 font-medium flex flex-col gap-0.5 border-t border-slate-200 dark:border-slate-800">
                      <span>• {paidBy.name} paid {formatINR(numericAmount)}</span>
                      <span>• Others owe {paidBy.name} {formatINR(othersOwe, 2)}</span>
                    </div>
                  )}
                </div>
              )}

              {splitType === 'custom' && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">Specify exact amount for each member:</p>
                  {selectedParticipants.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-3 text-xs">
                      <span>{p.name}</span>
                      <div className="relative w-32">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                          ₹
                        </span>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={customSplits[p.id] ?? ''}
                          onChange={(e) => handleCustomChange(p.id, e.target.value)}
                          className="w-full pl-6 pr-2 py-1 text-right rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {splitType === 'percentage' && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">Specify percentage allocation (total 100%):</p>
                  {selectedParticipants.map((p) => {
                    const pct = percentageSplits[p.id] || 0;
                    const calculatedAmt = numericAmount * (pct / 100);
                    return (
                      <div key={p.id} className="flex items-center justify-between gap-3 text-xs">
                        <span className="truncate">{p.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-medium">
                            ({formatINR(calculatedAmt)})
                          </span>
                          <div className="relative w-20">
                            <input
                              type="number"
                              step="any"
                              placeholder="0"
                              value={percentageSplits[p.id] ?? ''}
                              onChange={(e) => handlePercentageChange(p.id, e.target.value)}
                              className="w-full pr-6 pl-2 py-1 text-right rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsAddExpenseOpen(false);
                  setEditingExpense(null);
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs font-semibold shadow-glow-indigo transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {editingExpense ? 'Save Changes' : 'Record Expense'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
