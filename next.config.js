import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// API Client Class
class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        const message = error.response?.data?.error || error.message || 'An error occurred';
        
        // Handle specific error codes
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          this.clearToken();
          window.location.href = '/login';
        } else if (error.response?.status === 403) {
          toast.error('You do not have permission to perform this action');
        } else if (error.response?.status === 429) {
          toast.error('Too many requests. Please slow down.');
        } else {
          toast.error(message);
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Token management
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Generic request method
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.client.request<any, T>(config);
  }

  // Convenience methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Authentication API
export const authApi = {
  login: (email: string, password: string) => 
    apiClient.post<ApiResponse>('/api/auth/login', { email, password }),
  
  register: (data: {
    email: string;
    password: string;
    name: string;
    role: 'student' | 'instructor' | 'enterprise';
    companyName?: string;
    title?: string;
    department?: string;
  }) => apiClient.post<ApiResponse>('/api/auth/register', data),
  
  web3Login: (data: {
    walletAddress: string;
    signature: string;
    message: string;
    walletType: 'metamask' | 'zkLogin';
  }) => apiClient.post<ApiResponse>('/api/auth/login/web3', data),
  
  connectWallet: (data: {
    walletAddress: string;
    walletType: string;
    signature: string;
    message: string;
  }) => apiClient.post<ApiResponse>('/api/auth/wallet/connect', data),
  
  verifyIAM: (data: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    projectId?: string;
  }) => apiClient.post<ApiResponse>('/api/auth/iam/verify', data),
  
  getProfile: () => apiClient.get<ApiResponse>('/api/auth/profile'),
  
  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse>('/api/auth/refresh', { refreshToken }),
  
  logout: () => apiClient.post<ApiResponse>('/api/auth/logout'),
  
  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse>('/api/auth/forgot-password', { email }),
  
  resetPassword: (token: string, newPassword: string) =>
    apiClient.post<ApiResponse>('/api/auth/reset-password', { token, newPassword }),
};

// Users API
export const usersApi = {
  getUsers: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) => apiClient.get<ApiResponse>('/api/users', { params }),
  
  getUser: (id: string) => apiClient.get<ApiResponse>(`/api/users/${id}`),
  
  updateUser: (id: string, data: any) =>
    apiClient.put<ApiResponse>(`/api/users/${id}`, data),
  
  deleteUser: (id: string) => apiClient.delete<ApiResponse>(`/api/users/${id}`),
  
  updateProfile: (data: any) => apiClient.put<ApiResponse>('/api/users/profile', data),
  
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post<ApiResponse>('/api/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Courses API
export const coursesApi = {
  getCourses: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    level?: string;
    search?: string;
  }) => apiClient.get<ApiResponse>('/api/courses', { params }),
  
  getCourse: (id: string) => apiClient.get<ApiResponse>(`/api/courses/${id}`),
  
  createCourse: (data: any) => apiClient.post<ApiResponse>('/api/courses', data),
  
  updateCourse: (id: string, data: any) =>
    apiClient.put<ApiResponse>(`/api/courses/${id}`, data),
  
  deleteCourse: (id: string) => apiClient.delete<ApiResponse>(`/api/courses/${id}`),
  
  enrollCourse: (courseId: string) =>
    apiClient.post<ApiResponse>(`/api/courses/${courseId}/enroll`),
  
  completeCourse: (courseId: string, score: number) =>
    apiClient.post<ApiResponse>(`/api/courses/${courseId}/complete`, { score }),
  
  getMyCourses: () => apiClient.get<ApiResponse>('/api/courses/my-courses'),
};

// Blockchain API
export const blockchainApi = {
  createBlockchain: (data: {
    name: string;
    network: 'private' | 'public' | 'consortium';
    consensus: 'PoW' | 'PoS' | 'PoA' | 'PBFT';
  }) => apiClient.post<ApiResponse>('/api/blockchain/create', data),
  
  getBlockchains: () => apiClient.get<ApiResponse>('/api/blockchain/list'),
  
  getBlockchain: (id: string) => apiClient.get<ApiResponse>(`/api/blockchain/${id}`),
  
  getBlockchainStats: (id: string) =>
    apiClient.get<ApiResponse>(`/api/blockchain/${id}/stats`),
  
  addBlock: (blockchainId: string, transactions: any[]) =>
    apiClient.post<ApiResponse>(`/api/blockchain/${blockchainId}/blocks`, { transactions }),
  
  deployContract: (blockchainId: string, data: {
    contractType: string;
    name?: string;
    customAbi?: any;
    customBytecode?: string;
  }) => apiClient.post<ApiResponse>(`/api/blockchain/${blockchainId}/contracts`, data),
  
  addTransaction: (blockchainId: string, data: {
    to: string;
    value?: number;
    type: string;
    data?: any;
  }) => apiClient.post<ApiResponse>(`/api/blockchain/${blockchainId}/transactions`, data),
  
  validateBlockchain: (blockchainId: string) =>
    apiClient.post<ApiResponse>(`/api/blockchain/${blockchainId}/validate`),
};

// Talents API (Graph Engine)
export const talentsApi = {
  searchTalents: (data: {
    position?: string;
    requiredSkills?: any[];
    experienceLevel?: string;
    salaryRange?: { min: number; max: number; currency: string };
    remote?: boolean;
    minMatchScore?: number;
    maxResults?: number;
  }) => apiClient.post<ApiResponse>('/api/talents/search', data),
  
  createTalentNeed: (data: any) =>
    apiClient.post<ApiResponse>('/api/talents/needs', data),
  
  getTalentNeeds: () => apiClient.get<ApiResponse>('/api/talents/needs'),
  
  matchTalents: (needId: string) =>
    apiClient.post<ApiResponse>(`/api/talents/needs/${needId}/match`),
  
  getSkillAnalytics: () => apiClient.get<ApiResponse>('/api/talents/skills/analytics'),
  
  getSkillGraph: () => apiClient.get<ApiResponse>('/api/talents/skills/graph'),
  
  getSkillRelationships: (skillId: string) =>
    apiClient.get<ApiResponse>(`/api/talents/skills/${skillId}/relationships`),
};

// Credentials API
export const credentialsApi = {
  getCredentials: () => apiClient.get<ApiResponse>('/api/credentials'),
  
  getCredential: (id: string) => apiClient.get<ApiResponse>(`/api/credentials/${id}`),
  
  issueCredential: (data: {
    courseId: string;
    userId?: string;
    score: number;
    type: 'SBT' | 'NFT' | 'CERTIFICATE';
  }) => apiClient.post<ApiResponse>('/api/credentials/issue', data),
  
  verifyCredential: (id: string) =>
    apiClient.post<ApiResponse>(`/api/credentials/${id}/verify`),
  
  revokeCredential: (id: string, reason: string) =>
    apiClient.post<ApiResponse>(`/api/credentials/${id}/revoke`, { reason }),
  
  transferCredential: (id: string, toAddress: string) =>
    apiClient.post<ApiResponse>(`/api/credentials/${id}/transfer`, { toAddress }),
};

// KYC API
export const kycApi = {
  submitKYC: (data: {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    idNumber: string;
    idType: string;
    documents?: any;
  }) => apiClient.post<ApiResponse>('/api/kyc/submit', data),
  
  getKYCStatus: () => apiClient.get<ApiResponse>('/api/kyc/status'),
  
  uploadDocument: (type: string, file: File) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);
    return apiClient.post<ApiResponse>('/api/kyc/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// WebSocket connection
export const createWebSocketConnection = (token: string) => {
  const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws?token=${token}`);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  return ws;
};

export default apiClient;
