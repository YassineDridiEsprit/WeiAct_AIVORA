import axios from 'axios';

console.log('api.ts loaded');
console.log('API baseURL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api');

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  withCredentials: true,
});

// Request interceptor: skip Authorization for register
api.interceptors.request.use((config) => {
  console.log('Request URL:', config.url ?? 'No URL defined'); // Use nullish coalescing
  if (config.url && config.url.includes('/users/register')) {
    return config; // Skip Authorization header
  }
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('Response error:', {
      data: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message
    }); // Improved logging
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem('refresh_token')
    ) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/users/token/refresh`,
          { refresh }
        );
        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; first_name: string; last_name: string; password: string; role?: 'farmer' | 'transporter' | 'pressing' | 'onh'; metamask_address?: string }) =>
    api.post('/users/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/users/login', data),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: { first_name?: string; last_name?: string }) =>
    api.put('/users/profile', data),
  forgotPassword: (data: { email: string }) =>
    api.post('/users/forgot-password', data),
  resetPassword: (data: { email: string; new_password: string; confirm_password: string }) =>
    api.post('/users/reset-password', data),
};

// Farm API
export const farmAPI = {
  getParcels: () => api.get('/farm/parcels'),
  getParcel: (id: number) => api.get(`/farm/parcels/${id}`),
  createParcel: (data: { name: string; culture?: string; soil_type?: string; boundary: { coordinates: number[][][] } }) =>
    api.post('/farm/parcels', data),
  updateParcel: (id: number, data: any) => api.put(`/farm/parcels/${id}`, data),
  deleteParcel: (id: number) => api.delete(`/farm/parcels/${id}`),
  getEquipment: () => api.get('/farm/equipment'),
  createEquipment: (data: { name: string; equipment_type: string; hourly_cost: number }) =>
    api.post('/farm/equipment', data),
  updateEquipment: (id: number, data: any) => api.put(`/farm/equipment/${id}`, data),
  deleteEquipment: (id: number) => api.delete(`/farm/equipment/${id}`),
  getPersonnel: () => api.get('/farm/personnel'),
  createPersonnel: (data: { name: string; role: string; hourly_rate: number }) =>
    api.post('/farm/personnel', data),
  updatePersonnel: (id: number, data: any) => api.put(`/farm/personnel/${id}`, data),
  deletePersonnel: (id: number) => api.delete(`/farm/personnel/${id}`),
  getInputs: () => api.get('/farm/inputs'),
  getLowStockInputs: () => api.get('/farm/inputs/low-stock'),
  createInput: (data: { name: string; input_type: string; unit: string; unit_price: number; current_stock?: number; minimum_stock_alert?: number }) =>
    api.post('/farm/inputs', data),
  updateInput: (id: number, data: any) => api.put(`/farm/inputs/${id}`, data),
  deleteInput: (id: number) => api.delete(`/farm/inputs/${id}`),
  getOperations: () => api.get('/farm/operations'),
  getOperation: (id: number) => api.get(`/farm/operations/${id}`),
  getCalendarOperations: (params?: { start?: string; end?: string; parcel?: string; type?: string }) =>
    api.get('/farm/operations/calendar', { params }),
  createOperation: (data: {
    operation_type: string;
    parcel_ids?: number[];
    personnel_ids?: Array<{ id: number; daily_hours: number }>;
    equipment_ids?: Array<{ id: number; total_hours: number }>;
    input_ids?: Array<{ id: number; quantity: number }>;
    start_date: string;
    end_date: string;
    notes?: string;
  }) => api.post('/farm/operations', data),
  updateOperation: (id: number, data: any) => api.put(`/farm/operations/${id}`, data),
  deleteOperation: (id: number) => api.delete(`/farm/operations/${id}`),
};

// News API
export const newsAPI = {
  getNews: () => api.get('/news'),
  getNewsItem: (id: number) => api.get(`/news/${id}`),
};

export default api;