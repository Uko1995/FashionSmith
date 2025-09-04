# Vercel Environment Variables Setup

## Required Environment Variables for Vercel Dashboard:

### Go to: https://vercel.com/your-project/settings/environment-variables

### Add these variables:

```
Name: VITE_API_URL
Value: https://fashionsmith.onrender.com
```

### Optional (Not currently used in code, but included in .env):

```
Name: VITE_GOOGLE_CLIENT_ID
Value: 557663242261-t9uk5fu25oue035hhbmb0krsb8jp9gcj.apps.googleusercontent.com

Name: VITE_PAYSTACK_PUBLIC_KEY
Value: pk_live_a68c114a6be2e2d5eecd0a1ed74654a288be9aae
```

**Note:** Your Google OAuth and Paystack implementations are server-side only, so the CLIENT_ID and PAYSTACK_PUBLIC_KEY are not actually used in the frontend code.

### Environment: Production (and Preview if needed)

## After setting environment variables:

1. Redeploy your Vercel project
2. The environment variables will override the .env files during build

## Render Environment Variables:

Your Render backend should automatically pick up the .env file values.
If needed, you can also set them in Render dashboard under Environment.
