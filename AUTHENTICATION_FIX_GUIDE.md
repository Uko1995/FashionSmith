# 🚀 FashionSmith Authentication Fix Guide

## 🔧 Issues Identified & Fixed

### 1. Cookie Configuration Issues (FIXED)
**Problem**: `sameSite: 'strict'` was too restrictive for cross-domain deployments
**Solution**: Updated to use `sameSite: 'none'` in production, `'lax'` in development

### 2. Google OAuth Redirect URL (FIXED)
**Problem**: Hardcoded localhost URL in Google OAuth callback
**Solution**: Updated to use dynamic SERVER_URL environment variable

### 3. CORS Configuration (IMPROVED)
**Problem**: CORS not properly configured for production domains
**Solution**: Updated CORS to be stricter in production, more permissive in development

## 🔧 Required Environment Variables

### **Server (.env)**
```bash
# General
NODE_ENV=production
SERVER_URL=https://your-render-backend-url.onrender.com
CLIENT_URL=https://your-vercel-app.vercel.app

# Database
MONGO_URI=mongodb+srv://your-production-db-connection

# JWT Secrets
ACCESS_TOKEN_SECRET=your-secure-access-token-secret-min-32-chars
REFRESH_TOKEN_SECRET=your-secure-refresh-token-secret-min-32-chars

# Email
EMAIL=your-production-email@domain.com
EMAIL_PASSWORD=your-email-app-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_REDIRECT_URL=https://your-render-backend-url.onrender.com/api/auth/google/callback
```

### **Client (.env)**
```bash
VITE_API_URL=https://your-render-backend-url.onrender.com
```

## 📋 Google OAuth Console Configuration

### 1. Update Authorized JavaScript Origins
Add these to your Google Console → Credentials → OAuth 2.0 Client IDs:
```
https://your-vercel-app.vercel.app
https://your-render-backend-url.onrender.com
```

### 2. Update Authorized Redirect URIs
Add this to your Google Console:
```
https://your-render-backend-url.onrender.com/api/auth/google/callback
```

### 3. Update Domain Verification
Make sure your production domains are verified in Google Console

## 🛠️ Render Deployment Settings

### Environment Variables to Set:
1. Go to Render Dashboard → Your Service → Environment
2. Add all the server environment variables listed above
3. Make sure `NODE_ENV=production` is set

### Build & Deploy Settings:
```bash
# Build Command
npm install

# Start Command  
npm start
```

## 🛠️ Vercel Deployment Settings

### Environment Variables to Set:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `VITE_API_URL=https://your-render-backend-url.onrender.com`

### Build Settings:
```bash
# Framework Preset: Vite
# Build Command: npm run build
# Output Directory: dist
# Install Command: npm install
```

## 🔍 Testing Authentication

### 1. Test Regular Login
```bash
# Should work after fixing cookie settings
POST /api/users/login
{
  "email": "test@example.com",
  "password": "password"
}
```

### 2. Test Google OAuth
```bash
# Should redirect properly to production URLs
GET /api/auth/google
```

### 3. Test Protected Routes
```bash
# Should maintain authentication after login
GET /api/users/profile
```

## 🐛 Debugging Steps

### 1. Check Browser Network Tab
- Look for CORS errors
- Check if cookies are being set
- Verify API calls are going to production URLs

### 2. Check Browser Application Tab
- Verify cookies are present with correct domain
- Check if `jwt` cookie has `HttpOnly` flag
- Verify `sameSite` is set to `None` in production

### 3. Check Server Logs
- Look for CORS rejection messages
- Check JWT verification errors
- Monitor authentication flow logs

## ⚠️ Common Issues & Solutions

### Issue 1: "Access token required" on protected routes
**Cause**: Cookies not being sent cross-domain
**Solution**: Ensure `withCredentials: true` in axios and `sameSite: 'none'` in cookies

### Issue 2: Google OAuth redirects to localhost
**Cause**: Hardcoded localhost URLs
**Solution**: Update environment variables and Google Console settings

### Issue 3: CORS errors in production
**Cause**: Production domain not in CORS allowlist
**Solution**: Update CORS configuration with production URLs

### Issue 4: Authentication works but user gets logged out immediately
**Cause**: Cookie domain/security settings
**Solution**: Update cookie settings for production environment

## 🔄 Deployment Checklist

### Before Deploying:
- [ ] Update environment variables on both platforms
- [ ] Update Google OAuth Console settings
- [ ] Test locally with production environment variables
- [ ] Verify CORS configuration includes production URLs

### After Deploying:
- [ ] Test regular email/password login
- [ ] Test Google OAuth login
- [ ] Test accessing protected routes
- [ ] Verify cookies are being set correctly
- [ ] Check browser console for errors

### If Issues Persist:
1. Check browser network tab for failed requests
2. Verify environment variables are loaded correctly
3. Test API endpoints directly using Postman/curl
4. Check server logs for authentication errors
5. Ensure Google OAuth settings match your production URLs

---

**Next Steps**: Update your environment variables on both Render and Vercel, then redeploy both applications.
