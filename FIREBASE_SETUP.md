# Firebase Setup Guide

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter your project name (e.g., "Summit Funds")
4. Accept the terms and click **"Continue"**
5. Enable or disable Google Analytics (optional) and click **"Create project"**
6. Wait for the project to be created (1-2 minutes)

## Step 2: Create a Web App

1. In the Firebase Console, go to your project
2. Click the **"Web"** icon (</>) to create a web app
3. Enter your app name (e.g., "Summit Funds Web")
4. Check "Also set up Firebase Hosting for this app" (optional)
5. Click **"Register app"**

## Step 3: Get Your Firebase Config

1. After registering, you'll see your Firebase config object
2. Copy the following values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

## Step 4: Add Config to `.env.local`

1. Open `.env.local` in your project root
2. Replace the placeholder values with your actual Firebase config:
   ```
   VITE_FIREBASE_API_KEY=YOUR_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

## Step 5: Enable Authentication Methods

### Email/Password Authentication:
1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click the **"Sign-in method"** tab
3. Click **"Email/Password"**
4. Enable both "Email/Password" and "Email link (passwordless sign-in)" if desired
5. Click **"Save"**

### Google Authentication:
1. Go to **Authentication** > **Sign-in method**
2. Click **"Google"**
3. Enable it and select a support email
4. Click **"Save"**

## Step 6: (Optional) Enable Firestore Database

To store user profiles and preferences:
1. Go to **Firestore Database** in the left sidebar
2. Click **"Create database"**
3. Start in **Test mode** (for development only!)
4. Choose a location closest to you
5. Click **"Create"**

**Important:** Before going to production, set up proper security rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## Step 7: Test Your Setup

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Go to http://localhost:5173/login

3. Try these flows:
   - **Sign up** with a new email and password
   - **Log in** with the created account
   - **Log in with Google**
   - **Password reset** (click "Forgot your password?")

4. Check Firebase Console > Authentication to see your users

## Troubleshooting

### Issue: "Cannot find module 'firebase'"
- Run: `npm install firebase`

### Issue: Environment variables not loading
- Restart your dev server after adding/changing `.env.local`
- Make sure variable names start with `VITE_`

### Issue: CORS error on Google login
- Check that your Firebase project's authorized domains includes `localhost:5173`
- Go to Firebase Console > Authentication > Settings > Authorized domains
- Add `localhost:5173` if missing

### Issue: Too many requests error
- Firebase has built-in rate limiting
- Wait a few minutes before trying again

## What's Next?

1. **Create User Profile Collection** - Store additional user data (name, preferences, goals)
2. **Build Quiz Page** - Create the financial literacy quiz
3. **Build Budget Builder** - Create personalized budget plans
4. **Build Dashboard** - Show user progress and insights
5. **Add Password Reset** - Fully functional password recovery flow

## Security Best Practices

- ✅ `.env.local` is in `.gitignore` (keep credentials secret!)
- ✅ Use environment variables for all sensitive config
- ✅ Set up proper Firestore security rules before production
- ✅ Enable 2FA in Firebase Console for your account
- ✅ Monitor authentication attempts in Firebase Console
