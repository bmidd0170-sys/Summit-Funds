import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Login.css'

export default function Login() {
  const navigate = useNavigate()
  const { login, signup, loginWithGoogle, error: authError } = useAuth()
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    if (isSignup) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
    }

    setLoading(true)
    try {
      if (isSignup) {
        await signup(email, password)
        // After signup, user is automatically logged in
        navigate('/dashboard')
      } else {
        await login(email, password)
        navigate('/dashboard')
      }
    } catch (err) {
      setError(authError || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      navigate('/dashboard')
    } catch (err) {
      setError(authError || 'Google sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      {/* Header */}
      <header className="login-header">
        <div className="logo" onClick={() => navigate('/')}>
          💰 Summit Funds
        </div>
        <nav className="header-nav">
          <button onClick={() => navigate('/')} className="nav-link">Home</button>
          <button onClick={() => navigate('/how-to')} className="nav-link">How it Works</button>
        </nav>
      </header>

      {/* Main Content */}
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header-section">
            <h1>{isSignup ? 'Create Account' : 'Welcome Back'}</h1>
            <p>
              {isSignup 
                ? 'Get your personalized budget plan in 4 steps.'
                : 'Log in to your Summit Funds account.'}
            </p>
          </div>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {isSignup && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Loading...' : isSignup ? 'Sign Up' : 'Log In'}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <span>or</span>
          </div>

          {/* Google Login */}
          <button onClick={handleGoogleLogin} className="btn-google">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Toggle Sign Up / Log In */}
          <div className="auth-toggle">
            <p>
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup)
                  setError('')
                  setEmail('')
                  setPassword('')
                  setConfirmPassword('')
                }}
                className="toggle-link"
              >
                {isSignup ? 'Log In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {/* Recovery Link */}
          {!isSignup && (
            <div className="recovery">
              <a href="#forgot">Forgot your password?</a>
            </div>
          )}

          {/* Info Box */}
          <div className="info-box">
            <p className="info-icon">ℹ️</p>
            <p>
              <strong>Note:</strong> Firebase authentication is now active. 
              Your credentials are securely stored and managed by Firebase.
            </p>
          </div>
        </div>

        {/* Side Visual */}
        <div className="login-visual">
          <div className="visual-content">
            <div className="visual-icon">📊</div>
            <h2>Your Budget Awaits</h2>
            <p>
              Take a quick quiz, set your goal, and get a budget plan tailored to your life.
            </p>
            <div className="visual-benefits">
              <div className="benefit">✓ Personalized</div>
              <div className="benefit">✓ Flexible</div>
              <div className="benefit">✓ Achievable</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="login-footer">
        <p>&copy; 2025 Summit Funds. All rights reserved.</p>
        <div className="footer-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
        </div>
      </footer>
    </div>
  )
}
