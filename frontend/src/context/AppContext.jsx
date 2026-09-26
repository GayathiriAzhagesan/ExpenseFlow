import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, initLocalStore } from '../services/api';
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

  // Core Data States
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

  // Fetch all data
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      initLocalStore();
      const [expData, grpData, stmData, notifData] = await Promise.all([
        api.getExpenses({ search: searchQuery, category: selectedCategory, splitType: selectedSplitType }),
        api.getGroups(),
        api.getSettlements(),
        api.getNotifications(),
      ]);

      setExpenses(expData || []);
      setGroups(grpData || []);
      setSettlements(stmData || []);
      setNotifications(notifData || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedSplitType]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // WebSocket Connection
  useEffect(() => {
    let socket;
    const wsUrl = 'ws://localhost:8080/api/ws';

    const connectWs = () => {
      try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          setWsConnected(true);
          console.log('[WebSocket] Connected to ExpenseFlow real-time hub');
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
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
    };
  }, [addToast, refreshData]);

  // Expense Actions
  const handleCreateExpense = async (expenseData) => {
    try {
      const created = await api.createExpense(expenseData);
      setExpenses((prev) => [created, ...prev]);
      addToast('Expense added successfully!');
      refreshData();
      return created;
    } catch (err) {
      addToast(err.message || 'Failed to add expense', 'error');
      throw err;
    }
  };

  const handleUpdateExpense = async (id, expenseData) => {
    try {
      const updated = await api.updateExpense(id, expenseData);
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
      addToast('Expense updated successfully!');
      refreshData();
      return updated;
    } catch (err) {
      addToast(err.message || 'Failed to update expense', 'error');
      throw err;
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await api.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      addToast('Expense deleted successfully!');
      refreshData();
    } catch (err) {
      addToast(err.message || 'Failed to delete expense', 'error');
    }
  };

  // Group Actions
  const handleCreateGroup = async (groupData) => {
    try {
      const created = await api.createGroup(groupData);
      setGroups((prev) => [created, ...prev]);
      addToast('Group created successfully!');
      refreshData();
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
      );
      addToast(paymentData.paymentMethod === 'UPI' ? 'UPI Settlement recorded successfully!' : 'Settlement completed successfully!');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#06B6D4', '#8B5CF6', '#10B981'],
      });
      refreshData();
      return settled;
    } catch (err) {
      addToast(err.message || 'Failed to complete settlement', 'error');
    }
  };

  // Notification Actions
  const handleMarkAsRead = async (id) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllAsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
