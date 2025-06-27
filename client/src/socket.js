import { io } from 'socket.io-client';

// Determine the socket server URL based on environment
const SOCKET_URL = import.meta.env.PROD 
  ? 'https://s76-rahulrr-capstone-pollx.onrender.com'
  : 'http://localhost:5000';

// Create socket connection with improved configuration
const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
  maxReconnectionAttempts: 10,
  autoConnect: true
});

// Connection event handlers
socket.on('connect', () => {
  console.log('Socket connected to server:', socket.id);
  
  // Clear any existing heartbeat interval
  if (socket.heartbeatInterval) {
    clearInterval(socket.heartbeatInterval);
  }
  
  // Add a heartbeat to keep connection alive
  socket.heartbeatInterval = setInterval(() => {
    if (socket.connected) {
      socket.emit('heartbeat', { timestamp: new Date() });
    }
  }, 30000);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
  
  // Clear heartbeat interval on disconnect
  if (socket.heartbeatInterval) {
    clearInterval(socket.heartbeatInterval);
    socket.heartbeatInterval = null;
  }
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Socket reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_error', (error) => {
  console.error('Socket reconnection error:', error);
});

socket.on('welcome', (data) => {
  console.log('Welcome message from server:', data);
});

// Debug socket events in development environment
if (import.meta.env.DEV) {
  socket.onAny((event, ...args) => {
    console.log(`[Socket Event] ${event}:`, args);
  });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (socket.heartbeatInterval) {
    clearInterval(socket.heartbeatInterval);
  }
  socket.disconnect();
});

export default socket;
