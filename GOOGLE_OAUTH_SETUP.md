# Google OAuth Setup Guide

## Prerequisites

1. **Google Cloud Console Account**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Required APIs**
   - Enable Google+ API
   - Enable Google OAuth2 API

## Step-by-Step Setup

### 1. Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**
3. Choose **Web application** as application type
4. Configure authorized origins and redirect URIs:

**Authorized JavaScript origins:**
```
http://localhost:5173
https://yourdomain.com
```

**Authorized redirect URIs:**
```
http://localhost:5000/api/auth/google/callback
https://yourdomain.com/api/auth/google/callback
```

5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URL=http://localhost:5000/api/auth/google/callback

# Session Configuration
SESSION_SECRET=your_session_secret_here
```

### 3. Update Google Cloud OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type
3. Fill in app information:
   - **App name:** FashionSmith
   - **User support email:** your-email@gmail.com
   - **Developer contact information:** your-email@gmail.com

4. Add required scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`

5. Add test users (for development)

## Testing the Implementation

### Development Testing

1. **Start the servers:**
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

2. **Test the flow:**
   - Visit `http://localhost:5173/login`
   - Click "Continue with Google"
   - Complete Google authentication
   - Verify redirect to dashboard

### Production Deployment

1. **Update environment variables** with production values
2. **Update Google OAuth credentials** with production URLs
3. **Configure domain verification** in Google Cloud Console
4. **Test production flow**

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch"**
   - Ensure redirect URI in Google Console matches your environment
   - Check for trailing slashes and protocol (http vs https)

2. **"invalid_client"**
   - Verify Client ID and Client Secret are correct
   - Ensure OAuth credentials are for the correct project

3. **Session errors**
   - Check SESSION_SECRET is set
   - Ensure session middleware is properly configured

4. **CORS errors**
   - Verify CLIENT_URL in environment variables
   - Check CORS configuration in server

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=passport-google-oauth2
```

## Security Considerations

1. **HTTPS Required**: Google OAuth requires HTTPS in production
2. **State Parameter**: Automatically handled by Passport.js
3. **Secure Cookies**: HttpOnly, Secure, and SameSite flags enabled
4. **Token Storage**: JWT tokens stored securely in HTTP-only cookies
5. **Input Validation**: All user data validated before storage

## User Data Handling

### Google Profile Data
- **Email**: Used for account linking and communication
- **Name**: Split into firstName and lastName
- **Profile Picture**: Optional, stored as profileImage
- **Google ID**: Unique identifier for OAuth linking

### Account Linking
- Existing users with matching email are automatically linked
- New users are created with Google OAuth as auth provider
- Google accounts are pre-verified (isVerified: true)

## API Endpoints

### Authentication Routes
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Handle OAuth callback
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (protected)

## Next Steps

1. **Test thoroughly** in both development and production
2. **Monitor authentication logs** for any issues
3. **Consider additional OAuth providers** (Facebook, GitHub, etc.)
4. **Implement account linking** for multiple auth providers
5. **Add social login analytics** for user behavior insights

## Support

If you encounter issues:
1. Check the browser console for client-side errors
2. Check server logs for backend errors
3. Verify all environment variables are set correctly
4. Ensure Google Cloud Console configuration is complete

For additional help, refer to:
- [Passport.js Google OAuth Documentation](http://www.passportjs.org/packages/passport-google-oauth20/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
