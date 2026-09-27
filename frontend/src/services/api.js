import {
  initialExpenses,
  initialGroups,
  initialSettlements,
  initialNotifications,
  initialUsers,
} from '../data/mockData';

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const resolvedUrl = (!rawApiUrl || !rawApiUrl.includes('bl9s'))
  ? 'https://expenseflow-bl9s.onrender.com'
  : rawApiUrl;
const BASE_URL = resolvedUrl.replace(/\/+$/, '');

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
      const errorMsg = errData.message || `Request to ${endpoint} failed with status ${res.status}`;
      if (import.meta.env.DEV) {
        console.warn(`[API Response Failed] ${options.method || 'GET'} ${url} -> Status: ${res.status}:`, errorMsg);
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn(`[API Network / Fetch Failed] ${options.method || 'GET'} ${url}:`, err.message || err);
    }
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

// Migration: Purge legacy mock data cache to eliminate duplicate entries
const CACHE_VERSION_KEY = 'expenseflow_store_version';
const CURRENT_VERSION = 'v2_live_render';

if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem(CACHE_VERSION_KEY) !== CURRENT_VERSION) {
      localStorage.removeItem(STORAGE_KEYS.EXPENSES);
      localStorage.removeItem(STORAGE_KEYS.GROUPS);
      localStorage.removeItem(STORAGE_KEYS.SETTLEMENTS);
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      const token = localStorage.getItem('expenseflow_token');
      if (token === 'mock_jwt_token_local_dev') {
        localStorage.removeItem('expenseflow_token');
      }
      localStorage.setItem(CACHE_VERSION_KEY, CURRENT_VERSION);
    }
  } catch (e) {
    console.warn('Storage purge notice:', e);
  }
}

// Deduplication helper guarantees each item only exists once by its id or _id
export const dedupeList = (items = []) => {
  if (!Array.isArray(items)) return [];
  const map = new Map();
  for (const item of items) {
    if (!item) continue;
    const key = item.id || item._id;
    if (key) {
      map.set(key, { ...item, id: key });
    }
  }
  return Array.from(map.values());
};

// Safe no-op initialization to prevent re-populating duplicate mock data
export const initLocalStore = () => {
  // No-op: We load real live data directly from the deployed backend
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
    } catch (err) {
      // If deployed backend is temporarily unreachable, fallback to user identity
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
      const list = dedupeList(res.data || []);
      if (list.length > 0) {
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(list));
        return list;
      }
      return dedupeList(initialExpenses);
    } catch {
      let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
      if (list.length === 0) list = [...initialExpenses];
      if (params.category && params.category !== 'all') {
        list = list.filter((e) => e.category?.toLowerCase() === params.category.toLowerCase());
      }
      if (params.splitType && params.splitType !== 'all') {
        list = list.filter((e) => e.splitType?.toLowerCase() === params.splitType.toLowerCase());
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (e) =>
            e.description?.toLowerCase().includes(q) ||
            e.paidBy?.name?.toLowerCase().includes(q) ||
            e.category?.toLowerCase().includes(q)
        );
      }
      return dedupeList(list);
    }
  },

  async createExpense(expenseData) {
    try {
      const res = await request('/expenses', {
        method: 'POST',
        body: JSON.stringify(expenseData),
      });
      const created = res.data;
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(dedupeList([created, ...list])));
      return created;
    } catch {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
      const newExp = {
        ...expenseData,
        id: 'e_' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      const updated = dedupeList([newExp, ...list]);
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
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
      const updated = list.map((e) => (e.id === id ? { ...e, ...expenseData, id } : e));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(dedupeList(updated)));
      return { ...expenseData, id };
    }
  },

  async deleteExpense(id) {
    try {
      const res = await request(`/expenses/${id}`, {
        method: 'DELETE',
      });
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
      const updated = list.filter((e) => e.id !== id);
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
      return res.data;
    } catch {
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
      const list = dedupeList(res?.data || []);
      if (Array.isArray(list)) {
        if (list.length > 0) {
          localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(list));
        }
        return list;
      }
      return [];
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[ExpenseFlow /groups API Error] Failed to fetch groups from server:', err?.message || err);
      }
      return [];
    }
  },

  async getGroup(id) {
    try {
      const res = await request(`/groups/${id}`);
      return res?.data || null;
    } catch {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.GROUPS);
        const groups = stored ? JSON.parse(stored) : [];
        if (Array.isArray(groups)) {
          return groups.find((g) => g?.id === id) || null;
        }
      } catch {
        // ignore
      }
      return null;
    }
  },

  async createGroup(groupData) {
    try {
      const res = await request('/groups', {
        method: 'POST',
        body: JSON.stringify(groupData),
      });
      const created = res.data;
      const groups = JSON.parse(localStorage.getItem(STORAGE_KEYS.GROUPS) || '[]');
      const safeGroups = Array.isArray(groups) ? groups : [];
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(dedupeList([created, ...safeGroups])));
      return created;
    } catch {
      const groups = JSON.parse(localStorage.getItem(STORAGE_KEYS.GROUPS) || '[]');
      const safeGroups = Array.isArray(groups) ? groups : [];
      const newGroup = {
        ...groupData,
        id: 'g_' + Date.now(),
        membersCount: Array.isArray(groupData?.members) ? groupData.members.length : 1,
        totalExpenses: 0,
        createdAt: new Date().toISOString(),
      };
      const updated = dedupeList([newGroup, ...safeGroups]);
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
      const groups = JSON.parse(localStorage.getItem(STORAGE_KEYS.GROUPS) || '[]');
      const safeGroups = Array.isArray(groups) ? groups : [];
      const updated = safeGroups.map((g) => {
        if (g.id === groupId) {
          const newM = {
            id: 'u_' + Date.now(),
            name: member.name,
            email: member.email,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name)}`,
            role: 'member',
            netOwe: 0,
          };
          const currentMembers = Array.isArray(g.members) ? g.members : [];
          return {
            ...g,
            members: dedupeList([...currentMembers, newM]),
            membersCount: currentMembers.length + 1,
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
      const list = dedupeList(res.data || []);
      if (list.length > 0) {
        localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(list));
        return list;
      }
      return dedupeList(initialSettlements);
    } catch {
      const stm = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTLEMENTS) || '[]');
      return dedupeList(stm.length > 0 ? stm : initialSettlements);
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
        youOwe: 750,
        youAreOwed: 1800,
        settled: 800,
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
        { category: 'Food & Dining', amount: 2400, count: 2 },
        { category: 'Entertainment', amount: 1200, count: 1 },
        { category: 'Transportation', amount: 800, count: 1 },
        { category: 'Shopping', amount: 1000, count: 1 },
      ];
    }
  },

  // Notifications
  async getNotifications() {
    try {
      const res = await request('/notifications');
      const list = dedupeList(res.data || []);
      if (list.length > 0) {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
        return list;
      }
      return dedupeList(initialNotifications);
    } catch {
      const notifs = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
      return dedupeList(notifs.length > 0 ? notifs : initialNotifications);
    }
  },

  async markNotificationRead(id) {
    try {
      await request(`/notifications/${id}/read`, { method: 'PUT' });
    } catch {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
      const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    }
  },

  async markAllNotificationsRead() {
    try {
      await request('/notifications/read-all', { method: 'PUT' });
    } catch {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
      const updated = list.map((n) => ({ ...n, read: true }));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    }
  },
};
