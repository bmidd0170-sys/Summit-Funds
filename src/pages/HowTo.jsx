import { useNavigate } from "react-router-dom";
import "../App.css";

export default function HowTo() {
	const navigate = useNavigate();

	return (
		<div className="howto-container">
			{/* Header */}
			<header className="howto-header">
				<div className="logo">💰 Summit Funds</div>
				<nav className="header-nav">
					<button onClick={() => navigate("/")} className="nav-link">
						Home
					</button>
					<button
						onClick={() => navigate("/login")}
						className="nav-link nav-login"
					>
						Login
					</button>
				</nav>
			</header>

			{/* Hero */}
			<section className="howto-hero">
				<h1>How It Works</h1>
				<p>A simple 4-step process to your personalized budget</p>
			</section>

			{/* Step-by-Step */}
			<section className="steps">
				<div className="step">
					<div className="step-number">1</div>
					<div className="step-content">
						<h3>Sign Up & Take the Quiz</h3>
						<p>
							Create your account (via email or Google). Then answer 7–10 quick
							questions about your income, spending, lifestyle, and financial
							goals. It takes about 2–3 minutes.
						</p>
						<div className="step-example">
							<strong>Quiz questions include:</strong>
							<ul>
								<li>What's your monthly take-home income?</li>
								<li>How often do unexpected expenses come up?</li>
								<li>
									How many months of expenses in savings would make you feel
									secure?
								</li>
								<li>
									Do you prefer to save more or enjoy now? (balance scale)
								</li>
							</ul>
						</div>
					</div>
				</div>

				<div className="step-divider">↓</div>

				<div className="step">
					<div className="step-number">2</div>
					<div className="step-content">
						<h3>Set Your Goal</h3>
						<p>
							Define what you're saving for: vacation, emergency fund, car,
							house, etc. Add a target amount and timeline.
						</p>
						<div className="step-example">
							<strong>Example goals:</strong>
							<ul>
								<li>Build $2,000 emergency fund in 6 months</li>
								<li>Save $5,000 for vacation in 1 year</li>
								<li>Pay off $10,000 credit card debt in 18 months</li>
							</ul>
						</div>
					</div>
				</div>

				<div className="step-divider">↓</div>

				<div className="step">
					<div className="step-number">3</div>
					<div className="step-content">
						<h3>Get Your Smart Budget Plan</h3>
						<p>Based on your answers, Summit Funds creates a 3-tier budget:</p>
						<div className="step-example">
							<strong>Your Budget Tiers:</strong>
							<div className="tier-breakdown">
								<div className="tier">
									<div className="tier-icon">🏠</div>
									<strong>Essentials</strong>
									<p>Housing, food, utilities, insurance (non-negotiable)</p>
								</div>
								<div className="tier">
									<div className="tier-icon">🛡️</div>
									<strong>Buffer / Emergency Fund</strong>
									<p>Safety net for when life happens</p>
								</div>
								<div className="tier">
									<div className="tier-icon">🎉</div>
									<strong>Flex & Fun</strong>
									<p>Subscriptions, dining out, entertainment, hobby goals</p>
								</div>
							</div>
							<p style={{ marginTop: "1rem", fontStyle: "italic" }}>
								The app calculates how much to allocate to each tier based on
								your income, expenses, and goal timeline.
							</p>
						</div>
					</div>
				</div>

				<div className="step-divider">↓</div>

				<div className="step">
					<div className="step-number">4</div>
					<div className="step-content">
						<h3>Use Your Dashboard & Adjust</h3>
						<p>View your real-time dashboard with:</p>
						<div className="step-example">
							<ul>
								<li>
									<strong>Goal progress:</strong> How close you are to your
									target
								</li>
								<li>
									<strong>Monthly cashflow:</strong> Income vs. spending charts
								</li>
								<li>
									<strong>Expense tracking:</strong> See what you spent and
									where
								</li>
								<li>
									<strong>Smart suggestions:</strong> "Reduce subscriptions →
									reach goal 3 weeks sooner"
								</li>
								<li>
									<strong>What-if scenarios:</strong> Adjust the savings/fun
									balance and see impact
								</li>
								<li>
									<strong>Learning resources:</strong> Quick financial literacy
									tips
								</li>
							</ul>
						</div>
						<p>
							Get weekly check-ins ("How did you do?") and alerts for
							overspending or milestones.
						</p>
					</div>
				</div>
			</section>

			{/* Final Result */}
			<section className="final-result">
				<h2>Your Final Result</h2>
				<div className="result-card">
					<h3>A Budget Plan That Actually Works</h3>
					<div className="result-highlights">
						<div className="highlight">
							<div className="highlight-icon">✅</div>
							<div className="highlight-text">
								<strong>Personalized</strong> — Based on YOUR life, not generic
								rules
							</div>
						</div>
						<div className="highlight">
							<div className="highlight-icon">✅</div>
							<div className="highlight-text">
								<strong>Flexible</strong> — Adjusts when unexpected expenses
								happen
							</div>
						</div>
						<div className="highlight">
							<div className="highlight-icon">✅</div>
							<div className="highlight-text">
								<strong>Achievable</strong> — You don't have to sacrifice fun to
								save
							</div>
						</div>
						<div className="highlight">
							<div className="highlight-icon">✅</div>
							<div className="highlight-text">
								<strong>Trackable</strong> — See your progress toward goals
								every day
							</div>
						</div>
						<div className="highlight">
							<div className="highlight-icon">✅</div>
							<div className="highlight-text">
								<strong>Empowering</strong> — Learn financial literacy as you go
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section className="faq">
				<h2>Common Questions</h2>
				<div className="faq-grid">
					<div className="faq-item">
						<h4>How long is the quiz?</h4>
						<p>About 2–3 minutes. We keep it short and relevant.</p>
					</div>
					<div className="faq-item">
						<h4>Is my data safe?</h4>
						<p>
							Yes. Your financial data is encrypted and never sold. We follow
							industry privacy standards.
						</p>
					</div>
					<div className="faq-item">
						<h4>Can I edit my budget later?</h4>
						<p>
							Absolutely. Adjust your goals, expenses, and preferences anytime.
							Your plan updates instantly.
						</p>
					</div>
					<div className="faq-item">
						<h4>What if my income changes?</h4>
						<p>
							No problem. Update your income and the budget recalculates to show
							your new savings potential.
						</p>
					</div>
					<div className="faq-item">
						<h4>Does it work with my bank?</h4>
						<p>
							Not yet, but you can manually add transactions. Bank sync is
							coming soon.
						</p>
					</div>
					<div className="faq-item">
						<h4>Can I use it on mobile?</h4>
						<p>Yes. Summit Funds works on desktop, tablet, and mobile.</p>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="howto-cta">
				<h2>Ready to Start?</h2>
				<p>Your personalized budget plan is just 4 steps away.</p>
				<button
					onClick={() => navigate("/login")}
					className="cta-primary cta-large"
				>
					Get Started Now
				</button>
			</section>

			{/* Footer */}
			<footer className="howto-footer">
				<p>&copy; 2025 Summit Funds. All rights reserved.</p>
				<div className="footer-links">
					<a href="#privacy">Privacy Policy</a>
					<a href="#terms">Terms of Service</a>
					<a href="#contact">Contact</a>
				</div>
			</footer>
		</div>
	);
}
