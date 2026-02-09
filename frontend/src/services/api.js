import axios from 'axios';

const API_BASE_URL = '/api';

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
};

export default api;
