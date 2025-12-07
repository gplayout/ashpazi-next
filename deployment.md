# Deployment Guide (Vercel)

This application is optimized for Vercel. Follow these steps to deploy.

## 1. Environment Variables
You must configure the following Environment Variables in your Vercel Project Settings:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key. |
| `NEXT_PUBLIC_BASE_URL` | The URL of your Vercel deployment (e.g., `https://zaffaron.vercel.app`). **Important for Auth Redirects**. |

> **Note**: `NEXT_PUBLIC_BASE_URL` is used for Google Auth redirects. Update this after your first deployment generates a URL.

## 2. Deploy via CLI
1.  Open Terminal.
2.  Run: `npx vercel`
3.  Follow the prompts (Log in -> Link to existing project? No -> Link to new project? Yes).
4.  Override build command? No (Default `next build` is fine).

## 3. Deploy via Dashboard (Git)
1.  Push your code to GitHub.
2.  Import the repository in Vercel.
3.  Add the Environment Variables.
4.  Click **Deploy**.

## 4. Google OAuth Setup (Detailed)
To get your **Client ID** and **Client Secret**, follow these steps:

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project (or select an existing one).
3.  Go to **APIs & Services** > **OAuth consent screen**.
    -  Select **External**.
    -  Fill in App Name ("Zaffaron"), email, etc.
    -  Click **Save and Continue** (you can skip Scopes/Test Users for now).
4.  Go to **APIs & Services** > **Credentials**.
5.  Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
6.  **Application type**: Select `Web application`.
7.  **Name**: "Zaffaron Web".
8.  **Authorized redirect URIs**:
    -  Paste your Supabase Callback URL here.
    -  It looks like: `https://[YOUR-SUPABASE-ID].supabase.co/auth/v1/callback`
    -  (You can find this in Supabase Dashboard > Authentication > Providers > Google > Callback URL).
9.  Click **CREATE**.
10. A popup will show your **Client ID** and **Client Secret**.
    -  Copy these and paste them into your **Supabase Dashboard** (Authentication > Providers > Google).

![Google Cloud Credentials](https://lh3.googleusercontent.com/d_s5CNP_zI8E8_...placeholder_for_visual_guidance)

> **Important**: If you see an error 403: org_internal, make sure you selected "External" in the OAuth consent screen.
