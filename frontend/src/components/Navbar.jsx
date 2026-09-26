import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ currentRoute, setCurrentRoute }) {
  const {
    theme,
    toggleTheme,
    currentUser,
    notifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    logout,
    searchQuery,
    setSearchQuery,
    wsConnected,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#080C15]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Search Input */}
      <div className="flex items-center gap-3 w-full max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses, members, groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Real-time Status Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span
            className={`w-2 h-2 rounded-full ${
              wsConnected ? 'bg-emerald-500 shadow-glow-cyan animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="text-slate-600 dark:text-slate-400">
            {wsConnected ? 'Live sync' : 'Local mode'}
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
        </button>

        {/* Notification Icon & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Notifications"
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-glow-cyan animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl p-4 shadow-glass border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 backdrop-blur-2xl z-50"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-500 text-white">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-indigo-500 hover:text-indigo-400 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 my-2">
                  {notifications.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">No notifications yet.</p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          handleMarkAsRead(notif.id);
                          if (notif.link) setCurrentRoute(notif.link.replace('/', ''));
                          setIsNotifOpen(false);
                        }}
                        className={`p-3 flex items-start gap-3 rounded-xl cursor-pointer transition-colors ${
                          notif.read
                            ? 'opacity-65 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            : 'bg-indigo-500/5 hover:bg-indigo-500/10 dark:bg-indigo-500/10'
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 text-xs">
                          <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            Just now
                          </span>
                        </div>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            <img
              src={currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gayathiri'}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-full ring-2 ring-indigo-500/40 bg-slate-800"
            />
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-700 dark:text-slate-200">
              {currentUser?.name || 'Gayathiri'}
            </span>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 mt-2 w-56 rounded-2xl p-2 shadow-glass border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 backdrop-blur-2xl z-50 text-xs"
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setCurrentRoute('profile');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentRoute('settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-cyan-400" />
                    <span>Settings & Preferences</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      logout();
                      setCurrentRoute('login');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
