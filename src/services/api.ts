import axios from 'axios';

// Get the correct backend URL from environment variables
const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create an axios instance
const api = axios.create({
  baseURL: `${backendUrl}`,
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
    // For debugging
    console.log(`[API Response] ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    // Log API errors
    console.error('[API Error]', error.config?.url, error.response?.data || error.message);
    
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
  login: (email: string, password: string) => api.post('/api/auth/login', { email, password }),
  register: (userData: any) => api.post('/api/auth/register', userData),
  getCurrentUser: () => api.get('/api/auth/me'),
};

// Payments API
export const paymentsAPI = {
  createPayment: (paymentData: any) => api.post('/api/payments/create-payment', paymentData),
  getPaymentLink: (id: string) => api.get(`/api/payments/${id}`),
  testWebhook: () => api.get('/api/payments/test-webhook'),
};

// Transactions API
export const transactionsAPI = {
  getAllTransactions: (params: any = {}) => {
    console.log('[API Request] Getting transactions with params:', params);
    return api.get('/api/transactions/test', { params });
  },
  getTransactionById: (id: string) => api.get(`/api/transactions/${id}`),
  getTransactionsBySchool: (schoolId: string, params: any = {}) => 
    api.get(`/api/transactions/school/${schoolId}`, { params }),
  getTransactionSummary: () => {
    console.log('[API Request] Getting transaction summary');
    return api.get('/api/transactions/test/summary');
  },
  checkTransactionStatus: (customOrderId: string) => 
    api.get(`/api/transactions/status/${customOrderId}`),
  
  // Format API response to match our expected format
  formatSummaryResponse: (data: any) => {
    if (!data || !data.stats) {
      return { summary: [], totals: null };
    }
    
    const { stats, totals } = data;
    
    // Convert to our summary format
    const summary = Object.entries(stats).map(([status, data]: [string, any]) => {
      const percentage = totals.transactions > 0 
        ? ((data.count / totals.transactions) * 100).toFixed(2) 
        : '0.00';
      
      return {
        status,
        count: data.count,
        totalAmount: data.amount,
        percentage
      };
    });
    
    // Format totals
    const formattedTotals = {
      totalTransactions: totals.transactions,
      totalAmount: totals.amount,
      successRate: stats.success ? 
        ((stats.success.count / totals.transactions) * 100).toFixed(2) : 
        '0.00'
    };
    
    return { 
      summary, 
      totals: formattedTotals 
    };
  },
  
  // Add mock data method for development/testing
  getMockTransactions: (params: any = {}) => {
    console.log('[MOCK] Using mock transaction data');
    const mockTransactions = [
      {
        _id: 'tx1',
        collect_id: 'col1',
        school_id: 'sch1',
        status: 'success',
        order_amount: 5000,
        transaction_amount: 5000,
        payment_mode: 'UPI',
        payment_time: new Date().toISOString(),
        custom_order_id: 'ORDER-001',
        student_info: {
          names: 'John Doe',
          id: 'ST001',
          email: 'john@example.com'
        }
      },
      {
        _id: 'tx2',
        collect_id: 'col2',
        school_id: 'sch1',
        status: 'pending',
        order_amount: 3000,
        transaction_amount: 0,
        payment_mode: 'Net Banking',
        payment_time: new Date().toISOString(),
        custom_order_id: 'ORDER-002',
        student_info: {
          names: 'Jane Smith',
          id: 'ST002',
          email: 'jane@example.com'
        }
      },
      {
        _id: 'tx3',
        collect_id: 'col3',
        school_id: 'sch2',
        status: 'failed',
        order_amount: 7500,
        transaction_amount: 0,
        payment_mode: 'Card',
        payment_time: new Date().toISOString(),
        custom_order_id: 'ORDER-003',
        student_info: {
          names: 'Robert Johnson',
          id: 'ST003',
          email: 'robert@example.com'
        }
      }
    ];
    
    const mockResponse = {
      data: {
        transactions: mockTransactions,
        pagination: {
          currentPage: params.page || 1,
          totalPages: 1,
          totalRecords: mockTransactions.length
        }
      }
    };
    
    return Promise.resolve(mockResponse);
  },
  
  getMockSummary: () => {
    console.log('[MOCK] Using mock summary data');
    // Match the new API format for consistency
    const mockSummaryData = {
      stats: {
        success: {
          count: 18,
          amount: 438297
        },
        pending: {
          count: 8,
          amount: 203718
        },
        failed: {
          count: 24,
          amount: 707995
        }
      },
      totals: {
        transactions: 50,
        amount: 1350010
      }
    };
    
    return Promise.resolve({ data: mockSummaryData });
  }
};

// Users API
export const usersAPI = {
  getAllUsers: () => api.get('/api/users'),
  getUserById: (id: string) => api.get(`/api/users/${id}`),
  updateUser: (id: string, userData: any) => api.put(`/api/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/api/users/${id}`),
};

// Export helper to determine if we're in development mode
export const isDevelopment = () => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

export default api; 