# Token Refresh Implementation

This document explains the automatic token refresh system implemented in the FashionSmith application.

## Overview

The application uses JWT tokens with automatic refresh capability to maintain user sessions seamlessly. This prevents users from being logged out unexpectedly and provides a smooth user experience.

## How It Works

### Backend (Server)

- **Access Token**: Short-lived (15 minutes), used for API authentication
- **Refresh Token**: Long-lived (7 days), stored in database and used to generate new access tokens
- **Cookies**: Both tokens are stored in httpOnly cookies for security

### Frontend (Client)

- **Axios Interceptor**: Automatically catches 401 errors and attempts token refresh
- **Background Refresh**: Proactively refreshes tokens every 14 minutes
- **Queue Management**: Queues failed requests during token refresh and retries them

## Key Files

### Frontend

- `src/services/tokenService.js` - Token refresh API calls
- `src/utils/axiosConfig.js` - Axios instance with interceptors
- `src/hooks/useTokenRefresh.js` - React hook for automatic refresh
- `src/services/api.js` - API service layer using configured axios

### Backend

- `controllers/userController.js` - Login, logout, and refresh endpoints
- Cookie configuration for secure token storage

## Usage

### Automatic Usage

The token refresh system works automatically once imported in your App component:

```jsx
import { useTokenRefresh } from "./hooks/useTokenRefresh";

function App() {
  useTokenRefresh(); // This enables automatic token refresh
  return <YourAppContent />;
}
```

### Manual API Calls

Use the configured API services instead of raw axios:

```javascript
import { authAPI, userAPI } from "../services/api";

// Login
const response = await authAPI.login({ email, password });

// Get user profile
const profile = await userAPI.getProfile();
```

## Security Features

1. **httpOnly Cookies**: Tokens stored in httpOnly cookies prevent XSS attacks
2. **Automatic Cleanup**: Failed refresh attempts trigger logout
3. **Queue Management**: Prevents multiple simultaneous refresh attempts
4. **Secure Configuration**: Proper sameSite and secure cookie settings

## Environment Variables

Ensure your `.env` files are properly configured:

### Client (.env)

```
VITE_API_URL=http://localhost:3000
```

### Server (.env)

```
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
NODE_ENV=development
```

## Testing

To test the token refresh functionality:

1. Login to the application
2. Wait 15+ minutes (or manually expire the access token)
3. Make an API call - it should automatically refresh and succeed
4. Check browser network tab to see the refresh endpoint being called

## Troubleshooting

1. **401 Errors Persist**: Check cookie settings and environment variables
2. **Infinite Refresh Loop**: Verify refresh token endpoint returns 401 when invalid
3. **CORS Issues**: Ensure `withCredentials: true` and proper CORS configuration
