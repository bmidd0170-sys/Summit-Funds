import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/BudgetDetail.css";

export default function BudgetDetail() {
	const location = useLocation();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [budgetData, setBudgetData] = useState(null);
	const [budgetBreakdown, setBudgetBreakdown] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Get budget data from location state or localStorage
		if (location.state?.budgetData) {
			setBudgetData(location.state.budgetData);
			
			// Try to get the AI-generated breakdown
			const activeKey = location.state.budgetData.metadata?.startDate
				? new Date(location.state.budgetData.metadata.startDate).toISOString().split("T")[0]
				: null;
			
			if (activeKey) {
				const breakdowns = localStorage.getItem("budgetBreakdowns");
				if (breakdowns) {
					const parsed = JSON.parse(breakdowns);
					if (parsed[activeKey]) {
						setBudgetBreakdown(parsed[activeKey]);
					}
				}
			}
			setLoading(false);
		} else {
			// Fallback: try to get active budget from localStorage
			const activeKey = localStorage.getItem("activeBudgetKey");
			if (activeKey) {
				const allBudgets = localStorage.getItem("allBudgets");
				if (allBudgets) {
					const parsed = JSON.parse(allBudgets);
					if (parsed[activeKey]) {
						setBudgetData(parsed[activeKey]);
					}
				}

				// Also try to get breakdown
				const breakdowns = localStorage.getItem("budgetBreakdowns");
				if (breakdowns) {
					const parsed = JSON.parse(breakdowns);
					if (parsed[activeKey]) {
						setBudgetBreakdown(parsed[activeKey]);
					}
				}
			}
			setLoading(false);
		}
	}, [location.state]);

	const calculateProgression = (metadata) => {
		if (!metadata) return 0;

		const startDate = new Date(metadata.startDate);
		const endDate = new Date(metadata.endDate);
		const now = new Date();

		const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
		const elapsedDays = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)) + 1;

		const progression = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
		return Math.round(progression);
	};

	const calculateDaysRemaining = (metadata) => {
		if (!metadata) return 0;
		const endDate = new Date(metadata.endDate);
		const now = new Date();
		const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
		return Math.max(0, daysRemaining);
	};

	const calculateTotalBudget = (dailyBudget, startDate, endDate) => {
		const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
		return (dailyBudget * days).toFixed(2);
	};

	if (loading) {
		return (
			<div className="budget-detail-container">
				<p>Loading budget details...</p>
			</div>
		);
	}

	if (!budgetData?.metadata) {
		return (
			<div className="budget-detail-container">
				<header className="detail-header">
					<button className="btn-back" onClick={() => navigate("/dashboard")}>
						← Back to Dashboard
					</button>
				</header>
				<div className="empty-state">
					<h2>Budget Not Found</h2>
					<p>The budget plan you're looking for doesn't exist.</p>
					<button className="btn-dashboard" onClick={() => navigate("/dashboard")}>
						Return to Dashboard
					</button>
				</div>
			</div>
		);
	}

	const { metadata, daily } = budgetData;
	const progression = calculateProgression(metadata);
	const daysRemaining = calculateDaysRemaining(metadata);
	const totalBudget = calculateTotalBudget(daily, metadata.startDate, metadata.endDate);
	const startDate = new Date(metadata.startDate);
	const endDate = new Date(metadata.endDate);

	return (
		<div className="budget-detail-container">
			{/* Header */}
			<header className="detail-header">
				<button className="btn-back" onClick={() => navigate("/dashboard")}>
					← Back to Dashboard
				</button>
				<h1>Budget Plan Details</h1>
			</header>

			{/* Main Card */}
			<main className="detail-content">
				<div className="detail-card">
					{/* Plan Overview */}
					<section className="plan-overview">
						<div className="overview-header">
							<h2>{metadata.name}</h2>
							<span className="badge-active">Active</span>
						</div>
						<p className="plan-reason">{metadata.reason}</p>
					</section>

					{/* Timeline Section */}
					<section className="timeline-section">
						<h3>Timeline</h3>
						<div className="timeline-grid">
							<div className="timeline-item">
								<span className="label">Start Date</span>
								<span className="value">{startDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
							</div>
							<div className="timeline-item">
								<span className="label">End Date</span>
								<span className="value">{endDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
							</div>
							<div className="timeline-item">
								<span className="label">Total Duration</span>
								<span className="value">{Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1} days</span>
							</div>
							<div className="timeline-item">
								<span className="label">Days Remaining</span>
								<span className="value">{daysRemaining} days</span>
							</div>
						</div>
					</section>

					{/* Progress Section */}
					<section className="progress-section">
						<h3>Progress</h3>
						<div className="progress-display">
							<div className="progress-bar-large">
								<div 
									className="progress-fill-large" 
									style={{ width: `${progression}%` }}
								></div>
							</div>
							<div className="progress-stats">
								<span className="stat-box">
									<span className="stat-percent">{progression}%</span>
									<span className="stat-label">Complete</span>
								</span>
								<span className="stat-box">
									<span className="stat-percent">{100 - progression}%</span>
									<span className="stat-label">Remaining</span>
								</span>
							</div>
						</div>
					</section>

					{/* Budget Breakdown */}
					<section className="budget-breakdown-section">
						<h3>Budget Breakdown</h3>
						<div className="breakdown-grid">
							{budgetBreakdown?.customBreakdown ? (
								// AI-generated breakdown
								Object.entries(budgetBreakdown.customBreakdown).map(([key, category]) => (
									<div key={key} className="breakdown-card">
										<span className="breakdown-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
										<span className="breakdown-amount">${category.amount?.toFixed(2) || "0.00"}</span>
										<span className="breakdown-sublabel">{category.percentage || 0}% of income</span>
										{category.description && (
											<span className="breakdown-description">{category.description}</span>
										)}
									</div>
								))
							) : (
								// Fallback to manual calculation
								<>
									<div className="breakdown-card">
										<span className="breakdown-label">Daily Budget</span>
										<span className="breakdown-amount">${daily}</span>
										<span className="breakdown-sublabel">per day</span>
									</div>
									<div className="breakdown-card">
										<span className="breakdown-label">Total Budget</span>
										<span className="breakdown-amount">${totalBudget}</span>
										<span className="breakdown-sublabel">for entire plan</span>
									</div>
									<div className="breakdown-card">
										<span className="breakdown-label">Budget Spent to Date</span>
										<span className="breakdown-amount">${(daily * (Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24)) + 1)).toFixed(2)}</span>
										<span className="breakdown-sublabel">estimated</span>
									</div>
									<div className="breakdown-card">
										<span className="breakdown-label">Budget Remaining</span>
										<span className="breakdown-amount">${(daily * daysRemaining).toFixed(2)}</span>
										<span className="breakdown-sublabel">estimated</span>
									</div>
								</>
							)}
						</div>
					</section>

					{/* AI Recommendations */}
					{budgetBreakdown?.recommendations && budgetBreakdown.recommendations.length > 0 && (
						<section className="recommendations-section">
							<h3>💡 AI Recommendations</h3>
							<div className="recommendations-list">
								{budgetBreakdown.recommendations.map((rec, idx) => (
									<div key={idx} className="recommendation-item">
										<span className="rec-icon">💰</span>
										<p>{rec}</p>
									</div>
								))}
							</div>
						</section>
					)}

					{/* AI Alerts */}
					{budgetBreakdown?.alerts && budgetBreakdown.alerts.length > 0 && (
						<section className="alerts-section">
							<h3>⚠️ Financial Alerts</h3>
							<div className="alerts-list">
								{budgetBreakdown.alerts.map((alert, idx) => (
									<div key={idx} className="alert-item">
										{alert}
									</div>
								))}
							</div>
						</section>
					)}

					{/* Creation Info */}
					{metadata.createdAt && (
						<section className="info-section">
							<p>Created on {new Date(metadata.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
						</section>
					)}

					{/* AI Reasoning */}
					{budgetBreakdown?.reasoning && (
						<section className="reasoning-section">
							<h3>📊 Why This Budget?</h3>
							<div className="reasoning-box">
								{budgetBreakdown.reasoning}
							</div>
							{budgetBreakdown.source && (
								<p className="source-label">Generated by {budgetBreakdown.source === 'ai' ? 'AI Analysis' : 'Local Algorithm'}</p>
							)}
						</section>
					)}
				</div>

				{/* Action Buttons */}
				<div className="action-buttons">
					<button className="btn-primary" onClick={() => navigate("/create-budget-plan")}>
						Create New Plan
					</button>
					<button className="btn-secondary" onClick={() => navigate("/budget-plans")}>
						View All Plans
					</button>
					<button className="btn-secondary" onClick={() => navigate("/profile")}>
						Go to Profile
					</button>
				</div>
			</main>

			{/* Footer */}
			<footer className="detail-footer">
				<p>&copy; 2025 Summit Funds. All rights reserved.</p>
			</footer>
		</div>
	);
}
