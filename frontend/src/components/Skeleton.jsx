import React from 'react';

export function CardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-white/5 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-slate-300 dark:bg-slate-700/60 rounded w-1/3"></div>
        <div className="h-8 w-8 bg-slate-300 dark:bg-slate-700/60 rounded-full"></div>
      </div>
      <div className="h-8 bg-slate-300 dark:bg-slate-700/60 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/60 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-300 dark:bg-slate-800"></div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-32"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
        </div>
      </div>
      <div className="h-5 bg-slate-300 dark:bg-slate-700 rounded w-24"></div>
    </div>
  );
}
