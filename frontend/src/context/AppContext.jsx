import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api, dedupeList } from '../services/api';
import confetti from 'canvas-confetti';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('expenseflow_theme') || 'dark';
  });

  // User state
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('expenseflow_user_v1');
    return saved
      ? JSON.parse(saved)
      : {
          id: 'u1',
          name: 'Gayathiri',
          email: 'gayathiri@expenseflow.dev',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gayathiri',
          phone: '+91 98765 43210',
        };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('expenseflow_token') || currentUser);
  });

  // Core Data States (always deduplicated by unique ID)
  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [toasts, setToasts] = useState([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [activeGroupForExpense, setActiveGroupForExpense] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSplitType, setSelectedSplitType] = useState('all');
  const [wsConnected, setWsConnected] = useState(false);

  // Toast Helper
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync theme to document class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('expenseflow_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Fetch all live data with strict deduplication
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const [expData, grpData, stmData, notifData] = await Promise.all([
        api.getExpenses({ search: searchQuery, category: selectedCategory, splitType: selectedSplitType }).catch(() => []),
        api.getGroups().catch(() => []),
        api.getSettlements().catch(() => []),
        api.getNotifications().catch(() => []),
      ]);

      setExpenses(dedupeList(Array.isArray(expData) ? expData : []));
      setGroups(dedupeList(Array.isArray(grpData) ? grpData : []));
      setSettlements(dedupeList(Array.isArray(stmData) ? stmData : []));
      setNotifications(dedupeList(Array.isArray(notifData) ? notifData : []));
    } catch (err) {
      console.error('Failed to load live data:', err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedSplitType]);

  // Initial authentication & data load
  useEffect(() => {
    let isMounted = true;
    const initApp = async () => {
      const token = localStorage.getItem('expenseflow_token');
      // If token is missing or legacy mock string, authenticate with live backend
      if (!token || token === 'mock_jwt_token_local_dev') {
        try {
          const authRes = await api.login('gayathiri@expenseflow.dev', 'password123');
          if (authRes?.user && isMounted) {
            setCurrentUser(authRes.user);
            setIsAuthenticated(true);
          }
        } catch (e) {
          console.warn('Initial live backend auth attempt:', e.message);
        }
      }
      if (isMounted) {
        refreshData();
      }
    };

    initApp();
    return () => {
      isMounted = false;
    };
  }, [refreshData]);

  // Real-time WebSocket connection to Render
  useEffect(() => {
    let socket;
    let reconnectTimeout;
    let heartbeatInterval;

    const rawWsUrl = (import.meta.env.VITE_WS_URL || '').trim();
    const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
    let wsUrl = 'wss://expenseflow-bl9s.onrender.com/api/ws';
    if (rawWsUrl && rawWsUrl.includes('bl9s')) {
      wsUrl = rawWsUrl;
    } else if (rawApiUrl && rawApiUrl.includes('bl9s')) {
      wsUrl = `${rawApiUrl.replace(/^http/, 'ws').replace(/\/+$/, '')}/api/ws`;
    }

    const connectWs = () => {
      try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          setWsConnected(true);
          console.log('[WebSocket] Connected to ExpenseFlow real-time hub:', wsUrl);

          // 25s ping heartbeat to prevent Render free-tier idle proxy timeout
          heartbeatInterval = setInterval(() => {
            if (socket && socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: 'PING' }));
            }
          }, 25000);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'PONG') return;
            console.log('[WebSocket Event]:', data);

            if (data.type === 'EXPENSE_CREATED' || data.type === 'EXPENSE_UPDATED' || data.type === 'EXPENSE_DELETED') {
              refreshData();
              addToast(`Live update: Expense ${data.type.toLowerCase().replace('_', ' ')}`, 'info');
            } else if (data.type === 'SETTLEMENT_COMPLETED') {
              refreshData();
              addToast('A settlement was just completed live!', 'success');
              confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
            } else if (data.type === 'GROUP_CREATED' || data.type === 'GROUP_UPDATED') {
              refreshData();
            }
          } catch (e) {
            console.error('WS parse error:', e);
          }
        };

        socket.onclose = () => {
          setWsConnected(false);
          clearInterval(heartbeatInterval);
          // Auto-reconnect after 3 seconds
          reconnectTimeout = setTimeout(connectWs, 3000);
        };

        socket.onerror = () => {
          setWsConnected(false);
        };
      } catch {
        setWsConnected(false);
      }
    };

    connectWs();
    return () => {
      if (socket) socket.close();
      clearTimeout(reconnectTimeout);
      clearInterval(heartbeatInterval);
    };
  }, [addToast, refreshData]);

  // Expense Actions with strict deduplication
  const handleCreateExpense = async (expenseData) => {
    try {
      const created = await api.createExpense(expenseData);
      if (created) {
        setExpenses((prev) => dedupeList([created, ...prev]));
      }
      addToast('Expense recorded successfully!');
      setTimeout(() => refreshData(), 300);
      return created;
    } catch (err) {
      addToast(err.message || 'Failed to record expense', 'error');
      throw err;
    }
  };

  const handleUpdateExpense = async (id, expenseData) => {
    try {
      const updated = await api.updateExpense(id, expenseData);
      setExpenses((prev) =>
        dedupeList(prev.map((e) => (e.id === id ? { ...e, ...updated, id } : e)))
      );
      addToast('Expense updated successfully!');
      setTimeout(() => refreshData(), 300);
      return updated;
    } catch (err) {
      addToast(err.message || 'Failed to update expense', 'error');
      throw err;
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await api.deleteExpense(id);
      setExpenses((prev) => dedupeList(prev.filter((e) => e.id !== id)));
      addToast('Expense deleted successfully!');
      setTimeout(() => refreshData(), 300);
    } catch (err) {
      addToast(err.message || 'Failed to delete expense', 'error');
    }
  };

  // Group Actions with strict deduplication
  const handleCreateGroup = async (groupData) => {
    try {
      const created = await api.createGroup(groupData);
      if (created) {
        setGroups((prev) => dedupeList([created, ...(Array.isArray(prev) ? prev : [])]));
      }
      addToast('Group created successfully!');
      setTimeout(() => refreshData(), 300);
      return created;
    } catch (err) {
      addToast(err.message || 'Failed to create group', 'error');
      throw err;
    }
  };

  const handleAddMember = async (groupId, memberData) => {
    try {
      await api.addGroupMember(groupId, memberData);
      addToast(`Added ${memberData.name} to group!`);
      refreshData();
    } catch (err) {
      addToast(err.message || 'Failed to add member', 'error');
    }
  };

  // Settlement Actions
  const handleSettle = async (settlementId, paymentData = {}) => {
    try {
      const settled = await api.settle(settlementId, paymentData);
      setSettlements((prev) =>
        dedupeList(
          prev.map((s) =>
            s.id === settlementId
              ? {
                  ...s,
                  status: 'settled',
                  paymentMethod: paymentData.paymentMethod || 'Manual',
                  upiId: paymentData.upiId || '',
                  settledAt: new Date().toISOString(),
                }
              : s
          )
        )
      );
      addToast(
        paymentData.paymentMethod === 'UPI'
          ? 'UPI Settlement recorded successfully!'
          : 'Settlement completed successfully!'
      );
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#06B6D4', '#8B5CF6', '#10B981'],
      });
      setTimeout(() => refreshData(), 300);
      return settled;
    } catch (err) {
      addToast(err.message || 'Failed to complete settlement', 'error');
    }
  };

  // Notification Actions
  const handleMarkAsRead = async (id) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => dedupeList(prev.map((n) => (n.id === id ? { ...n, read: true } : n))));
  };

  const handleMarkAllAsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => dedupeList(prev.map((n) => ({ ...n, read: true }))));
    addToast('All notifications marked as read');
  };

  // Auth Actions
  const login = async (email, password) => {
    const res = await api.login(email, password);
    setCurrentUser(res.user);
    setIsAuthenticated(true);
    addToast(`Welcome back, ${res.user.name}!`);
    refreshData();
    return res;
  };

  const register = async (name, email, password, confirmPassword) => {
    const res = await api.register(name, email, password, confirmPassword);
    setCurrentUser(res.user);
    setIsAuthenticated(true);
    addToast(`Account created! Welcome, ${name}!`);
    refreshData();
    return res;
  };

  const logout = () => {
    api.logout();
    setIsAuthenticated(false);
    addToast('Logged out safely');
  };

  const updateProfile = (data) => {
    setCurrentUser((prev) => ({ ...prev, ...data }));
    localStorage.setItem('expenseflow_user_v1', JSON.stringify({ ...currentUser, ...data }));
    addToast('Profile updated successfully!');
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currentUser,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        expenses,
        groups,
        settlements,
        notifications,
        loading,
        refreshData,
        toasts,
        addToast,
        removeToast,
        handleCreateExpense,
        handleUpdateExpense,
        handleDeleteExpense,
        handleCreateGroup,
        handleAddMember,
        handleSettle,
        handleMarkAsRead,
        handleMarkAllAsRead,
        isAddExpenseOpen,
        setIsAddExpenseOpen,
        isCreateGroupOpen,
        setIsCreateGroupOpen,
        activeGroupForExpense,
        setActiveGroupForExpense,
        editingExpense,
        setEditingExpense,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedSplitType,
        setSelectedSplitType,
        wsConnected,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
