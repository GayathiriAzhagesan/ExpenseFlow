import React from 'react';
import { motion } from 'framer-motion';
import { Compass, ArrowLeft, Zap } from 'lucide-react';
import FinancialOrb from '../three/FinancialOrb';

export default function NotFoundPage({ onNavigateDashboard }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 max-w-md"
      >
        <div className="w-32 h-32 mx-auto relative flex items-center justify-center">
          <FinancialOrb className="h-32 w-32" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Error 404
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            The balance ledger or route you are looking for has been archived or does not exist.
          </p>
        </div>

        <button
          onClick={onNavigateDashboard}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-xs shadow-glow-indigo transition-all transform hover:scale-[1.02]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </motion.div>
    </div>
  );
}
