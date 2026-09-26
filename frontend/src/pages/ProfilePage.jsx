import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Shield,
  CreditCard,
  Users,
  ArrowLeftRight,
  TrendingUp,
  Check,
  Save,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/formatters';

export default function ProfilePage() {
  const { currentUser, updateProfile, expenses, groups, settlements } = useApp();

  const [name, setName] = useState(currentUser?.name || 'Gayathiri');
  const [email] = useState(currentUser?.email || 'gayathiri@expenseflow.dev');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [avatar, setAvatar] = useState(
    currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gayathiri'
  );

  // Compute profile stats
  const totalExpensesCount = expenses.length;
  const groupsCount = groups.length;
  const settlementsCount = settlements.length;

  let amountPaid = 0;
  let amountReceived = 0;
  expenses.forEach((e) => {
    if (e.paidBy?.id === currentUser?.id) {
      amountPaid += e.amount;
    }
  });
  settlements.forEach((s) => {
    if (s.status === 'settled') {
      if (s.fromUser?.id === currentUser?.id) amountPaid += s.amount;
      if (s.toUser?.id === currentUser?.id) amountReceived += s.amount;
    }
  });
  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({ name, phone, avatar });
  };

  const regenerateAvatar = () => {
    const newSeed = name + '_' + Date.now();
    setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newSeed)}`);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Member Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage your personal details, contact coordinates, and overview account statistics
        </p>
      </div>

      {/* Hero Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="relative group">
            <img
              src={avatar}
              alt={name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl ring-4 ring-indigo-500/30 object-cover shadow-glow-indigo bg-slate-800"
            />
            <button
              type="button"
              onClick={regenerateAvatar}
              className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-indigo-500 text-[10px] font-bold text-cyan-400 shadow-sm hover:scale-105 transition-transform"
            >
              Change
            </button>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                Verified Account
              </span>
            </div>
            <p className="text-xs text-slate-400">{email}</p>
            <p className="text-xs text-slate-400">{phone}</p>
          </div>
        </div>

        {/* 5 Key Statistics Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Expenses</span>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {totalExpensesCount}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Groups</span>
            <p className="text-lg font-black text-indigo-400 mt-0.5">{groupsCount}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Settlements</span>
            <p className="text-lg font-black text-purple-400 mt-0.5">{settlementsCount}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Amount Paid</span>
            <p className="text-lg font-black text-cyan-400 mt-0.5">{formatINR(amountPaid)}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              Amount Received
            </span>
            <p className="text-lg font-black text-emerald-400 mt-0.5">
              {formatINR(amountReceived)}
            </p>
          </div>
        </div>
      </div>

      {/* Editable Profile Form */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">
          Edit Profile Information
        </h3>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Email Address (Fixed)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                disabled
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-xs shadow-glow-indigo transition-all transform hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
