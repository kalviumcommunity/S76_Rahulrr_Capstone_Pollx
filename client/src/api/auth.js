import axios from 'axios';

const API_URL = import.meta.env.PROD 
  ? 'https://s76-rahulrr-capstone-pollx.onrender.com'
  : 'http://localhost:5000';

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
  try {
    // Store a timestamp to detect if redirect is taking too long
    localStorage.setItem('google_auth_initiated', Date.now().toString());
    
    // Log for debugging
    console.log('Initiating Google login, redirecting to:', `${API_URL}/auth/google`);
    
    // Redirect to Google auth endpoint
    window.location.href = `${API_URL}/auth/google`;
    
    // Return true if redirection was initiated successfully
    return true;
  } catch (error) {
    console.error('Error initiating Google login:', error);
    // Remove the timestamp if there's an error
    localStorage.removeItem('google_auth_initiated');
    return false;
  }
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
  // Check if we've already processed this auth request to prevent double processing
  const authId = sessionStorage.getItem('last_processed_auth');
  if (authId && authId === queryParams) {
    console.log('Auth already processed, skipping duplicate processing');
    
    // Try to get user data from localStorage to return
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        return { token: 'cached', user: JSON.parse(userData) };
      }
    } catch (e) {
      // If error retrieving from cache, continue with normal flow
    }
  }
  
  // Mark this authentication as processed
  sessionStorage.setItem('last_processed_auth', queryParams);
  console.log('Processing auth success with query params');
  
  // Clear any Google auth initiation flag
  localStorage.removeItem('google_auth_initiated');
  
  try {
    // Parse query parameters
    const params = new URLSearchParams(queryParams);
    const token = params.get('token');
    const userStr = params.get('user');
    
    console.log('Token received:', token ? 'Yes' : 'No');
    console.log('User data received:', userStr ? 'Yes' : 'No');
    
    if (!token || !userStr) {
      console.error('Missing token or user data in authentication response');
      return null;
    }
    
    // Decode and parse the user JSON
    let userObj;
    try {
      userObj = JSON.parse(decodeURIComponent(userStr));
    } catch (jsonErr) {
      console.error('Error parsing decoded user string:', jsonErr);
      try {
        // Try parsing without decoding as a fallback
        userObj = JSON.parse(userStr);
      } catch (err) {
        console.error('Failed to parse user data:', err);
        return null;
      }
    }
    
    if (!userObj || !userObj.id || !userObj.email) {
      console.error('Invalid or incomplete user data');
      return null;
    }
    
    // Store the token with expiration time (24 hours)
    const now = new Date();
    const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    const tokenData = { value: token, expiry: expiry.toISOString() };
    
    // Store auth data
    localStorage.setItem('token', JSON.stringify(tokenData));
    localStorage.setItem('user', JSON.stringify(userObj));
    
    console.log('Authentication data stored successfully');
    return { token, user: userObj };
  } catch (err) {
    console.error('Error processing auth success:', err);
    return null;
  }
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