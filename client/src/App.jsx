import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import AuthSuccessPage from './pages/AuthSuccessPage';
import PollsPage from './pages/PollsPage';
import MyPollsPage from './pages/MyPollsPage';
import CreatePollPage from './pages/CreatePollPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { isAuthenticated } from './api/auth';

function App() {
  // Check authentication status when the app loads
  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = isAuthenticated();
      console.log('Auth status:', authStatus ? 'Authenticated' : 'Not authenticated');
    };
    
    checkAuth();
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/polls" element={<PollsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth-success" element={<AuthSuccessPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-polls" 
              element={
                <ProtectedRoute>
                  <MyPollsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-poll" 
              element={
                <ProtectedRoute>
                  <CreatePollPage />
                </ProtectedRoute>
              } 
            />
            {/* Add more routes as needed */}
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
