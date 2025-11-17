import { useNavigate } from 'react-router-dom'
import '../styles/Introduction.css'

export default function Introduction() {
  const navigate = useNavigate()

  return (
    <div className="intro-container">
      {/* Header */}
      <header className="intro-header">
        <div className="logo">💰 Summit Funds</div>
        <nav className="header-nav">
          <button onClick={() => navigate('/how-to')} className="nav-link">How it Works</button>
          <button onClick={() => navigate('/login')} className="nav-link nav-login">Login</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Grow Wealth — Without Missing Out</h1>
          <p className="hero-subtitle">
            Personalized budgets that adapt to your life. Quiz on your finances, get a smart plan, and reach your goals.
          </p>
          <div className="hero-ctas">
            <button onClick={() => navigate('/login')} className="cta-primary">
              Get Started
            </button>
            <button onClick={() => navigate('/how-to')} className="cta-secondary">
              Learn More
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="illustration">📊</div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="value-prop">
        <div className="value-card">
          <div className="value-icon">🚧</div>
          <h3>The Problem</h3>
          <p>
            Expenses keep appearing—emergencies, food, housing. It's hard to save when obstacles come your way. 
            You want to build wealth *and* enjoy life now.
          </p>
        </div>
        <div className="value-card">
          <div className="value-icon">✨</div>
          <h3>Our Solution</h3>
          <p>
            A quick quiz about your finances and life. We build a budget plan tailored to you, helping you 
            reach your goals while staying flexible for real life.
          </p>
        </div>
      </section>

      {/* Features / Benefits */}
      <section className="features">
        <h2>What You'll Get</h2>
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">📋</div>
            <h4>Financial Quiz</h4>
            <p>Understand your spending habits and financial literacy in 2 minutes.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📊</div>
            <h4>Smart Budget Plan</h4>
            <p>Personalized budget broken down into Essentials, Buffer, and Fun.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🎯</div>
            <h4>Goal Tracking</h4>
            <p>Set your goal and watch your progress month by month.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">💡</div>
            <h4>Smart Suggestions</h4>
            <p>Get recommendations to optimize your spending and save faster.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📱</div>
            <h4>Real-time Dashboard</h4>
            <p>Track income, expenses, and progress in one place.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🛡️</div>
            <h4>Flexible & Adaptive</h4>
            <p>Plans adjust when life happens. No rigid rules.</p>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="testimonials">
        <h2>What Users Say</h2>
        <div className="testimonial-grid">
          <div className="testimonial">
            <p className="testimonial-text">
              "I saved $200/month just by seeing where my money actually goes."
            </p>
            <p className="testimonial-author">— Sarah, 28</p>
          </div>
          <div className="testimonial">
            <p className="testimonial-text">
              "Finally built my emergency fund without giving up my hobbies."
            </p>
            <p className="testimonial-author">— Marcus, 35</p>
          </div>
          <div className="testimonial">
            <p className="testimonial-text">
              "The budget actually feels achievable, not like a punishment."
            </p>
            <p className="testimonial-author">— Jordan, 31</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta">
        <h2>Ready to Take Control?</h2>
        <p>Start with a 2-minute quiz and get your personalized plan.</p>
        <button onClick={() => navigate('/login')} className="cta-primary cta-large">
          Get Started Now
        </button>
      </section>

      {/* Footer */}
      <footer className="intro-footer">
        <p>&copy; 2025 Summit Funds. All rights reserved.</p>
        <div className="footer-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#contact">Contact</a>
        </div>
      </footer>
    </div>
  )
}
