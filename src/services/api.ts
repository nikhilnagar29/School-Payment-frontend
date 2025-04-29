import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the auth token
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

// Response interceptor for handling token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized responses
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (userData: any) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

// Payments API
export const paymentsAPI = {
  createPayment: (paymentData: any) => api.post('/payments/create-payment', paymentData),
  getPaymentLink: (id: string) => api.get(`/payments/${id}`),
  testWebhook: () => api.get('/payments/test-webhook'),
};

// Transactions API
export const transactionsAPI = {
  getAllTransactions: (params: any = {}) => api.get('/transactions', { params }),
  getTransactionById: (id: string) => api.get(`/transactions/${id}`),
  getTransactionsBySchool: (schoolId: string, params: any = {}) => 
    api.get(`/transactions/school/${schoolId}`, { params }),
  getTransactionSummary: () => api.get('/transactions/summary'),
  checkTransactionStatus: (customOrderId: string) => 
    api.get(`/transactions/status/${customOrderId}`),
};

// Users API
export const usersAPI = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, userData: any) => api.put(`/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

export default api; 