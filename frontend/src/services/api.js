import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
};

export const usersAPI = {
  getKids: () => api.get('/users/kids'),
  getMyBalance: () => api.get('/users/me/balance'),
  getTotalBalance: () => api.get('/users/total/balance'),
};

export const tasksAPI = {
  createTask: (taskData) => api.post('/tasks', taskData),
  getTasks: (active = true) => api.get('/tasks', { params: { active } }),
  getTask: (taskId) => api.get(`/tasks/${taskId}`),
  updateTask: (taskId, taskData) => api.put(`/tasks/${taskId}`, taskData),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
};

export const taskInstancesAPI = {
  getMyTasks: () => api.get('/task-instances/my-tasks'),
  submitTask: (instanceId, photoPath) =>
    api.post(`/task-instances/${instanceId}/submit`, { photo_path: photoPath }),
  collect: (instanceId) => api.post(`/task-instances/${instanceId}/collect`),
  getPending: () => api.get('/task-instances/pending'),
  getAll: (kidId = null, statusFilter = null) =>
    api.get('/task-instances/all', { params: { kid_id: kidId, status_filter: statusFilter } }),
  approve: (instanceId) => api.post(`/task-instances/${instanceId}/approve`),
  reject: (instanceId, reason) =>
    api.post(`/task-instances/${instanceId}/reject`, { rejection_reason: reason }),
  createCustom: (taskId, assignedTo, availableStart, availableEnd) =>
    api.post('/task-instances/create', {
      task_id: taskId,
      assigned_to: assignedTo,
      available_start: availableStart,
      available_end: availableEnd,
    }),
  updateInstance: (instanceId, updates) => api.put(`/task-instances/${instanceId}`, updates),
  deleteInstance: (instanceId) => api.delete(`/task-instances/${instanceId}`),
};

export const iconsAPI = {
  uploadIcon: (file) => {
    const formData = new FormData();
    formData.append('icon', file);
    return api.post('/icons/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  listIcons: () => api.get('/icons'),
  getIconUrl: (filename) => `/api/icons/${filename}`,
};

export const photosAPI = {
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post('/photos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getPhotoUrl: (filename) => `/api/photos/${filename}`,
};

// ── Rewards / Launch Bay ──────────────────────────────────────────────────────

export const rewardsAPI = {
  // Kid
  getAvailable: () => api.get('/rewards/available'),
  getPendingClaim: () => api.get('/rewards/pending-claim'),
  purchaseTier: (tierId) => api.post(`/rewards/tiers/${tierId}/purchase`),
  claimCargo: (redemptionId, rewardId) =>
    api.post(`/rewards/redemptions/${redemptionId}/claim`, { reward_id: rewardId }),
  getMyCargo: () => api.get('/rewards/my-cargo'),
  redeemCargo: (redemptionId) => api.post(`/rewards/redemptions/${redemptionId}/redeem`),

  // Parent — tiers
  getTiers: () => api.get('/rewards/tiers'),
  createTier: (data) => api.post('/rewards/tiers', data),
  updateTier: (tierId, data) => api.put(`/rewards/tiers/${tierId}`, data),
  deactivateTier: (tierId) => api.delete(`/rewards/tiers/${tierId}`),

  // Parent — cargo items
  getItems: () => api.get('/rewards/items'),
  createItem: (data) => api.post('/rewards/items', data),
  updateItem: (itemId, data) => api.put(`/rewards/items/${itemId}`, data),
  deactivateItem: (itemId) => api.delete(`/rewards/items/${itemId}`),

  // Parent — redemptions
  getRedemptions: (statusFilter = null) =>
    api.get('/rewards/redemptions', { params: statusFilter ? { status_filter: statusFilter } : {} }),
  fulfill: (redemptionId) => api.post(`/rewards/redemptions/${redemptionId}/fulfill`),
  returnToCargo: (redemptionId) => api.post(`/rewards/redemptions/${redemptionId}/return`),
  cancel: (redemptionId) => api.post(`/rewards/redemptions/${redemptionId}/cancel`),
};

export default api;
