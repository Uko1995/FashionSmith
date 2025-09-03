# Vercel Deployment Environment Variables Setup

## Critical Issue: Infinite Loading Spinner

Your Vercel frontend is showing an infinite loading spinner because the `VITE_API_URL` environment variable is not set, causing authentication initialization to fail.

## Steps to Fix on Vercel:

### 1. Set Environment Variables on Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variable:

```
Name: VITE_API_URL
Value: https://your-render-backend-url.onrender.com
```

**Important:** Replace `your-render-backend-url.onrender.com` with your actual Render backend URL.

### 2. Find Your Render Backend URL

1. Go to your Render dashboard
2. Click on your backend service
3. Copy the URL from the service details (should end with `.onrender.com`)

### 3. Redeploy on Vercel

After setting the environment variable:
1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on the latest deployment
3. Or trigger a new deployment by pushing to your repository

## Verification Steps:

1. Once redeployed, open browser Developer Tools (F12)
2. Go to Console tab
3. Visit your Vercel URL
4. You should see authentication logs indicating successful API connection

## Additional Environment Variables (Optional):

If you're using Google OAuth or Paystack:

```
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_PAYSTACK_PUBLIC_KEY=your-paystack-public-key
```

## Files Modified for Better Error Handling:

- ✅ Added timeout to authentication check (10 seconds)
- ✅ Added fallback URL in axios configuration
- ✅ Added production debugging logs
- ✅ Created Vercel configuration file
- ✅ Added environment variable validation

The infinite loading should be resolved once `VITE_API_URL` is properly set on Vercel.
