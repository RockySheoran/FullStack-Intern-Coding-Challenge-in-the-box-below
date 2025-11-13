import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
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

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        console.error('API request failed:', error);
        
        if (error.response) {
          // Server responded with error status
          const message = error.response.data?.message || `HTTP error! status: ${error.response.status}`;
          throw new Error(message);
        } else if (error.request) {
          // Request was made but no response received
          throw new Error('Network error - please check your connection');
        } else {
          // Something else happened
          throw new Error(error.message || 'An unexpected error occurred');
        }
      }
    );
  }

  async get(endpoint, params = {}) {
    return this.api.get(endpoint, { params });
  }

  async post(endpoint, data) {
    return this.api.post(endpoint, data);
  }

  async put(endpoint, data) {
    return this.api.put(endpoint, data);
  }

  async delete(endpoint) {
    return this.api.delete(endpoint);
  }

  async login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  async register(userData) {
    return this.post('/auth/register', userData);
  }

  async updatePassword(currentPassword, newPassword) {
    return this.put('/auth/password', { currentPassword, newPassword });
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async getMe() {
    return this.get('/auth/me');
  }

  async getStores(params = {}) {
    return this.get('/stores', params);
  }

  async getStore(id) {
    return this.get(`/stores/${id}`);
  }

  async createStore(storeData) {
    return this.post('/stores', storeData);
  }

  async updateStore(id, storeData) {
    return this.put(`/stores/${id}`, storeData);
  }

  async deleteStore(id) {
    return this.delete(`/stores/${id}`);
  }

  async submitRating(storeId, rating) {
    return this.post('/ratings', { store_id: storeId, rating });
  }

  async updateRating(ratingId, rating) {
    return this.put(`/ratings/${ratingId}`, { rating });
  }

  async deleteRating(ratingId) {
    return this.delete(`/ratings/${ratingId}`);
  }

  async getUserRatings(userId, params = {}) {
    return this.get(`/ratings/user/${userId}`, params);
  }

  async getStoreRatings(storeId, params = {}) {
    return this.get(`/ratings/store/${storeId}`, params);
  }

  async getMyRatings(limit) {
    const params = limit ? { limit } : {};
    return this.get('/ratings/my-ratings', params);
  }

  async getStoreOwnerSummary() {
    return this.get('/ratings/my-store/summary');
  }

  async getAdminDashboard() {
    return this.get('/admin/dashboard');
  }

  async getUsers(params = {}) {
    return this.get('/admin/users', params);
  }

  async getUser(id) {
    return this.get(`/admin/users/${id}`);
  }

  async createUser(userData) {
    return this.post('/admin/users', userData);
  }

  async updateUser(id, userData) {
    return this.put(`/admin/users/${id}`, userData);
  }

  async deleteUser(id) {
    return this.delete(`/admin/users/${id}`);
  }
}

const apiService = new ApiService();
export default apiService;