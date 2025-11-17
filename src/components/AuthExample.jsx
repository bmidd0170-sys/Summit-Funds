import { useAuth } from '../context/AuthContext'

/**
 * EXAMPLE: How to use the Auth Context in any component
 * 
 * This file shows how to access user state and auth methods throughout your app
 */

export function AuthExampleComponent() {
  const { user, loading, error, login, logout } = useAuth()

  // Example 1: Show user info if logged in
  if (loading) return <p>Checking authentication...</p>

  if (user) {
    return (
      <div>
        <p>Welcome, {user.email}</p>
        <p>User ID: {user.uid}</p>
        <button onClick={logout}>Log Out</button>
      </div>
    )
  }

  // Example 2: Show login form if not logged in
  return (
    <div>
      <p>Not logged in</p>
      <p>Go to /login to create an account or sign in</p>
    </div>
  )
}

/**
 * USAGE IN YOUR PAGES:
 * 
 * // In Dashboard.jsx
 * import { useAuth } from '../context/AuthContext'
 * 
 * export default function Dashboard() {
 *   const { user, logout } = useAuth()
 *   
 *   return (
 *     <div>
 *       <h1>Welcome, {user?.email}</h1>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   )
 * }
 */

/**
 * AVAILABLE METHODS:
 * 
 * const {
 *   user,              // Firebase user object { uid, email, displayName, photoURL, etc. }
 *   loading,           // boolean - true while checking auth state
 *   error,             // string - Firebase error message if auth fails
 *   signup,            // async function(email, password) - Create new account
 *   login,             // async function(email, password) - Sign in with email
 *   loginWithGoogle,   // async function() - Sign in with Google
 *   logout,            // async function() - Sign out
 *   resetPassword,     // async function(email) - Send password reset email
 * } = useAuth()
 */

/**
 * EXAMPLE: Conditional Rendering Based on Auth State
 * 
 * export default function App() {
 *   const { user, loading } = useAuth()
 *   
 *   if (loading) return <LoadingScreen />
 *   
 *   return (
 *     <>
 *       {user ? (
 *         <Dashboard user={user} />
 *       ) : (
 *         <LoginPage />
 *       )}
 *     </>
 *   )
 * }
 */

/**
 * EXAMPLE: Getting User-Specific Data
 * 
 * export function UserProfile() {
 *   const { user } = useAuth()
 *   
 *   if (!user) return <Navigate to="/login" />
 *   
 *   return (
 *     <div>
 *       <p>Email: {user.email}</p>
 *       <p>User ID: {user.uid}</p>
 *       <p>Email Verified: {user.emailVerified ? 'Yes' : 'No'}</p>
 *       {user.photoURL && <img src={user.photoURL} alt="Profile" />}
 *     </div>
 *   )
 * }
 */
