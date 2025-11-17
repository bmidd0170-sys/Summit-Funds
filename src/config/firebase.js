import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// TODO: Replace these with your Firebase project credentials
// Get these from: https://console.firebase.google.com/
// 1. Create a Firebase project
// 2. Go to Project Settings > Your apps > Web app
// 3. Copy the firebaseConfig object below

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'your-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'your-sender-id',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'your-app-id',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Auth
export const auth = getAuth(app)

// Initialize Firestore (for storing user data)
export const db = getFirestore(app)

export default app
