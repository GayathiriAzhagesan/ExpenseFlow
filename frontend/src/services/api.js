import {
  initialExpenses,
  initialGroups,
  initialSettlements,
  initialNotifications,
  initialUsers,
} from '../data/mockData';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Helper to get token
const getAuthHeaders = () => {
  const token = localStorage.getItem('expenseflow_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Generic fetch with error handling and fallback
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Request failed with status ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    // If backend isn't reachable, propagate network error so caller can fallback to local mock
    throw err;
  }
}

// Local storage keys
const STORAGE_KEYS = {
  EXPENSES: 'expenseflow_expenses_v1',
  GROUPS: 'expenseflow_groups_v1',
  SETTLEMENTS: 'expenseflow_settlements_v1',
  NOTIFICATIONS: 'expenseflow_notifications_v1',
  USER: 'expenseflow_user_v1',
};

// Initialize Local Storage if empty
export const initLocalStore = () => {
  if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(initialExpenses));
  }
  if (!localStorage.getItem(STORAGE_KEYS.GROUPS)) {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(initialGroups));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTLEMENTS)) {
    localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(initialSettlements));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(initialUsers[0]));
  }
};

// ======================== API Methods ========================

export const api = {
  // Auth
  async login(email, password) {
    try {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.data?.token) {
        localStorage.setItem('expenseflow_token', res.data.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.data.user));
      }
      return res.data;
    } catch {
      // Local fallback: authenticate Gayathiri or first matching seed user
      const user = initialUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || {
        id: 'u1',
        name: 'Gayathiri',
        email,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gayathiri',
        phone: '+91 98765 43210',
      };
      localStorage.setItem('expenseflow_token', 'mock_jwt_token_local_dev');
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return { token: 'mock_jwt_token_local_dev', user };
    }
  },

  async register(name, email, password, confirmPassword) {
    try {
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });
      if (res.data?.token) {
        localStorage.setItem('expenseflow_token', res.data.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.data.user));
      }
      return res.data;
    } catch {
      const user = {
        id: 'u_' + Date.now(),
        name,
        email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        phone: '',
      };
      localStorage.setItem('expenseflow_token', 'mock_jwt_token_local_dev');
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return { token: 'mock_jwt_token_local_dev', user };
    }
  },

  async getMe() {
    try {
      const res = await request('/auth/me');
      return res.data;
    } catch {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : initialUsers[0];
    }
  },

  logout() {
    localStorage.removeItem('expenseflow_token');
    return Promise.resolve({ success: true });
  },

  // Expenses
  async getExpenses(params = {}) {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`/expenses${query ? `?${query}` : ''}`);
      return res.data;
    } catch {
      initLocalStore();
      let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
      if (params.category && params.category !== 'all') {
        list = list.filter((e) => e.category.toLowerCase() === params.category.toLowerCase());
      }
      if (params.splitType && params.splitType !== 'all') {
        list = list.filter((e) => e.splitType.toLowerCase() === params.splitType.toLowerCase());
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (e) =>
            e.description.toLowerCase().includes(q) ||
            e.paidBy.name.toLowerCase().includes(q) ||
            e.category.toLowerCase().includes(q)
        );
      }
      return list;
    }
  },

  async createExpense(expenseData) {
    try {
      const res = await request('/expenses', {
        method: 'POST',
        body: JSON.stringify(expenseData),
      });
      return res.data;
    } catch {
      initLocalStore();
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
      const newExp = {
        ...expenseData,
        id: 'e_' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      const updated = [newExp, ...list];
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
      return newExp;
    }
  },

  async updateExpense(id, expenseData) {
    try {
      const res = await request(`/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(expenseData),
      });
      return res.data;
    } catch {
      initLocalStore();
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
      const updated = list.map((e) => (e.id === id ? { ...e, ...expenseData, id } : e));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
      return { ...expenseData, id };
    }
  },

  async deleteExpense(id) {
    try {
      const res = await request(`/expenses/${id}`, {
        method: 'DELETE',
      });
      return res.data;
    } catch {
      initLocalStore();
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
      const updated = list.filter((e) => e.id !== id);
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
      return { id };
    }
  },

  // Groups
  async getGroups() {
    try {
      const res = await request('/groups');
      return res.data;
    } catch {
      initLocalStore();
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.GROUPS) || '[]');
    }
  },

  async getGroup(id) {
    try {
      const res = await request(`/groups/${id}`);
      return res.data;
    } catch {
      initLocalStore();
      const groups = JSON.parse(localStorage.getItem(STORAGE_KEYS.GROUPS) || '[]');
      return groups.find((g) => g.id === id) || null;
    }
  },

  async createGroup(groupData) {
    try {
      const res = await request('/groups', {
        method: 'POST',
        body: JSON.stringify(groupData),
      });
      return res.data;
    } catch {
      initLocalStore();
      const groups = JSON.parse(localStorage.getItem(STORAGE_KEYS.GROUPS) || '[]');
      const newGroup = {
        ...groupData,
        id: 'g_' + Date.now(),
        membersCount: groupData.members?.length || 1,
        totalExpenses: 0,
        createdAt: new Date().toISOString(),
      };
      const updated = [newGroup, ...groups];
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(updated));
      return newGroup;
    }
  },

  async addGroupMember(groupId, member) {
    try {
      const res = await request(`/groups/${groupId}/members`, {
        method: 'POST',
        body: JSON.stringify(member),
      });
      return res.data;
    } catch {
      initLocalStore();
      const groups = JSON.parse(localStorage.getItem(STORAGE_KEYS.GROUPS) || '[]');
      const updated = groups.map((g) => {
        if (g.id === groupId) {
          const newM = {
            id: 'u_' + Date.now(),
            name: member.name,
            email: member.email,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name)}`,
            role: 'member',
            netOwe: 0,
          };
          return {
            ...g,
            members: [...(g.members || []), newM],
            membersCount: (g.members?.length || 0) + 1,
          };
        }
        return g;
      });
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(updated));
      return member;
    }
  },

  // Settlements
  async getSettlements() {
    try {
      const res = await request('/settlements');
      return res.data;
    } catch {
      initLocalStore();
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTLEMENTS) || '[]');
    }
  },

  async settle(id, paymentData = {}) {
    try {
      const res = await request(`/settlements/${id}/settle`, {
        method: 'PUT',
        body: JSON.stringify(paymentData),
      });
      return res.data;
    } catch {
      initLocalStore();
      const settlements = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTLEMENTS) || '[]');
      const updated = settlements.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'settled',
              paymentMethod: paymentData.paymentMethod || 'Manual',
              upiId: paymentData.upiId || '',
              settledAt: new Date().toISOString(),
            }
          : s
      );
      localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(updated));
      return updated.find((s) => s.id === id);
    }
  },

  // Analytics
  async getAnalyticsSummary() {
    try {
      const res = await request('/analytics/summary');
      return res.data;
    } catch {
      return {
        totalExpenses: 5400,
        youOwe: 600,
        youAreOwed: 1200,
        settled: 3600,
        recentCount: 5,
      };
    }
  },

  async getMonthlyAnalytics() {
    try {
      const res = await request('/analytics/monthly');
      return res.data;
    } catch {
      return [
        { month: 'Nov', amount: 3200 },
        { month: 'Dec', amount: 4800 },
        { month: 'Jan', amount: 4100 },
        { month: 'Feb', amount: 5200 },
        { month: 'Mar', amount: 5400 },
        { month: 'Apr', amount: 2300 },
      ];
    }
  },

  async getCategoryAnalytics() {
    try {
      const res = await request('/analytics/categories');
      return res.data;
    } catch {
      return [
        { category: 'Food & Dining', amount: 2400, count: 4 },
        { category: 'Entertainment', amount: 1200, count: 2 },
        { category: 'Transportation', amount: 800, count: 2 },
        { category: 'Groceries', amount: 1000, count: 1 },
      ];
    }
  },

  // Notifications
  async getNotifications() {
    try {
      const res = await request('/notifications');
      return res.data;
    } catch {
      initLocalStore();
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    }
  },

  async markNotificationRead(id) {
    try {
      await request(`/notifications/${id}/read`, { method: 'PUT' });
    } catch {
      initLocalStore();
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
      const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    }
  },

  async markAllNotificationsRead() {
    try {
      await request('/notifications/read-all', { method: 'PUT' });
    } catch {
      initLocalStore();
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
      const updated = list.map((n) => ({ ...n, read: true }));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    }
  },
};
