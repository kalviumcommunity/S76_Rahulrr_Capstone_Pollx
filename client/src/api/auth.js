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
      let token;
      try {
        // Try to parse as JSON first (new format)
        const parsed = JSON.parse(tokenData);
        token = parsed.value || parsed.token;
      } catch {
        // If parsing fails, treat as plain string (old format)
        token = tokenData;
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
    
    // Store the token directly (server handles expiration)
    const token = response.data.token;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    // Store the token directly (server handles expiration)
    const token = response.data.token;
    
    localStorage.setItem('token', token);
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
    
    // Get the backend URL based on environment
    const backendURL = import.meta.env.PROD 
      ? 'https://s76-rahulrr-capstone-pollx.onrender.com'
      : 'http://localhost:5000';
    
    // Log for debugging
    console.log('Initiating Google login, redirecting to:', `${backendURL}/auth/google`);
    
    // Redirect to Google auth endpoint
    window.location.href = `${backendURL}/auth/google`;
    
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
    // Only handle authentication errors from specific endpoints
    if (error?.response?.status === 401) {
      const errorMessage = error?.response?.data?.error || '';
      
      // Only clear auth data if it's explicitly an invalid token error
      if (errorMessage.includes('Invalid token') || errorMessage.includes('token')) {
        console.log('Token invalid, clearing auth data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          window.location.href = '/login?session=expired';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: error.message || 'Network error' };
  }
};

export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    // Simple check - if both token and user data exist, consider authenticated
    // Let the server handle token validation
    return !!(token && userData);
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
    
    // Store auth data directly (no client-side expiry)
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userObj));
    
    console.log('Authentication data stored successfully');
    return { token, user: userObj };
  } catch (err) {
    console.error('Error processing auth success:', err);
    return null;
  }
};

// Check if token is expired (simplified)
export const isTokenExpired = () => {
  const token = localStorage.getItem('token');
  return !token; // Simply check if token exists
};

// Function to refresh token if close to expiry
export const refreshTokenIfNeeded = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Only verify with server if we haven't checked recently
    const lastCheck = localStorage.getItem('last_token_check');
    const now = Date.now();
    
    // Check every 5 minutes max to reduce server calls
    if (lastCheck && now - parseInt(lastCheck) < 5 * 60 * 1000) {
      return true; // Assume valid if checked recently
    }
    
    // Verify with server
    const response = await api.get('/auth/verify-token');
    localStorage.setItem('last_token_check', now.toString());
    
    return response.status === 200;
  } catch (error) {
    // If verification fails, clear the check timestamp
    localStorage.removeItem('last_token_check');
    return false;
  }
};