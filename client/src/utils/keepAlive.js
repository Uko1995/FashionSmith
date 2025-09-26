const PING_INTERVAL = 13 * 60 * 1000; // 13 minutes in milliseconds
const API_URL = import.meta.env.VITE_API_URL || 'https://fashionsmith.onrender.com';

let pingInterval = null;

const pingServer = async () => {
  try {
    const response = await fetch(`${API_URL}/api/ping`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Server ping successful:', data.timestamp);
    } else {
      console.warn('Server ping failed with status:', response.status);
    }
  } catch (error) {
    console.error('Failed to ping server:', error.message);
  }
};

export const startKeepAlive = () => {
  // Only start keep-alive in production
  if (import.meta.env.PROD) {
    console.log('Starting keep-alive pinging every 13 minutes...');
    
    // Ping immediately
    pingServer();
    
    // Set up interval for subsequent pings
    pingInterval = setInterval(pingServer, PING_INTERVAL);
  } else {
    console.log('Keep-alive disabled in development mode');
  }
};

export const stopKeepAlive = () => {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
    console.log('Keep-alive pinging stopped');
  }
};

// Optional: Add visibility API to pause pinging when tab is not active
const handleVisibilityChange = () => {
  if (document.hidden) {
    stopKeepAlive();
  } else if (import.meta.env.PROD) {
    startKeepAlive();
  }
};

// Listen for visibility changes (optional optimization)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', handleVisibilityChange);
}