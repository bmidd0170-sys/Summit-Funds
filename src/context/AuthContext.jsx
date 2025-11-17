import { createContext, useContext, useState, useEffect } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from '../config/firebase'

// Create Auth Context
const AuthContext = createContext()

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  // Sign up with email and password
  const signup = async (email, password) => {
    setError(null)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      setUser(userCredential.user)
      return userCredential.user
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err.code)
      setError(errorMessage)
      throw err
    }
  }

  // Log in with email and password
  const login = async (email, password) => {
    setError(null)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      setUser(userCredential.user)
      return userCredential.user
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err.code)
      setError(errorMessage)
      throw err
    }
  }

  // Log in with Google
  const loginWithGoogle = async () => {
    setError(null)
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      setUser(userCredential.user)
      return userCredential.user
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err.code)
      setError(errorMessage)
      throw err
    }
  }

  // Log out
  const logout = async () => {
    setError(null)
    try {
      await signOut(auth)
      setUser(null)
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err.code)
      setError(errorMessage)
      throw err
    }
  }

  // Send password reset email
  const resetPassword = async (email) => {
    setError(null)
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err.code)
      setError(errorMessage)
      throw err
    }
  }

  // Helper function to format Firebase error messages
  const getAuthErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/email-already-in-use': 'Email is already in use. Please log in or use a different email.',
      'auth/invalid-email': 'Invalid email address. Please check and try again.',
      'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
      'auth/user-not-found': 'No account found with this email. Please sign up.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
    }
    return errorMessages[errorCode] || 'An error occurred. Please try again.'
  }

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use Auth Context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
