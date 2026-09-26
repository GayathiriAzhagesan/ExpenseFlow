import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Bell,
  Lock,
  Shield,
  Smartphone,
  LogOut,
  Check,
  KeyRound,
  Sliders,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SettingsPage() {
  const { theme, toggleTheme, addToast, logout } = useApp();

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [settlementNotifs, setSettlementNotifs] = useState(true);
  const [autoSettleReminder, setAutoSettleReminder] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    addToast('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleLogoutAllSessions = () => {
    logout();
    addToast('All active sessions have been safely logged out');
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Application Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Configure interface appearance, notifications, security protocols, and session controls
        </p>
      </div>

      {/* 1. Appearance Section */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <span>Appearance & Theme</span>
        </h3>
        <p className="text-xs text-slate-400">
          Select between our high-contrast Fintech Dark Mode and clean Minimal Light Mode.
        </p>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <button
            type="button"
            onClick={() => theme === 'light' && toggleTheme()}
            className={`p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all ${
              theme === 'dark'
                ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-glow-indigo'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-slate-900 text-indigo-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Fintech Dark Mode</p>
              <p className="text-[11px] text-slate-400">Deep Navy & Electric Cyan</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => theme === 'dark' && toggleTheme()}
            className={`p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all ${
              theme === 'light'
                ? 'border-cyan-500 bg-cyan-500/10 text-slate-900 shadow-glow-cyan'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-slate-100 text-cyan-600">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Fintech Light Mode</p>
              <p className="text-[11px] text-slate-400">Crisp Slate & White</p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Notifications Section */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-5">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <span>Notification Preferences</span>
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                Email Notifications
              </p>
              <p className="text-slate-400">
                Receive summaries when you are added to an expense or a group
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                Settlement Notifications
              </p>
              <p className="text-slate-400">
                Real-time alerts when someone clears an outstanding debt to you
              </p>
            </div>
            <input
              type="checkbox"
              checked={settlementNotifs}
              onChange={(e) => setSettlementNotifs(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                Automatic Settlement Reminders
              </p>
              <p className="text-slate-400">
                Gentle weekly ping to friends with pending balances over ₹500
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoSettleReminder}
              onChange={(e) => setAutoSettleReminder(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 3. Security Section */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-5">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-400" />
          <span>Security & Password</span>
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              required
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* 4. Session Controls */}
      <div className="p-6 sm:p-8 rounded-3xl border border-rose-500/20 bg-rose-500/5 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-rose-400">Logout All Sessions</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Revoke all active JWT tokens across desktop browsers and mobile devices.
          </p>
        </div>

        <button
          onClick={handleLogoutAllSessions}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition-colors self-start sm:self-auto"
        >
          Logout All Sessions
        </button>
      </div>
    </div>
  );
}
