import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart2, Calendar, CreditCard } from 'lucide-react';
import { formatINR } from '../utils/formatters';

const PIE_COLORS = ['#6366F1', '#06B6D4', '#8B5CF6', '#10B981', '#F43F5E', '#F59E0B'];

const DATE_RANGES = ['7 Days', '30 Days', '3 Months', '6 Months', '1 Year'];

export default function AnalyticsPage() {
  const [activeRange, setActiveRange] = useState('6 Months');

  const monthlyTrendData = [
    { month: 'Nov', spent: 3200, settled: 2800 },
    { month: 'Dec', spent: 4800, settled: 4200 },
    { month: 'Jan', spent: 4100, settled: 3900 },
    { month: 'Feb', spent: 5200, settled: 4600 },
    { month: 'Mar', spent: 5400, settled: 5100 },
    { month: 'Apr', spent: 2300, settled: 2100 },
  ];

  const categoryData = [
    { name: 'Food & Dining', amount: 2400 },
    { name: 'Entertainment', amount: 1200 },
    { name: 'Transportation', amount: 800 },
    { name: 'Shopping', amount: 1000 },
  ];

  const groupSpendingData = [
    { name: 'College Friends', amount: 5400 },
    { name: 'Trip 2026', amount: 12800 },
    { name: 'Roommates', amount: 3200 },
  ];

  const contributionData = [
    { member: 'Gayathiri', paid: 2400, share: 1350 },
    { member: 'Priya', paid: 1200, share: 1350 },
    { member: 'Anu', paid: 800, share: 1350 },
    { member: 'Divya', paid: 1000, share: 1350 },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Date Range Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Financial Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Deep insights into expenditure velocity, category breakdown, and group contributions
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs">
          {DATE_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                activeRange === range
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Monthly Spending (Area Chart) & Settlement Velocity (Line Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Trend */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Monthly Spending & Settlements
              </h3>
              <p className="text-xs text-slate-400">Total shared spend vs settled payouts</p>
            </div>
            <span className="text-xs font-bold text-cyan-400">Area View</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaColor1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="areaColor2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
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
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs shadow-glass text-white space-y-1">
                          <p className="font-bold">{payload[0].payload.month}</p>
                          <p className="text-indigo-400">
                            Spent: {formatINR(payload[0].payload.spent)}
                          </p>
                          <p className="text-cyan-400">
                            Settled: {formatINR(payload[0].payload.settled)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="spent"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fill="url(#areaColor1)"
                />
                <Area
                  type="monotone"
                  dataKey="settled"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  fill="url(#areaColor2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Group Spending Breakdown (Bar Chart) */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Group Spending Allocation
              </h3>
              <p className="text-xs text-slate-400">Total volume divided across active groups</p>
            </div>
            <span className="text-xs font-bold text-indigo-400">Bar View</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupSpendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val) => [formatINR(val), 'Expenses']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="amount" fill="#6366F1" radius={[8, 8, 0, 0]}>
                  {groupSpendingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Category Donut & Personal Contribution Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown (Donut) */}
        <div className="lg:col-span-5 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Category Distribution
            </h3>
            <p className="text-xs text-slate-400">Expenditure categorized by sector</p>
          </div>

          <div className="h-56 w-full my-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="amount"
                >
                  {categoryData.map((entry, index) => (
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

          <div className="space-y-1.5 text-xs">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="text-slate-300">{cat.name}</span>
                </div>
                <span className="font-bold text-white">{formatINR(cat.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Contribution & Fair Share (Dual Bar) */}
        <div className="lg:col-span-7 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Member Paid vs Fair Share
              </h3>
              <p className="text-xs text-slate-400">Total paid upfront vs total consumed share</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Paid
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Fair Share
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="member" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(val, name) => [formatINR(val), name === 'paid' ? 'Paid Upfront' : 'Consumed Share']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="paid" fill="#6366F1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="share" fill="#06B6D4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
