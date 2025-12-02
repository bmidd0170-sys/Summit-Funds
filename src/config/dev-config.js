// Development Configuration
// Use this for local development when Firebase is having issues

export const DEV_CONFIG = {
  // Enable offline mode for development
  OFFLINE_MODE: true,
  
  // Mock user for development
  MOCK_USER: {
    uid: 'dev-user-123',
    email: 'developer@summitfunds.com',
    displayName: 'Development User',
    emailVerified: true
  },
  
  // Development settings
  ENABLE_CONSOLE_LOGS: true,
  SKIP_AUTH_REDIRECT: true,
  USE_MOCK_DATA: true
}

// Check if we should use development mode
export const isDevelopmentMode = () => {
  return import.meta.env.DEV && (
    !import.meta.env.VITE_FIREBASE_API_KEY || 
    import.meta.env.VITE_FIREBASE_API_KEY === 'YOUR_API_KEY'
  )
}

// Mock authentication functions for development
export const mockAuth = {
  currentUser: DEV_CONFIG.MOCK_USER,
  
  signInWithEmailAndPassword: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay
    return { user: DEV_CONFIG.MOCK_USER }
  },
  
  createUserWithEmailAndPassword: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { user: { ...DEV_CONFIG.MOCK_USER, email } }
  },
  
  signOut: async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return true
  },
  
  onAuthStateChanged: (callback) => {
    // Immediately call with mock user in development
    if (DEV_CONFIG.OFFLINE_MODE) {
      setTimeout(() => callback(DEV_CONFIG.MOCK_USER), 100)
    }
    return () => {} // Cleanup function
  }
}

console.log('🔧 Development mode:', isDevelopmentMode() ? 'ENABLED' : 'DISABLED')