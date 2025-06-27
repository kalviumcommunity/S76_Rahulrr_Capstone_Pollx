import { io } from 'socket.io-client';

// Determine the socket server URL based on environment
const SOCKET_URL = import.meta.env.PROD 
  ? 'https://s76-rahulrr-capstone-pollx.onrender.com'
  : 'http://localhost:5000';

// Create socket connection with auto-reconnection
const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
  maxReconnectionAttempts: 10
});

// Connection event handlers
socket.on('connect', () => {
  console.log('Socket connected to server:', socket.id);
  
  // Add a heartbeat to keep connection alive
  if (socket.heartbeatInterval) clearInterval(socket.heartbeatInterval);
  socket.heartbeatInterval = setInterval(() => {
    if (socket.connected) {
      socket.emit('heartbeat', { timestamp: new Date() });
    }
  }, 30000);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected from server:', reason);
  // Clear heartbeat interval on disconnect
  if (socket.heartbeatInterval) clearInterval(socket.heartbeatInterval);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Socket reconnected to server after', attemptNumber, 'attempts');
});

socket.on('reconnect_error', (error) => {
  console.error('Socket reconnection error:', error);
});

socket.on('welcome', (data) => {
  console.log('Received welcome from server:', data);
});

// Debug socket events in development environment
if (import.meta.env.DEV) {
  socket.onAny((event, ...args) => {
    console.log(`[Socket Event] ${event}:`, args);
  });
}

export default socket;
