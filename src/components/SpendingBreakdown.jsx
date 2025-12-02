import { useState, useEffect } from "react";
import { generateDailySpendingBreakdown } from "../services/aiSpendingService";
import "../styles/SpendingBreakdown.css";

export default function SpendingBreakdown({ userProfile, selectedDate, dailyBudget }) {
	const [spending, setSpending] = useState(null);
	const [loading, setLoading] = useState(false);
	const [expanded, setExpanded] = useState(false);

	useEffect(() => {
		if (!userProfile || !dailyBudget) return;

		const fetchSpendingBreakdown = async () => {
			setLoading(true);
			try {
				const breakdown = await generateDailySpendingBreakdown(
					userProfile,
					selectedDate,
					dailyBudget
				);
				setSpending(breakdown);
			} catch (error) {
				console.error("Error fetching spending breakdown:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchSpendingBreakdown();
	}, [userProfile, selectedDate, dailyBudget]);

	if (!spending && !loading) {
		return null;
	}

	return (
		<div className="spending-breakdown">
			<div className="breakdown-header">
				<button
					className="toggle-breakdown"
					onClick={() => setExpanded(!expanded)}
				>
					{expanded ? "▼" : "▶"} AI Spending Schedule for{" "}
					{selectedDate.toLocaleDateString("en-US", {
						weekday: "short",
						month: "short",
						day: "numeric",
					})}
				</button>
				{spending?.source === "ai" && (
					<span className="ai-badge">🤖 AI Powered</span>
				)}
			</div>

			{expanded && (
				<div className="breakdown-content">
					{loading ? (
						<div className="loading">
							<p>Generating AI spending plan...</p>
						</div>
					) : spending ? (
						<>
							<div className="day-overview">
								<p>{spending.dayOverview}</p>
							</div>

							{/* Budget Breakdown Summary */}
							<div className="budget-summary">
								<div className="summary-item essentials">
									<span className="summary-label">🏠 Essentials</span>
									<span className="summary-value">
										${spending.essentialBreakdown.amount} (
										{spending.essentialBreakdown.percentage}%)
									</span>
								</div>
								<div className="summary-item discretionary">
									<span className="summary-label">🎉 Discretionary</span>
									<span className="summary-value">
										${spending.discretionaryBreakdown.amount} (
										{spending.discretionaryBreakdown.percentage}%)
									</span>
								</div>
								<div className="summary-item savings">
									<span className="summary-label">💰 Savings</span>
									<span className="summary-value">
										${spending.savingsBreakdown.amount} (
										{spending.savingsBreakdown.percentage}%)
									</span>
								</div>
							</div>

							{/* Time Slots */}
							<div className="time-slots">
								<h4>Hourly Spending Plan</h4>
								{spending.timeSlots.map((slot, index) => (
									<div key={index} className="time-slot">
										<div className="slot-header">
											<span className="slot-time">
												{slot.timeRange}
											</span>
											<span className="slot-period">
												{slot.period}
											</span>
											<span className="slot-amount">
												${slot.suggestedAmount.toFixed(2)}
											</span>
										</div>
										<div className="slot-activity">
											{slot.activity}
										</div>
										{slot.tips && slot.tips.length > 0 && (
											<div className="slot-tips">
												<strong>Tips:</strong>
												<ul>
													{slot.tips.map((tip, i) => (
														<li key={i}>{tip}</li>
													))}
												</ul>
											</div>
										)}
									</div>
								))}
							</div>

							{/* Total Summary */}
							<div className="total-summary">
								<div className="summary-row">
									<span>Total Projected Spending</span>
									<span className="amount">
										${spending.totalProjected.toFixed(2)}
									</span>
								</div>
								<div className="summary-row">
									<span>Daily Budget</span>
									<span className="amount">${dailyBudget}</span>
								</div>
								<div
									className={`summary-row savings ${
										spending.savings >= 0 ? "positive" : "negative"
									}`}
								>
									<span>Remaining</span>
									<span className="amount">
										${spending.savings.toFixed(2)}
									</span>
								</div>
							</div>
						</>
					) : null}
				</div>
			)}
		</div>
	);
}
