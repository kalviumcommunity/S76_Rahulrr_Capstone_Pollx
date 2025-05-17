import axios from 'axios';

const API_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true // Important for cookies/sessions
});

// Add a request interceptor to add the token to all requests
api.interceptors.request.use(config => {
  try {
    const tokenData = localStorage.getItem('token');
    if (tokenData) {
      const { value, expiry } = JSON.parse(tokenData);
      const now = new Date();
      const expiryDate = new Date(expiry);
      
      // Check if token is valid and not expired
      if (value && now < expiryDate) {
        config.headers.Authorization = `Bearer ${value}`;
      } else {
        // Token expired, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // You might want to redirect to login page here
        // but that's typically handled by response interceptor
      }
    }
    return config;
  } catch (err) {
    console.error('Error processing auth token:', err);
    return config;
  }
});

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/signup', userData);
    
    // Store the token with expiration time (24 hours)
    const now = new Date();
    const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    
    const tokenData = {
      value: response.data.token,
      expiry: expiry.toISOString()
    };
    
    localStorage.setItem('token', JSON.stringify(tokenData));
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    // Store the token with expiration time (24 hours)
    const now = new Date();
    const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    
    const tokenData = {
      value: response.data.token,
      expiry: expiry.toISOString()
    };
    
    localStorage.setItem('token', JSON.stringify(tokenData));
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

export const googleLogin = () => {
  window.location.href = `${API_URL}/auth/google`;
};

export const logout = async () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Logout error:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized or 403 Forbidden responses
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      console.log('Authentication error:', error.response.data);
      
      // Clear user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?session=expired';
      }
    }
    
    return Promise.reject(error);
  }
);

export const getCurrentUser = async () => {
  try {
    // First check if token is expired
    if (isTokenExpired()) {
      throw new Error('Token expired');
    }
    
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: error.message || 'Network error' };
  }
};

export const isAuthenticated = () => {
  try {
    const tokenData = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!tokenData || !userData) {
      return false;
    }
    
    const { value, expiry } = JSON.parse(tokenData);
    const now = new Date();
    const expiryDate = new Date(expiry);
    
    // Check if token is valid and not expired
    return value && now < expiryDate;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

// Verify token validity with server
export const verifyTokenWithServer = async () => {
  try {
    // First check local expiration
    if (!isAuthenticated()) {
      return false;
    }
    
    // Then verify with server
    const response = await api.get('/auth/verify-token');
    return response.status === 200;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

// Handle the token from Google OAuth redirect
export const handleAuthSuccess = (queryParams) => {
  const params = new URLSearchParams(queryParams);
  const token = params.get('token');
  const userStr = params.get('user');
  
  if (token && userStr) {
    try {
      const userObj = JSON.parse(decodeURIComponent(userStr));
      
      // Store the token with expiration time (24 hours)
      const now = new Date();
      const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      
      const tokenData = {
        value: token,
        expiry: expiry.toISOString()
      };
      
      localStorage.setItem('token', JSON.stringify(tokenData));
      localStorage.setItem('user', JSON.stringify(userObj));
      
      return { token, user: userObj };
    } catch (err) {
      console.error('Error parsing user data:', err);
      return null;
    }
  }
  return null;
};

// Check if token is expired
export const isTokenExpired = () => {
  const tokenData = localStorage.getItem('token');
  
  if (!tokenData) return true;
  
  try {
    const { value, expiry } = JSON.parse(tokenData);
    const now = new Date();
    const expiryDate = new Date(expiry);
    
    return !value || now >= expiryDate;
  } catch (err) {
    console.error('Error checking token expiration:', err);
    return true;
  }
};