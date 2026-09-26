import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { initialUsers } from '../data/mockData';

const GROUP_AVATARS = [
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=300&q=80',
];

export default function CreateGroupModal() {
  const { isCreateGroupOpen, setIsCreateGroupOpen, handleCreateGroup, currentUser } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState(GROUP_AVATARS[0]);
  const [members, setMembers] = useState([
    {
      id: currentUser?.id || 'u1',
      name: currentUser?.name || 'Gayathiri',
      email: currentUser?.email || 'gayathiri@expenseflow.dev',
      avatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gayathiri',
      role: 'admin',
      netOwe: 0,
    },
  ]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const addQuickMember = (user) => {
    if (members.some((m) => m.id === user.id || m.email === user.email)) return;
    setMembers([
      ...members,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: 'member',
        netOwe: 0,
      },
    ]);
  };

  const handleAddCustomMember = () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    const newM = {
      id: 'm_' + Date.now(),
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newMemberName)}`,
      role: 'member',
      netOwe: 0,
    };
    setMembers([...members, newM]);
    setNewMemberName('');
    setNewMemberEmail('');
  };

  const removeMember = (id) => {
    if (members.length <= 1) return;
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    await handleCreateGroup({
      name,
      description,
      avatar,
      members,
    });

    setIsCreateGroupOpen(false);
    setName('');
    setDescription('');
  };

  if (!isCreateGroupOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] shadow-glass p-6 sm:p-8 my-8 text-slate-800 dark:text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white shadow-glow-cyan">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Create Expense Group</h3>
                <p className="text-xs text-slate-400">Share trip, apartment, or outing costs</p>
              </div>
            </div>

            <button
              onClick={() => setIsCreateGroupOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Group Name
              </label>
              <input
                type="text"
                placeholder="e.g. College Friends, Trip 2026, Roommates"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Description (Optional)
              </label>
              <input
                type="text"
                placeholder="Brief description of shared activities"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>

            {/* Avatar Cover Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Group Theme Image
              </label>
              <div className="flex items-center gap-3">
                {GROUP_AVATARS.map((imgUrl, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setAvatar(imgUrl)}
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                      avatar === imgUrl
                        ? 'border-cyan-400 ring-2 ring-cyan-500/30 scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="theme" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Add Members */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Quick Add Suggested Friends
              </label>
              <div className="flex flex-wrap gap-2">
                {initialUsers.map((u) => {
                  const added = members.some((m) => m.id === u.id);
                  return (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => addQuickMember(u)}
                      disabled={added}
                      className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-colors ${
                        added
                          ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400 opacity-60'
                          : 'border-slate-700 hover:border-indigo-400 text-slate-300'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>{u.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Member Input */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Add By Email
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Friend's Name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                />
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddCustomMember}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-700"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Members List */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Group Members ({members.length})
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <img src={m.avatar} alt={m.name} className="w-5 h-5 rounded-full" />
                      <span className="font-medium">{m.name}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        ({m.email})
                      </span>
                    </div>

                    {m.id !== (currentUser?.id || 'u1') && (
                      <button
                        type="button"
                        onClick={() => removeMember(m.id)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateGroupOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white text-xs font-semibold shadow-glow-cyan transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Create Group
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
