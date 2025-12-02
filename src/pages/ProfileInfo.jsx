import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { generateSavingSteps } from "../services/customBudgetService";
import "../styles/ProfileInfo.css";

export default function Profile() {
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	const [profile, setProfile] = useState(null);
	const [profileImage, setProfileImage] = useState(null);
	const [loading, setLoading] = useState(true);
	const [showSavingSteps, setShowSavingSteps] = useState(false);
	const [savingSteps, setSavingSteps] = useState(null);
	const [loadingSteps, setLoadingSteps] = useState(false);

	useEffect(() => {
		// Load user profile from localStorage
		const savedProfile = localStorage.getItem("userProfile");
		if (savedProfile) {
			setProfile(JSON.parse(savedProfile));
		}

		// Load profile image from localStorage
		const savedImage = localStorage.getItem("profileImage");
		if (savedImage) {
			setProfileImage(savedImage);
		}

		setLoading(false);
	}, []);

	const handleEditFinances = () => {
		navigate("/financial-profile");
	};

	const handleSettings = () => {
		navigate("/settings");
	};

	const handleBudgetPlans = () => {
		navigate("/budget-plans");
	};

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/");
		} catch (err) {
			console.error("Logout failed:", err);
		}
	};

	const handleGenerateSavingSteps = async () => {
		setLoadingSteps(true);
		try {
			const steps = await generateSavingSteps(profile);
			setSavingSteps(steps);
			setShowSavingSteps(true);
		} catch (error) {
			console.error("Error generating saving steps:", error);
			// Fallback to basic steps
			setSavingSteps({
				steps: [
					"Review your discretionary spending and identify areas to cut",
					"Look for subscriptions you're not using and cancel them",
					"Set up automatic transfers to savings account",
					"Create a savings goal and track your progress",
					"Try the 30-day rule before making purchases"
				],
				source: "local"
			});
			setShowSavingSteps(true);
		} finally {
			setLoadingSteps(false);
		}
	};

	const calculateProgress = () => {
		if (!profile) return null;

		const monthlyIncome = parseFloat(profile.monthlyIncome) || 0;
		
		// Calculate recommended budget breakdown (50/30/20 rule)
		const essentialsTarget = monthlyIncome * 0.5;
		const discretionaryTarget = monthlyIncome * 0.3;
		const savingsTarget = monthlyIncome * 0.2;

		// Calculate actual expenses
		const essentials =
			(parseFloat(profile.housing) || 0) +
			(parseFloat(profile.utilities) || 0) +
			(parseFloat(profile.groceries) || 0) +
			(parseFloat(profile.transportation) || 0) +
			(parseFloat(profile.insurance) || 0) +
			(parseFloat(profile.phone) || 0) +
			(parseFloat(profile.internet) || 0);

		const discretionary =
			(parseFloat(profile.dining) || 0) +
			(parseFloat(profile.entertainment) || 0) +
			(parseFloat(profile.subscriptions) || 0) +
			(parseFloat(profile.shopping) || 0) +
			(parseFloat(profile.gym) || 0);

		const debt =
			(parseFloat(profile.creditCardPayment) || 0) +
			(parseFloat(profile.studentLoan) || 0) +
			(parseFloat(profile.personalLoan) || 0);

		const totalExpenses = essentials + discretionary + debt;
		const remaining = monthlyIncome - totalExpenses;

		return {
			monthlyIncome,
			essentials,
			essentialsTarget,
			essentialsPercent: ((essentials / essentialsTarget) * 100).toFixed(1),
			discretionary,
			discretionaryTarget,
			discretionaryPercent: ((discretionary / discretionaryTarget) * 100).toFixed(1),
			debt,
			totalExpenses,
			remaining,
			remainingPercent: ((remaining / monthlyIncome) * 100).toFixed(1),
		};
	};

	const progress = calculateProgress();

	if (loading) {
		return (
			<div className="profile-info-container">
				<p>Loading...</p>
			</div>
		);
	}

	return (
		<div className="profile-info-container">
			{/* Header */}
			<header className="profile-info-header">
				<div className="header-left">
					<button className="logo logo-btn" onClick={() => navigate("/dashboard")}>
						💰 Summit Funds
					</button>
					<div className="header-title">
						<h1>My Profile</h1>
						<p>{user?.email}</p>
					</div>
				</div>
				<div className="header-buttons">
					<button className="btn-profile" onClick={() => navigate("/profile")}>
						👤 Profile
					</button>
					<button className="btn-logout" onClick={handleLogout}>
						Logout
					</button>
				</div>
			</header>

			{/* Main Content */}
			<main className="profile-info-main">
				{!profile ? (
					<div className="no-profile-section">
						<div className="no-profile-card">
							<div className="no-profile-icon">📝</div>
							<h2>No Profile Data Yet</h2>
							<p>Complete the quiz to create your financial profile.</p>
							<button className="btn-take-quiz" onClick={() => navigate("/quiz")}>
								Take the Quiz
							</button>
						</div>
					</div>
				) : (
					<div className="profile-content">
						{/* Profile Header */}
						<section className="profile-header-section">
							<div className="profile-header-left">
								{profileImage ? (
									<img src={profileImage} alt="Profile" className="profile-avatar" />
								) : (
									<div className="profile-avatar-placeholder">👤</div>
								)}
								<div className="profile-info-text">
									<h2>Welcome back!</h2>
									<p className="profile-email">{user?.email}</p>
								</div>
							</div>
						<div className="profile-header-actions">
							<button className="btn-action btn-edit-finances" onClick={handleEditFinances}>
								✏️ Edit Finances
							</button>
							<button className="btn-action btn-budget-plans" onClick={handleBudgetPlans}>
								📋 View Budget Plans
							</button>
							<button className="btn-action btn-settings" onClick={handleSettings}>
								⚙️ Settings
							</button>
						</div>
						</section>

						{/* Current Income Card */}
						<section className="income-section">
							<div className="income-card">
								<h3>💵 Monthly Income</h3>
								<div className="income-amount">${progress.monthlyIncome.toFixed(2)}</div>
								<p className="income-label">Your current take-home income</p>
							</div>
						</section>

						{/* Budget Progress */}
						<section className="budget-progress-section">
							<h3>📊 Budget Progress (50/30/20 Rule)</h3>
							<p className="budget-description">
								The recommended breakdown: 50% for essentials, 30% for discretionary spending, 20% for savings
							</p>

							{/* Essentials */}
							<div className="progress-item">
								<div className="progress-label">
									<span>Essential Expenses</span>
									<span>${progress.essentials.toFixed(2)} / ${progress.essentialsTarget.toFixed(2)}</span>
								</div>
								<div className="progress-bar-container">
									<div
										className={`progress-bar ${progress.essentialsPercent > 100 ? "over-budget" : "on-track"}`}
										style={{ width: `${Math.min(progress.essentialsPercent, 100)}%` }}
									></div>
								</div>
								<p className="progress-status">
									{progress.essentialsPercent}% of budget {progress.essentialsPercent > 100 ? "⚠️ Over" : "✓ On Track"}
								</p>
							</div>

							{/* Discretionary */}
							<div className="progress-item">
								<div className="progress-label">
									<span>Discretionary Spending</span>
									<span>${progress.discretionary.toFixed(2)} / ${progress.discretionaryTarget.toFixed(2)}</span>
								</div>
								<div className="progress-bar-container">
									<div
										className={`progress-bar ${progress.discretionaryPercent > 100 ? "over-budget" : "on-track"}`}
										style={{ width: `${Math.min(progress.discretionaryPercent, 100)}%` }}
									></div>
								</div>
								<p className="progress-status">
									{progress.discretionaryPercent}% of budget {progress.discretionaryPercent > 100 ? "⚠️ Over" : "✓ On Track"}
								</p>
							</div>

							{/* Savings/Remaining */}
							<div className="progress-item savings-item">
								<div className="progress-label">
									<span>Savings Potential</span>
									<span className={progress.remaining >= 0 ? "amount-positive" : "amount-negative"}>
										${Math.abs(progress.remaining).toFixed(2)}
									</span>
								</div>
								
								{progress.remaining >= 0 ? (
									// Positive savings
									<div className="savings-positive">
										<div className="savings-message">
											<span className="savings-icon">✨</span>
											<p>Great news! You can save <strong>${progress.remaining.toFixed(2)}/month</strong></p>
										</div>
										<div className="savings-breakdown">
											<p className="breakdown-text">That's <strong>${(progress.remaining * 12).toFixed(2)} per year</strong> towards your goals!</p>
											<div className="savings-options">
												<div className="option">
													<span className="option-icon">🎯</span>
													<div>
														<strong>Emergency Fund</strong>
														<p>Build 3-6 months of expenses</p>
													</div>
												</div>
												<div className="option">
													<span className="option-icon">🏆</span>
													<div>
														<strong>Investment</strong>
														<p>Invest for long-term growth</p>
													</div>
												</div>
												<div className="option">
													<span className="option-icon">🚗</span>
													<div>
														<strong>Major Purchase</strong>
														<p>Save for a car, house, or vacation</p>
													</div>
												</div>
											</div>
										</div>
										<button 
											className="btn-create-goal"
											onClick={() => navigate("/create-budget-plan")}
										>
											Create a Savings Goal →
										</button>
									</div>
								) : (
									// Negative savings - show action steps
									<div className="savings-negative">
										<div className="savings-message">
											<span className="savings-icon">⚠️</span>
											<p>You're spending <strong>${Math.abs(progress.remaining).toFixed(2)}/month more</strong> than your income</p>
										</div>
										<p className="message-subtitle">Let's find ways to help you start saving:</p>
										<button 
											className="btn-saving-steps"
											onClick={handleGenerateSavingSteps}
											disabled={loadingSteps}
										>
											{loadingSteps ? "Generating steps..." : "💡 Show Me Saving Steps"}
										</button>
									</div>
								)}
							</div>
						</section>

						{/* Quick Stats */}
						<section className="quick-stats">
							<div className="stat-card">
								<h4>Total Expenses</h4>
								<p>${progress.totalExpenses.toFixed(2)}</p>
							</div>
							<div className="stat-card">
								<h4>Remaining</h4>
								<p className={progress.remaining >= 0 ? "positive" : "negative"}>
									${progress.remaining.toFixed(2)}
								</p>
							</div>
							<div className="stat-card">
								<h4>Budget Used</h4>
								<p>{((progress.totalExpenses / progress.monthlyIncome) * 100).toFixed(1)}%</p>
							</div>
						</section>
					</div>
				)}
			</main>

			{/* Saving Steps Modal */}
			{showSavingSteps && savingSteps && (
				<div className="modal-overlay" onClick={() => setShowSavingSteps(false)}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h2>💡 Steps to Start Saving</h2>
							<button 
								className="modal-close"
								onClick={() => setShowSavingSteps(false)}
							>
								✕
							</button>
						</div>
						
						<div className="modal-body">
							<p className="modal-intro">
								Here are actionable steps you can take right now to free up money and start saving:
							</p>
							
							<div className="steps-list">
								{savingSteps.steps.map((step, index) => (
									<div key={index} className="step-item">
										<div className="step-number">{index + 1}</div>
										<div className="step-content">
											<p>{step}</p>
										</div>
									</div>
								))}
							</div>

							{savingSteps.potentialSavings && (
								<div className="potential-savings">
									<span className="savings-icon">💰</span>
									<p><strong>Potential Monthly Savings:</strong> ${savingSteps.potentialSavings.toFixed(2)}</p>
								</div>
							)}

							{savingSteps.source === "ai" && (
								<p className="ai-note">🤖 Generated by AI based on your profile</p>
							)}
						</div>

						<div className="modal-footer">
							<button 
								className="btn-create-goal"
								onClick={() => {
									setShowSavingSteps(false);
									navigate("/create-budget-plan");
								}}
							>
								Create Savings Goal
							</button>
							<button 
								className="btn-close"
								onClick={() => setShowSavingSteps(false)}
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Footer */}
			<footer className="profile-info-footer">
				<p>&copy; 2025 Summit Funds. All rights reserved.</p>
			</footer>
		</div>
	);
}
