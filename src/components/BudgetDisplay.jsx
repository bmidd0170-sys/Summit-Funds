import { useState, useEffect } from "react";
import "../App.css";

export default function BudgetDisplay({
	budgetKey,
	metadata,
	breakdown,
	onClose,
}) {
	const [selectedCategory, setSelectedCategory] = useState(null);

	if (!metadata || !breakdown) {
		return null;
	}

	const isGenerating = metadata.generating === true;
	const hasError = metadata.generationError === true;

	// Calculate daily and weekly amounts
	const dailyBudget = breakdown.dailyBudget || breakdown.monthlyIncome / 30;
	const weeklyBudget = dailyBudget * 7;

	// Calculate goal-based metrics
	const hasGoal = metadata.goalType && metadata.goalType !== "skip";
	const totalMonthlyIncome = breakdown.monthlyIncome;

	// Parse dates
	const startDate = new Date(metadata.startDate);
	const endDate = new Date(metadata.endDate);
	const daysInPlan =
		Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
	const planTotalBudget = breakdown.monthlyIncome * (daysInPlan / 30);

	const categories = breakdown.customBreakdown || {};

	return (
		<div className="budget-display-container">
			<div className="budget-display-header">
				<div>
					<h2>{metadata.name}</h2>
					<p className="budget-reason">{metadata.reason}</p>
					<p className="budget-dates">
						{startDate.toLocaleDateString()} — {endDate.toLocaleDateString()}
					</p>
					{hasGoal && (
						<p className="budget-goal">
							{metadata.goalType === "total" &&
								`💰 Goal: Save $${metadata.monetaryGoal?.toLocaleString(
									"en-US",
									{ maximumFractionDigits: 2 }
								)}`}
							{metadata.goalType === "monthly" &&
								`📅 Goal: Save $${metadata.monthlyGoal?.toLocaleString(
									"en-US",
									{ maximumFractionDigits: 2 }
								)}/month`}
						</p>
					)}
				</div>
				<button
					className="close-btn"
					onClick={onClose}
					aria-label="Close budget display"
				>
					✕
				</button>
			</div>

			{isGenerating ? (
				<div className="budget-generating">
					<div className="loading-spinner"></div>
					<p>AI is generating your personalized budget breakdown...</p>
					<p className="generating-subtitle">This may take a few moments</p>
				</div>
			) : hasError ? (
				<div className="budget-error">
					<p>
						⚠️ We couldn't generate an AI budget breakdown, but your plan is
						saved!
					</p>
					<p>
						Try again later or use the Budget Plans page to manage your plan.
					</p>
				</div>
			) : (
				<>
					{/* Goal Achievement Section */}
					{hasGoal && breakdown.customBreakdown?.savings && (
						<div className="goal-achievement-section">
							<h3>🎯 Goal Progress</h3>
							<div className="goal-info">
								{metadata.goalType === "total" && (
									<div className="goal-details">
										<p>
											<strong>Monthly Savings Allocated:</strong> $
											{breakdown.customBreakdown.savings.amount?.toLocaleString(
												"en-US",
												{ maximumFractionDigits: 2 }
											) || 0}
										</p>
										<p>
											<strong>Savings Rate:</strong>{" "}
											{breakdown.customBreakdown.savings.percentage}% of income
										</p>
										<p>
											<strong>Goal Amount:</strong> $
											{metadata.monetaryGoal?.toLocaleString("en-US", {
												maximumFractionDigits: 2,
											})}
										</p>
										<p className="goal-note">
											📊 Budget adjusted to help you reach this goal
										</p>
									</div>
								)}
								{metadata.goalType === "monthly" && (
									<div className="goal-details">
										<p>
											<strong>Monthly Savings Allocated:</strong> $
											{breakdown.customBreakdown.savings.amount?.toLocaleString(
												"en-US",
												{ maximumFractionDigits: 2 }
											) || 0}
										</p>
										<p>
											<strong>Your Goal:</strong> $
											{metadata.monthlyGoal?.toLocaleString("en-US", {
												maximumFractionDigits: 2,
											})}
											/month
										</p>
										<p className="goal-status">
											{breakdown.customBreakdown.savings.amount >=
											metadata.monthlyGoal
												? "✅ On track to meet goal!"
												: "⚠️ Consider adjusting budget to meet goal"}
										</p>
										<p className="goal-note">
											💡 Ask the AI chatbot for tips to increase savings
										</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Summary Cards */}
					<div className="budget-summary-cards">
						<div className="summary-card">
							<div className="card-label">Monthly Income</div>
							<div className="card-amount">
								$
								{breakdown.monthlyIncome.toLocaleString("en-US", {
									maximumFractionDigits: 2,
								})}
							</div>
						</div>
						<div className="summary-card">
							<div className="card-label">Daily Budget</div>
							<div className="card-amount">
								$
								{dailyBudget.toLocaleString("en-US", {
									maximumFractionDigits: 2,
								})}
							</div>
						</div>
						<div className="summary-card">
							<div className="card-label">Weekly Budget</div>
							<div className="card-amount">
								$
								{weeklyBudget.toLocaleString("en-US", {
									maximumFractionDigits: 2,
								})}
							</div>
						</div>
						<div className="summary-card">
							<div className="card-label">Plan Total</div>
							<div className="card-amount">
								$
								{planTotalBudget.toLocaleString("en-US", {
									maximumFractionDigits: 2,
								})}
							</div>
						</div>
					</div>

					{/* Category Breakdown */}
					<div className="budget-breakdown">
						<h3>Budget Breakdown</h3>
						<div className="categories-grid">
							{Object.entries(categories).map(([categoryKey, category]) => {
								const percentage = category.percentage || 0;
								const amount = category.amount || 0;
								const isSelected = selectedCategory === categoryKey;

								return (
									<div
										key={categoryKey}
										className={`category-card ${isSelected ? "selected" : ""}`}
										onClick={() =>
											setSelectedCategory(isSelected ? null : categoryKey)
										}
									>
										<div className="category-header">
											<span className="category-name">
												{categoryKey.charAt(0).toUpperCase() +
													categoryKey.slice(1)}
											</span>
											<span className="category-percentage">{percentage}%</span>
										</div>
										<div className="category-amount">
											$
											{amount.toLocaleString("en-US", {
												maximumFractionDigits: 2,
											})}
										</div>
										<div className="category-progress-bar">
											<div
												className="progress-fill"
												style={{ width: `${percentage}%` }}
											></div>
										</div>
										{isSelected && category.description && (
											<div className="category-description">
												{category.description}
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>

					{/* Actual Spending (if available) */}
					{breakdown.actualCategorySpending && (
						<div className="actual-spending">
							<h3>Your Actual Monthly Spending</h3>
							<div className="spending-details">
								<div className="spending-grid">
									{Object.entries(breakdown.actualCategorySpending).map(
										([item, amount]) =>
											amount > 0 && (
												<div key={item} className="spending-item">
													<span className="spending-label">
														{item.charAt(0).toUpperCase() +
															item.slice(1).replace(/([A-Z])/g, " $1")}
													</span>
													<span className="spending-amount">
														$
														{parseFloat(amount).toLocaleString("en-US", {
															maximumFractionDigits: 2,
														})}
													</span>
												</div>
											)
									)}
								</div>
							</div>
						</div>
					)}

					{/* Recommendations */}
					{breakdown.recommendations &&
						breakdown.recommendations.length > 0 && (
							<div className="budget-recommendations">
								<h3>💡 Recommendations</h3>
								<ul className="recommendations-list">
									{breakdown.recommendations.map((rec, idx) => (
										<li key={idx}>{rec}</li>
									))}
								</ul>
							</div>
						)}

					{/* Alerts */}
					{breakdown.alerts && breakdown.alerts.length > 0 && (
						<div className="budget-alerts">
							<h3>Alerts</h3>
							<div className="alerts-list">
								{breakdown.alerts.map((alert, idx) => (
									<div key={idx} className="alert-item">
										{alert}
									</div>
								))}
							</div>
						</div>
					)}

					{/* Reasoning */}
					{breakdown.reasoning && (
						<div className="budget-reasoning">
							<h3>Why This Budget For You</h3>
							<p>{breakdown.reasoning}</p>
						</div>
					)}
				</>
			)}
		</div>
	);
}
