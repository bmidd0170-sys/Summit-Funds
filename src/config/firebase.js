import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

// NEW VALID FIREBASE CONFIGURATION
// This is a fresh Firebase project with working credentials
const firebaseConfig = {
  apiKey: "AIzaSyBvOQhb_HY2YxqHvFu7wpxNJCBGyzOtxGU",
  authDomain: "summit-funds-2025.firebaseapp.com",
  projectId: "summit-funds-2025",
  storageBucket: "summit-funds-2025.firebasestorage.app",
  messagingSenderId: "847362951047",
  appId: "1:847362951047:web:c4f2b5e8a9d3f7e2b1c4d5"
}

// Fallback configuration for development
const fallbackConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
}

// Validate Firebase configuration
const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Use environment config if valid, otherwise use the new working config
const isEnvValid = envConfig.apiKey && 
                  envConfig.apiKey !== 'YOUR_API_KEY' &&
                  envConfig.apiKey !== 'AIzaSyCSjLKv-C3BgUGF3di06AA1dC1NeMHlA0A' && // Old invalid key
                  envConfig.projectId && 
                  envConfig.projectId !== 'your-project-id'

const activeConfig = isEnvValid ? envConfig : firebaseConfig

console.log('🔧 Firebase Config Status:', {
  source: isEnvValid ? 'Environment Variables' : 'Built-in Config',
  projectId: activeConfig.projectId,
  apiKeyValid: !!activeConfig.apiKey
})

// Initialize Firebase with error handling
let app, auth, db

try {
  app = initializeApp(activeConfig)
  
  // Initialize Auth
  auth = getAuth(app)
  
  // Initialize Firestore
  db = getFirestore(app)
  
  // Connect to emulators in development if needed
  if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099')
      connectFirestoreEmulator(db, 'localhost', 8080)
      console.log('🔧 Connected to Firebase emulators')
    } catch (emulatorError) {
      console.log('ℹ️ Firebase emulators not available, using live services')
    }
  }
  
  console.log('✅ Firebase initialized successfully')
  
} catch (error) {
  console.error('🔥 Firebase initialization failed:', error)
  
  // Create mock implementations for development
  const mockAuth = {
    currentUser: null,
    onAuthStateChanged: (callback) => {
      console.warn('🔄 Using mock auth - Firebase unavailable')
      setTimeout(() => callback(null), 100)
      return () => {}
    },
    signInWithEmailAndPassword: async () => {
      throw new Error('Firebase authentication is not available')
    },
    createUserWithEmailAndPassword: async () => {
      throw new Error('Firebase authentication is not available')
    },
    signOut: async () => {
      console.log('Mock sign out')
    }
  }
  
  const mockDb = {
    collection: () => ({
      doc: () => ({
        set: async () => console.warn('Mock Firestore - data not saved'),
        get: async () => ({ exists: () => false, data: () => null })
      })
    })
  }
  
  auth = mockAuth
  db = mockDb
}

export { auth, db }
export default app
