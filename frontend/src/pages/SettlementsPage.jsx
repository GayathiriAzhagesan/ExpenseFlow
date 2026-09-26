import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Banknote,
  ShieldCheck,
  QrCode,
  Scan,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR, formatDate } from '../utils/formatters';
import SettleModal from '../components/SettleModal';
import ScanAndPayModal from '../components/ScanAndPayModal';
import EmptyState from '../components/EmptyState';

export default function SettlementsPage() {
  const { settlements } = useApp();
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanTargetSettlement, setScanTargetSettlement] = useState(null);

  const uniqueSettlements = React.useMemo(() => {
    const map = new Map();
    for (const s of settlements) {
      if (!s) continue;
      const key = s.id || s._id;
      if (key && !map.has(key)) map.set(key, { ...s, id: key });
    }
    return Array.from(map.values());
  }, [settlements]);

  const pendingSettlements = uniqueSettlements.filter((s) => s.status === 'pending');
  const settledHistory = uniqueSettlements.filter((s) => s.status === 'settled');

  const openSettle = (s) => {
    setSelectedSettlement(s);
    setIsSettleModalOpen(true);
  };

  const openScanAndPay = (s = null) => {
    setScanTargetSettlement(s);
    setIsScanModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header with Scan & Pay Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Debt Settlements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review peer debts, initiate instant payouts, and inspect settled ledger logs
          </p>
        </div>

        {/* Prominent Scan & Pay Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => openScanAndPay(pendingSettlements[0] || null)}
          className="self-start sm:self-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold text-xs sm:text-sm shadow-glow-cyan transition-all flex items-center gap-2.5"
        >
          <div className="p-1 rounded-lg bg-white/20">
            <QrCode className="w-4 h-4 text-white" />
          </div>
          <span>Scan & Pay</span>
        </motion.button>
      </div>

      {/* Outstanding Balances Section */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Outstanding Balances
              </h2>
              <p className="text-xs text-slate-400">Pending debt resolution between members</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400">
            {pendingSettlements.length} Pending
          </span>
        </div>

        {pendingSettlements.length === 0 ? (
          <EmptyState
            type="settlements"
            title="All balances are settled!"
            description="You and your groups are totally squared up with zero pending debts."
          />
        ) : (
          <div className="space-y-3">
            {pendingSettlements.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.01 }}
                className="p-4 sm:p-5 rounded-2xl bg-white/50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              >
                {/* Peer Information */}
                <div className="flex items-center gap-3.5">
                  <div className="flex items-center -space-x-2">
                    <img
                      src={
                        item.fromUser?.avatar ||
                        'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'
                      }
                      alt={item.fromUser?.name}
                      className="w-10 h-10 rounded-full ring-2 ring-slate-900 bg-slate-800"
                    />
                    <img
                      src={
                        item.toUser?.avatar ||
                        'https://api.dicebear.com/7.x/avataaars/svg?seed=Gayathiri'
                      }
                      alt={item.toUser?.name}
                      className="w-10 h-10 rounded-full ring-2 ring-slate-900 bg-slate-800"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.fromUser?.name}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.toUser?.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.groupName || 'Direct Expense'} • Created {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right pr-2">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {formatINR(item.amount)}
                    </span>
                    <span className="block text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                      Pending
                    </span>
                  </div>

                  {/* Scan & Pay Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openScanAndPay(item)}
                    className="px-3.5 sm:px-4 py-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Scan & Pay</span>
                  </motion.button>

                  {/* Manual Settle Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openSettle(item)}
                    className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold text-xs shadow-glow-cyan transition-all"
                  >
                    Settle Balance
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Settlement History Section */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Settlement History
              </h2>
              <p className="text-xs text-slate-400">Completed payments and debt clearances</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
            {settledHistory.length} Settled
          </span>
        </div>

        {settledHistory.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-6">No historical settlements yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {settledHistory.map((item) => (
              <div
                key={item.id}
                className="py-4 flex items-center justify-between gap-4 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-3 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.fromUser?.name} paid {item.toUser?.name}
                      </p>
                      {item.paymentMethod === 'UPI' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono font-bold">
                          <QrCode className="w-2.5 h-2.5 text-cyan-400" />
                          UPI
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.paymentMethod === 'UPI' ? 'UPI Payment' : (item.groupName || 'Direct')} • Settled {formatDate(item.settledAt || item.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {formatINR(item.amount)}
                  </span>
                  <span className="block text-[10px] font-semibold text-emerald-400 uppercase">
                    {item.paymentMethod === 'UPI' ? 'Paid via UPI' : 'Settled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Settlement Action Modal */}
      <SettleModal
        settlement={selectedSettlement}
        isOpen={isSettleModalOpen}
        onClose={() => {
          setIsSettleModalOpen(false);
          setSelectedSettlement(null);
        }}
        onOpenScanner={(st) => {
          setIsSettleModalOpen(false);
          openScanAndPay(st);
        }}
      />

      {/* QR Scanner & UPI Payment Modal */}
      <ScanAndPayModal
        isOpen={isScanModalOpen}
        settlement={scanTargetSettlement}
        onClose={() => {
          setIsScanModalOpen(false);
          setScanTargetSettlement(null);
        }}
      />
    </div>
  );
}
