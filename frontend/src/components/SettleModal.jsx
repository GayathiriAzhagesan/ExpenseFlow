import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeftRight, CheckCircle2, QrCode, Banknote } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/formatters';

export default function SettleModal({ settlement, isOpen, onClose, onOpenScanner }) {
  const { handleSettle } = useApp();
  const [method, setMethod] = useState('upi'); // 'upi', 'cash'
  const [processing, setProcessing] = useState(false);

  if (!isOpen || !settlement) return null;

  const onConfirm = async () => {
    setProcessing(true);
    await handleSettle(settlement.id, {
      paymentMethod: method === 'upi' ? 'UPI' : 'Cash',
    });
    setProcessing(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] shadow-glass p-6 sm:p-7 text-slate-800 dark:text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white shadow-glow-cyan">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">Record Settlement</h3>
                <p className="text-xs text-slate-400">Clear outstanding shared balance</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Amount Badge */}
          <div className="my-6 p-4 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 text-center">
            <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              Settlement Amount
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {formatINR(settlement.amount)}
            </h2>
            <div className="flex items-center justify-center gap-3 mt-3 text-xs text-slate-300">
              <span className="font-semibold text-slate-100">{settlement.fromUser?.name}</span>
              <span className="text-cyan-400 font-bold">➔</span>
              <span className="font-semibold text-slate-100">{settlement.toUser?.name}</span>
            </div>
          </div>

          {/* Payment Method Option */}
          <div className="space-y-2 mb-6">
            <label className="block text-xs font-semibold text-slate-400">Payment Channel</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('upi')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium transition-all ${
                  method === 'upi'
                    ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400 shadow-sm'
                    : 'border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>UPI / NetBanking</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium transition-all ${
                  method === 'cash'
                    ? 'border-indigo-400 bg-indigo-500/10 text-indigo-400 shadow-sm'
                    : 'border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Cash / Direct</span>
              </button>
            </div>

            {method === 'upi' && onOpenScanner && (
              <motion.button
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                type="button"
                onClick={() => {
                  onOpenScanner(settlement);
                }}
                className="w-full mt-2.5 p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <QrCode className="w-4 h-4" />
                <span>Scan Recipient UPI QR Code</span>
              </motion.button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800/60"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={processing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-xs font-bold shadow-glow-cyan transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{processing ? 'Settling...' : 'Confirm Settlement'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
