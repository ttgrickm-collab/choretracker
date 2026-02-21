import axios from 'axios';

const API_BASE_URL = 'http://10.0.0.42:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (redirect to login)
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

// Auth API
export const authAPI = {
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
};

// Users API
export const usersAPI = {
  getKids: () => api.get('/users/kids'),
  
  getMyBalance: () => api.get('/users/me/balance'),
  
  getTotalBalance: () => api.get('/users/total/balance'),
};

// Tasks API
export const tasksAPI = {
  createTask: (taskData) => 
    api.post('/tasks', taskData),
  
  getTasks: (active = true) => 
    api.get('/tasks', { params: { active } }),
  
  getTask: (taskId) => 
    api.get(`/tasks/${taskId}`),
  
  updateTask: (taskId, taskData) => 
    api.put(`/tasks/${taskId}`, taskData),
  
  deleteTask: (taskId) => 
    api.delete(`/tasks/${taskId}`),
};

// Task Instances API
export const taskInstancesAPI = {
  // Kid endpoints
  getMyTasks: () => 
    api.get('/task-instances/my-tasks'),
  
  submitTask: (instanceId, photoPath) => 
    api.post(`/task-instances/${instanceId}/submit`, { photo_path: photoPath }),
  
  collect: (instanceId) =>
    api.post(`/task-instances/${instanceId}/collect`),
  
  // Parent endpoints
  getPending: () => 
    api.get('/task-instances/pending'),
  
  getAll: (kidId = null, statusFilter = null) => 
    api.get('/task-instances/all', { params: { kid_id: kidId, status_filter: statusFilter } }),
  
  approve: (instanceId) => 
    api.post(`/task-instances/${instanceId}/approve`),
  
  reject: (instanceId, reason) => 
    api.post(`/task-instances/${instanceId}/reject`, { rejection_reason: reason }),
  
  createCustom: (taskId, assignedTo, availableStart, availableEnd) => 
    api.post('/task-instances/create', {
      task_id: taskId,
      assigned_to: assignedTo,
      available_start: availableStart,
      available_end: availableEnd
    }),
  
  updateInstance: (instanceId, updates) => 
    api.put(`/task-instances/${instanceId}`, updates),
  
  deleteInstance: (instanceId) => 
    api.delete(`/task-instances/${instanceId}`),
};

// Icons API
export const iconsAPI = {
  uploadIcon: (file) => {
    const formData = new FormData();
    formData.append('icon', file);
    return api.post('/icons/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  listIcons: () => 
    api.get('/icons'),
  
  getIconUrl: (filename) => 
    `/api/icons/${filename}`,
};

// Photos API
export const photosAPI = {
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post('/photos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  getPhotoUrl: (filename) => 
    `/api/photos/${filename}`,
};

export default api;
