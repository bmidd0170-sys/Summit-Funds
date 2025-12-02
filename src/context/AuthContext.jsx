import { createContext, useContext, useState, useEffect } from "react";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	sendPasswordResetEmail,
	GoogleAuthProvider,
	signInWithPopup,
} from "firebase/auth";
import { auth } from "../config/firebase";

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isDeveloper, setIsDeveloper] = useState(false);

	// Check if user is developer on auth state change
	useEffect(() => {
		let unsubscribe = () => {};
		
		try {
			// Test if auth is properly initialized
			if (!auth || typeof auth.onAuthStateChanged !== 'function') {
				console.error("🔥 Firebase Auth is not properly initialized");
				setError("Authentication service is unavailable. Using offline mode.");
				setLoading(false);
				return;
			}

			unsubscribe = auth.onAuthStateChanged(
				(currentUser) => {
					console.log("👤 Auth state changed:", currentUser?.email || "No user");
					setUser(currentUser);
					
					// Check if developer email
					if (currentUser?.email === "Braydenmiddlebrooks@gmail.com") {
						setIsDeveloper(true);
						console.log("🔧 Developer mode enabled for", currentUser.email);
					} else {
						setIsDeveloper(false);
					}
					
					setLoading(false);
					setError(null); // Clear any previous connection errors
				},
				(authError) => {
					console.error("🔥 Firebase Auth Error:", authError);
					
					// Handle specific Firebase errors
					if (authError.code === 'auth/api-key-not-valid' || 
					    authError.message?.includes('API key not valid')) {
						setError("Firebase API key is invalid. Using offline mode.");
					} else {
						setError(`Authentication error: ${authError.message}`);
					}
					
					setLoading(false);
				}
			);

		} catch (initError) {
			console.error("🔥 Firebase initialization error:", initError);
			setError("Firebase authentication is not available. Check your configuration.");
			setLoading(false);
		}

		return () => {
			try {
				unsubscribe();
			} catch (cleanupError) {
				console.warn("Auth cleanup error:", cleanupError);
			}
		};
	}, []);

	// Sign up with email and password
	const signup = async (email, password) => {
		setError(null);
		try {
			// Check if auth is available
			if (!auth || typeof auth.currentUser === 'undefined') {
				throw new Error("Authentication service is not available");
			}

			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			setUser(userCredential.user);
			console.log("✅ User signed up successfully:", email);
			return userCredential.user;
		} catch (err) {
			console.error("❌ Signup error:", err);
			
			// Handle API key errors specifically
			if (err.code === 'auth/api-key-not-valid' || 
			    err.message?.includes('API key not valid')) {
				const message = "Firebase API key is invalid. Please check the configuration.";
				setError(message);
				throw new Error(message);
			}
			
			const errorMessage = getAuthErrorMessage(err.code) || err.message;
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	};

	// Log in with email and password
	const login = async (email, password) => {
		setError(null);
		try {
			// Check if auth is available
			if (!auth || typeof auth.currentUser === 'undefined') {
				throw new Error("Authentication service is not available");
			}

			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			setUser(userCredential.user);
			console.log("✅ User logged in successfully:", email);
			return userCredential.user;
		} catch (err) {
			console.error("❌ Login error:", err);
			
			// Handle API key errors specifically
			if (err.code === 'auth/api-key-not-valid' || 
			    err.message?.includes('API key not valid')) {
				const message = "Firebase API key is invalid. Authentication unavailable.";
				setError(message);
				throw new Error(message);
			}
			
			const errorMessage = getAuthErrorMessage(err.code) || err.message;
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	};

	// Log in with Google
	const loginWithGoogle = async () => {
		setError(null);
		try {
			const provider = new GoogleAuthProvider();
			const userCredential = await signInWithPopup(auth, provider);
			setUser(userCredential.user);
			return userCredential.user;
		} catch (err) {
			const errorMessage = getAuthErrorMessage(err.code);
			setError(errorMessage);
			throw err;
		}
	};

	// Log out
	const logout = async () => {
		setError(null);
		try {
			await signOut(auth);
			setUser(null);
		} catch (err) {
			const errorMessage = getAuthErrorMessage(err.code);
			setError(errorMessage);
			throw err;
		}
	};

	// Send password reset email
	const resetPassword = async (email) => {
		setError(null);
		try {
			await sendPasswordResetEmail(auth, email);
		} catch (err) {
			const errorMessage = getAuthErrorMessage(err.code);
			setError(errorMessage);
			throw err;
		}
	};

	// Helper function to format Firebase error messages
	const getAuthErrorMessage = (errorCode) => {
		const errorMessages = {
			"auth/email-already-in-use":
				"Email is already in use. Please log in or use a different email.",
			"auth/invalid-email":
				"Invalid email address. Please check and try again.",
			"auth/weak-password":
				"Password is too weak. Please use at least 6 characters.",
			"auth/user-not-found":
				"No account found with this email. Please sign up.",
			"auth/wrong-password": "Incorrect password. Please try again.",
			"auth/too-many-requests":
				"Too many failed attempts. Please try again later.",
			"auth/popup-closed-by-user": "Google sign-in was cancelled.",
			"auth/network-request-failed":
				"Network error. Please check your connection.",
		};
		return errorMessages[errorCode] || "An error occurred. Please try again.";
	};

	const value = {
		user,
		loading,
		error,
		isDeveloper,
		signup,
		login,
		loginWithGoogle,
		logout,
		resetPassword,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use Auth Context
export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
