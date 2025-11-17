# Firebase Quick Reference Card

## 🚀 Getting Started (3 Steps)

### 1. Get Firebase Credentials
```
Go to: https://console.firebase.google.com/
Create project → Create web app → Copy config
```

### 2. Add to `.env.local`
```bash
VITE_FIREBASE_API_KEY=YOUR_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Enable Auth Methods in Firebase Console
- ✅ Email/Password (Authentication > Sign-in method)
- ✅ Google (Authentication > Sign-in method)
- ✅ Add `localhost:5173` to authorized domains

---

## 📱 Using Auth in Components

### Import & Use
```javascript
import { useAuth } from '../context/AuthContext'

export function MyComponent() {
  const { user, login, logout, error } = useAuth()
  
  return (
    <>
      {user ? (
        <>
          <p>Hello {user.email}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Please log in</p>
      )}
    </>
  )
}
```

---

## 🔐 Auth Methods Available

```javascript
const {
  user,              // Current user object (or null)
  loading,           // Loading state
  error,             // Error message (if any)
  
  signup,            // signup(email, password) → Promise
  login,             // login(email, password) → Promise
  loginWithGoogle,   // loginWithGoogle() → Promise
  logout,            // logout() → Promise
  resetPassword,     // resetPassword(email) → Promise
} = useAuth()
```

---

## 🛡️ Protected Routes

### Wrap Pages That Need Login
```javascript
// In App.jsx
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>

// Unauth users auto-redirect to /login
```

---

## 👤 Accessing User Data

```javascript
const { user } = useAuth()

// Available properties:
user.uid              // Unique user ID
user.email            // User email
user.displayName      // From Google/profile
user.photoURL         // Profile picture
user.emailVerified    // Email verification status
user.phoneNumber      // If provided
user.isAnonymous      // Anonymous user?
user.createdAt        // Account creation date
user.metadata         // Login history
```

---

## 🚨 Error Handling

### Common Errors Auto-Converted to Readable Messages
```
"Email already in use"
"Invalid email"
"Weak password"
"User not found"
"Wrong password"
"Too many failed attempts"
"Google sign-in cancelled"
"Network error"
```

---

## 📊 Check Firebase Console

### See Your Users
```
Firebase Console → Authentication → Users
Shows: email, created date, last login, provider
```

### User Metrics
```
Firebase Console → Authentication
Total users, active users, signup methods
```

---

## 🧪 Test Flows

```bash
# Start dev server
npm run dev

# Visit: http://localhost:5173/login

# Test:
1. Sign up with email/password
2. Log in with same credentials
3. Log in with Google
4. Check Firebase Console for users
5. Try logout
```

---

## ⚡ Common Tasks

### Check if User is Logged In
```javascript
const { user, loading } = useAuth()

if (loading) return <div>Loading...</div>
return user ? <Dashboard /> : <LoginPage />
```

### Send Password Reset Email
```javascript
const { resetPassword } = useAuth()

const handleForgot = async (email) => {
  try {
    await resetPassword(email)
    alert('Reset email sent!')
  } catch (err) {
    alert(err.message)
  }
}
```

### Sign Out User
```javascript
const { logout } = useAuth()

<button onClick={logout}>Logout</button>
```

### Sign Up New User
```javascript
const { signup } = useAuth()

const handleSignup = async (email, password) => {
  try {
    const user = await signup(email, password)
    console.log('Signed up:', user.email)
  } catch (err) {
    console.error('Signup failed:', err)
  }
}
```

---

## 🔗 Useful Links

| Resource | URL |
|----------|-----|
| Firebase Console | https://console.firebase.google.com/ |
| Auth Docs | https://firebase.google.com/docs/auth |
| Firestore Docs | https://firebase.google.com/docs/firestore |
| Security Rules | https://firebase.google.com/docs/rules |

---

## ✅ Checklist Before Production

- [ ] Firebase project created
- [ ] Web app registered
- [ ] Credentials in `.env.local`
- [ ] Email/Password auth enabled
- [ ] Google auth enabled
- [ ] `localhost:5173` in authorized domains
- [ ] Tested all auth flows
- [ ] Set Firestore security rules
- [ ] Enabled email verification
- [ ] Set reCAPTCHA (optional)

---

## 💾 File Structure

```
Summit Funds/
├── .env.local                 ← Add credentials here
├── src/
│   ├── config/
│   │   └── firebase.js        ← Firebase init
│   ├── context/
│   │   └── AuthContext.jsx    ← Auth state
│   ├── components/
│   │   ├── ProtectedRoute.jsx ← Route guard
│   │   └── AuthExample.jsx    ← Usage examples
│   ├── pages/
│   │   ├── Login.jsx          ← Login/signup
│   │   └── ...
│   └── App.jsx                ← AuthProvider wrapper
└── FIREBASE_SETUP.md          ← Full setup guide
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find module" | Run `npm install firebase` |
| Env vars not loading | Restart dev server |
| Google auth fails | Add domain to authorized list in Firebase |
| "Too many requests" | Wait 30 minutes, Firebase has rate limiting |
| Variables show as "YOUR_" | Check `.env.local` has real values |

---

**Everything is ready! Just add your Firebase credentials and test.** 🎉
