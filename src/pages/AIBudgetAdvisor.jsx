import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { generateDailySpendingBreakdown } from "../services/aiSpendingService";
import { generateCustomBudget } from "../services/customBudgetService";
import BudgetChatbot from "../components/BudgetChatbot";
import "../App.css";

export default function AIBudgetAdvisor() {
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	const [userProfile, setUserProfile] = useState(null);
	const [budgetBreakdown, setBudgetBreakdown] = useState(null);
	const [budgetHistory, setBudgetHistory] = useState({});
	const [loading, setLoading] = useState(true);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [dailySpending, setDailySpending] = useState(null);
	const [loadingDaily, setLoadingDaily] = useState(false);
	const [view, setView] = useState("monthly"); // "monthly" or "daily"

	useEffect(() => {
		// Load user profile and budget history from localStorage
		const savedProfile = localStorage.getItem("userProfile");
		if (savedProfile) {
			const profile = JSON.parse(savedProfile);
			setUserProfile(profile);
			generateAIBudget(profile);
		}

		const savedBudgetHistory = localStorage.getItem("budgetHistory");
		if (savedBudgetHistory) {
			setBudgetHistory(JSON.parse(savedBudgetHistory));
		}

		setLoading(false);
	}, []);

	// Load daily spending when view changes or date changes
	useEffect(() => {
		if (view === "daily" && userProfile && budgetBreakdown) {
			loadDailySpending();
		}
	}, [view, selectedDate, userProfile, budgetBreakdown]);

	const loadDailySpending = async () => {
		setLoadingDaily(true);
		try {
			const spending = await generateDailySpendingBreakdown(
				userProfile,
				selectedDate,
				budgetBreakdown.dailyBudget
			);
			setDailySpending(spending);
		} catch (error) {
			console.error("Error loading daily spending:", error);
		} finally {
			setLoadingDaily(false);
		}
	};

	// Generate AI-based custom budget recommendation based on complete profile
	const generateAIBudget = async (profile) => {
		if (!profile || !profile.monthlyIncome) return;

		try {
			const customBudget = await generateCustomBudget(profile);

			// Calculate actual spending categories
			const essentialsActual =
				(parseFloat(profile.housing) || 0) +
				(parseFloat(profile.utilities) || 0) +
				(parseFloat(profile.groceries) || 0) +
				(parseFloat(profile.transportation) || 0) +
				(parseFloat(profile.insurance) || 0) +
				(parseFloat(profile.phone) || 0) +
				(parseFloat(profile.internet) || 0);

			const discretionaryActual =
				(parseFloat(profile.dining) || 0) +
				(parseFloat(profile.entertainment) || 0) +
				(parseFloat(profile.subscriptions) || 0) +
				(parseFloat(profile.shopping) || 0) +
				(parseFloat(profile.gym) || 0);

			const debtActual =
				(parseFloat(profile.creditCardPayment) || 0) +
				(parseFloat(profile.studentLoan) || 0) +
				(parseFloat(profile.personalLoan) || 0);

			const totalActual = essentialsActual + discretionaryActual + debtActual;
			const monthlyIncome = parseFloat(profile.monthlyIncome) || 0;
			const remaining = monthlyIncome - totalActual;

			setBudgetBreakdown({
				monthlyIncome,
				dailyBudget: customBudget.dailyBudget,
				recommended: customBudget.customBreakdown,
				actual: {
					essentials: parseFloat(essentialsActual.toFixed(2)),
					discretionary: parseFloat(discretionaryActual.toFixed(2)),
					debt: parseFloat(debtActual.toFixed(2)),
					total: parseFloat(totalActual.toFixed(2)),
				},
				remaining: parseFloat(remaining.toFixed(2)),
				recommendations: customBudget.recommendations,
				alerts: customBudget.alerts,
				reasoning: customBudget.reasoning,
				customBreakdownDetails: customBudget.customBreakdown,
			});
		} catch (error) {
			console.error("Error generating AI budget:", error);
			// Fallback to basic structure
			const monthlyIncome = parseFloat(profile.monthlyIncome) || 0;
			const dailyBudget = monthlyIncome / 30;

			const essentialsActual =
				(parseFloat(profile.housing) || 0) +
				(parseFloat(profile.utilities) || 0) +
				(parseFloat(profile.groceries) || 0) +
				(parseFloat(profile.transportation) || 0) +
				(parseFloat(profile.insurance) || 0) +
				(parseFloat(profile.phone) || 0) +
				(parseFloat(profile.internet) || 0);

			const discretionaryActual =
				(parseFloat(profile.dining) || 0) +
				(parseFloat(profile.entertainment) || 0) +
				(parseFloat(profile.subscriptions) || 0) +
				(parseFloat(profile.shopping) || 0) +
				(parseFloat(profile.gym) || 0);

			const debtActual =
				(parseFloat(profile.creditCardPayment) || 0) +
				(parseFloat(profile.studentLoan) || 0) +
				(parseFloat(profile.personalLoan) || 0);

			const totalActual = essentialsActual + discretionaryActual + debtActual;
			const remaining = monthlyIncome - totalActual;

			setBudgetBreakdown({
				monthlyIncome,
				dailyBudget: parseFloat(dailyBudget.toFixed(2)),
				recommended: {
					essentials: {
						percentage: 50,
						amount: parseFloat((dailyBudget * 0.5).toFixed(2)),
					},
					discretionary: {
						percentage: 30,
						amount: parseFloat((dailyBudget * 0.3).toFixed(2)),
					},
					savings: {
						percentage: 20,
						amount: parseFloat((dailyBudget * 0.2).toFixed(2)),
					},
				},
				actual: {
					essentials: parseFloat(essentialsActual.toFixed(2)),
					discretionary: parseFloat(discretionaryActual.toFixed(2)),
					debt: parseFloat(debtActual.toFixed(2)),
					total: parseFloat(totalActual.toFixed(2)),
				},
				remaining: parseFloat(remaining.toFixed(2)),
			});
		}
	};

	// Calculate stats from budget history
	const calculateBudgetStats = () => {
		const dates = Object.keys(budgetHistory);
		if (dates.length === 0) return null;

		const budgets = Object.values(budgetHistory).map((v) => parseFloat(v));
		const average = budgets.reduce((a, b) => a + b, 0) / budgets.length;
		const highest = Math.max(...budgets);
		const lowest = Math.min(...budgets);

		return {
			totalDays: dates.length,
			averageBudget: parseFloat(average.toFixed(2)),
			highestBudget: parseFloat(highest.toFixed(2)),
			lowestBudget: parseFloat(lowest.toFixed(2)),
		};
	};

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/");
		} catch (err) {
			console.error("Logout failed:", err);
		}
	};

	const formatDate = (date) => {
		const options = {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		return new Date(date).toLocaleDateString("en-US", options);
	};

	const handlePreviousDay = () => {
		const newDate = new Date(selectedDate);
		newDate.setMonth(newDate.getMonth() - 1);
		setSelectedDate(newDate);
	};

	const handleNextDay = () => {
		const newDate = new Date(selectedDate);
		newDate.setMonth(newDate.getMonth() + 1);
		setSelectedDate(newDate);
	};

	const handleTodayClick = () => {
		setSelectedDate(new Date());
	};

	// Calendar helper functions
	const generateCalendarDays = () => {
		const year = selectedDate.getFullYear();
		const month = selectedDate.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const daysInMonth = lastDay.getDate();
		const startingDayOfWeek = firstDay.getDay();

		const days = [];

		// Add previous month's days
		const prevMonthLastDay = new Date(year, month, 0).getDate();
		for (let i = startingDayOfWeek - 1; i >= 0; i--) {
			days.push({
				date: new Date(year, month - 1, prevMonthLastDay - i),
				isCurrentMonth: false,
			});
		}

		// Add current month's days
		for (let i = 1; i <= daysInMonth; i++) {
			days.push({
				date: new Date(year, month, i),
				isCurrentMonth: true,
			});
		}

		// Add next month's days
		const remainingDays = 42 - days.length;
		for (let i = 1; i <= remainingDays; i++) {
			days.push({
				date: new Date(year, month + 1, i),
				isCurrentMonth: false,
			});
		}

		return days;
	};

	const isToday = (date) => {
		const today = new Date();
		return (
			date.getDate() === today.getDate() &&
			date.getMonth() === today.getMonth() &&
			date.getFullYear() === today.getFullYear()
		);
	};

	const isSameDay = (date1, date2) => {
		return (
			date1.getDate() === date2.getDate() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getFullYear() === date2.getFullYear()
		);
	};

	const budgetStats = calculateBudgetStats();

	if (loading) {
		return (
			<div className="ai-advisor-container">
				<p>Loading...</p>
			</div>
		);
	}

	return (
		<div className="ai-advisor-container">
			{/* Header */}
			<header className="advisor-header">
				<div className="header-left">
					<button
						className="logo logo-btn"
						onClick={() => navigate("/dashboard")}
					>
						💰 Summit Funds
					</button>
					<div className="header-title">
						<h1>AI Budget Advisor</h1>
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

			{/* View Toggle */}
			{!loading && userProfile && budgetBreakdown && (
				<div className="view-toggle-section">
					<div className="view-toggle">
						<button
							className={`toggle-btn ${view === "monthly" ? "active" : ""}`}
							onClick={() => setView("monthly")}
						>
							📊 Monthly Overview
						</button>
						<button
							className={`toggle-btn ${view === "daily" ? "active" : ""}`}
							onClick={() => setView("daily")}
						>
							📅 Daily Schedule
						</button>
					</div>
				</div>
			)}

			{/* Main Content */}
			<main className="advisor-main">
				{!userProfile || !budgetBreakdown ? (
					<div className="no-data-section">
						<div className="no-data-card">
							<div className="no-data-icon">📊</div>
							<h2>No Financial Data</h2>
							<p>
								Complete your financial profile to get personalized AI budget
								insights.
							</p>
							<button
								className="btn-go-profile"
								onClick={() => navigate("/financial-profile")}
							>
								📋 Go to Financial Profile
							</button>
						</div>
					</div>
				) : (
					<>
						{view === "monthly" && (
							<>
								{/* AI Budget Chatbot */}
								<BudgetChatbot
									userProfile={userProfile}
									dailyBudget={budgetBreakdown.dailyBudget}
									selectedDate={selectedDate}
								/>

								{/* Budget Breakdown Comparison */}
								<section className="breakdown-comparison-section">
									<div className="comparison-container">
										{/* Recommended vs Actual */}
										<div className="comparison-card">
											<h3>💡 Recommended vs Actual Spending</h3>

											<div className="category-comparison">
												<div className="category-item">
													<span className="category-name">🏠 Essentials</span>
													<div className="comparison-bars">
														<div className="bar-group">
															<div
																className="bar recommended"
																style={{
																	width: `${Math.min(
																		((budgetBreakdown.recommended.essentials
																			?.amount ||
																			budgetBreakdown.recommended.essentials) /
																			budgetBreakdown.monthlyIncome) *
																			100,
																		100
																	)}%`,
																}}
															></div>
															<span className="bar-label">
																$
																{(
																	budgetBreakdown.recommended.essentials
																		?.amount ||
																	(typeof budgetBreakdown.recommended
																		.essentials === "number"
																		? budgetBreakdown.recommended.essentials
																		: 0)
																).toFixed(2)}
																/mo (Recommended)
															</span>
														</div>
														<div className="bar-group">
															<div
																className="bar actual"
																style={{
																	width: `${Math.min(
																		(budgetBreakdown.actual.discretionary /
																			budgetBreakdown.monthlyIncome) *
																			100,
																		100
																	)}%`,
																}}
															></div>
															<span className="bar-label">
																$
																{Number(
																	budgetBreakdown.actual.discretionary
																).toFixed(2)}
																/mo (Actual)
															</span>
														</div>
													</div>
												</div>

												<div className="category-item">
													<span className="category-name">
														🎉 Discretionary
													</span>
													<div className="comparison-bars">
														<div className="bar-group">
															<div
																className="bar recommended"
																style={{
																	width: `${Math.min(
																		((budgetBreakdown.recommended.discretionary
																			?.amount ||
																			budgetBreakdown.recommended
																				.discretionary) /
																			budgetBreakdown.monthlyIncome) *
																			100,
																		100
																	)}%`,
																}}
															></div>
															<span className="bar-label">
																$
																{(
																	budgetBreakdown.recommended.discretionary
																		?.amount ||
																	(typeof budgetBreakdown.recommended
																		.discretionary === "number"
																		? budgetBreakdown.recommended.discretionary
																		: 0)
																).toFixed(2)}
																/mo (Recommended)
															</span>
														</div>
														<div className="bar-group">
															<div
																className="bar actual"
																style={{
																	width: `${Math.min(
																		(budgetBreakdown.actual.discretionary /
																			budgetBreakdown.monthlyIncome) *
																			100,
																		100
																	)}%`,
																}}
															></div>
															<span className="bar-label">
																$
																{budgetBreakdown.actual.discretionary.toFixed(
																	2
																)}
																/mo (Actual)
															</span>
														</div>
													</div>
												</div>

												<div className="category-item">
													<span className="category-name">
														💰 Savings Target
													</span>
													<div className="comparison-bars">
														<div className="bar-group">
															<div
																className="bar recommended"
																style={{
																	width: `${Math.min(
																		((budgetBreakdown.recommended.savings
																			?.amount ||
																			budgetBreakdown.recommended.savings) /
																			budgetBreakdown.monthlyIncome) *
																			100,
																		100
																	)}%`,
																}}
															></div>
															<span className="bar-label">
																$
																{(
																	budgetBreakdown.recommended.savings?.amount ||
																	(typeof budgetBreakdown.recommended
																		.savings === "number"
																		? budgetBreakdown.recommended.savings
																		: 0)
																).toFixed(2)}
																/mo (Recommended)
															</span>
														</div>
													</div>
												</div>
											</div>
										</div>

										{/* Budget History Stats */}
										{budgetStats && (
											<div className="stats-card">
												<h3>📈 Your Budget Planning Stats</h3>
												<div className="stats-grid">
													<div className="stat-item">
														<span className="stat-label">Days Planned</span>
														<span className="stat-value">
															{budgetStats.totalDays}
														</span>
													</div>
													<div className="stat-item">
														<span className="stat-label">Average Budget</span>
														<span className="stat-value">
															${budgetStats.averageBudget}
														</span>
													</div>
													<div className="stat-item">
														<span className="stat-label">Highest Limit</span>
														<span className="stat-value">
															${budgetStats.highestBudget}
														</span>
													</div>
													<div className="stat-item">
														<span className="stat-label">Lowest Limit</span>
														<span className="stat-value">
															${budgetStats.lowestBudget}
														</span>
													</div>
												</div>
											</div>
										)}
									</div>
								</section>

								{/* AI Recommendations */}
								<section className="recommendations-section">
									<div className="recommendations-card">
										<h3>🎯 AI Budget Recommendations</h3>
										<div className="recommendations-list">
											{budgetBreakdown.actual.essentials >
												budgetBreakdown.monthlyIncome * 0.5 && (
												<div className="recommendation-item warning">
													<span className="rec-icon">⚠️</span>
													<div className="rec-content">
														<span className="rec-title">
															Essential Expenses High
														</span>
														<span className="rec-text">
															Your essential expenses are above the recommended
															50%. Consider reducing housing, utilities, or
															transportation costs.
														</span>
													</div>
												</div>
											)}

											{budgetBreakdown.actual.discretionary >
												budgetBreakdown.monthlyIncome * 0.3 && (
												<div className="recommendation-item warning">
													<span className="rec-icon">💡</span>
													<div className="rec-content">
														<span className="rec-title">
															Cut Discretionary Spending
														</span>
														<span className="rec-text">
															Your discretionary spending exceeds 30%. Reduce
															dining, entertainment, or subscriptions to save
															more.
														</span>
													</div>
												</div>
											)}

											{budgetBreakdown.remaining < 0 && (
												<div className="recommendation-item error">
													<span className="rec-icon">🚨</span>
													<div className="rec-content">
														<span className="rec-title">
															Overspending Alert
														</span>
														<span className="rec-text">
															You're spending more than your monthly income.
															Review your expenses immediately and adjust your
															budget.
														</span>
													</div>
												</div>
											)}

											{budgetBreakdown.remaining >= 0 &&
												budgetBreakdown.actual.essentials <=
													budgetBreakdown.monthlyIncome * 0.5 &&
												budgetBreakdown.actual.discretionary <=
													budgetBreakdown.monthlyIncome * 0.3 && (
													<div className="recommendation-item success">
														<span className="rec-icon">✨</span>
														<div className="rec-content">
															<span className="rec-title">
																Great Budget Balance!
															</span>
															<span className="rec-text">
																You're on track with the 50/30/20 rule. Keep up
																with your budgeting and continue saving
																consistently.
															</span>
														</div>
													</div>
												)}
										</div>
									</div>
								</section>

								{/* Action Buttons */}
								<div className="action-buttons">
									<button
										className="btn-back-calendar"
										onClick={() => navigate("/dashboard")}
									>
										📅 Back to Calendar
									</button>
									<button
										className="btn-edit-profile"
										onClick={() => navigate("/financial-profile")}
									>
										✏️ Edit Financial Profile
									</button>
								</div>
							</>
						)}

						{view === "daily" && (
							<section className="daily-spending-section">
								{/* Calendar Navigation */}
								<div className="calendar-navigation">
									<button className="nav-btn" onClick={handlePreviousDay}>
										← Previous Month
									</button>
									<div className="month-display">
										<h2>
											{selectedDate.toLocaleDateString("en-US", {
												month: "long",
												year: "numeric",
											})}
										</h2>
										<button className="today-btn" onClick={handleTodayClick}>
											Today
										</button>
									</div>
									<button className="nav-btn" onClick={handleNextDay}>
										Next Month →
									</button>
								</div>

								{/* Calendar Grid */}
								<div className="calendar-container">
									<div className="calendar-header">
										<div className="day-name">Sun</div>
										<div className="day-name">Mon</div>
										<div className="day-name">Tue</div>
										<div className="day-name">Wed</div>
										<div className="day-name">Thu</div>
										<div className="day-name">Fri</div>
										<div className="day-name">Sat</div>
									</div>
									<div className="calendar-days">
										{generateCalendarDays().map((day, index) => (
											<div
												key={index}
												className={`calendar-day ${
													day.isCurrentMonth ? "" : "other-month"
												} ${isToday(day.date) ? "today" : ""} ${
													isSameDay(day.date, selectedDate) ? "selected" : ""
												}`}
												onClick={() => setSelectedDate(day.date)}
											>
												<div className="day-number">{day.date.getDate()}</div>
												<div className="day-budget">
													${budgetBreakdown.dailyBudget.toFixed(0)}
												</div>
												<div className="day-status">
													{isToday(day.date) ? "Today" : ""}
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Selected Day Details */}
								{loadingDaily ? (
									<div className="loading-container">
										<p>
											Loading spending plan for {formatDate(selectedDate)}...
										</p>
									</div>
								) : dailySpending ? (
									<>
										{/* Day Card Header */}
										<div className="day-card-header">
											<div className="header-left">
												<h3 className="selected-date">
													{formatDate(selectedDate)}
												</h3>
												<p className="day-type">
													{dailySpending.dayType === "weekend"
														? "🎉 Weekend"
														: "💼 Weekday"}
												</p>
											</div>
											<div className="header-right">
												<div className="daily-amount">
													${dailySpending.totalProjected.toFixed(2)}
												</div>
												<p className="amount-label">Daily Budget</p>
											</div>
										</div>

										{/* Economic Context Banner */}
										<div className="economic-banner">
											<span className="context-icon">🌍</span>
											<p className="context-text">
												{dailySpending.economicContext}
											</p>
										</div>

										{/* Day Overview */}
										<div className="daily-overview-card">
											<h3>📋 Spending Plan</h3>
											<p className="day-overview">
												{dailySpending.dayOverview}
											</p>

											<div className="daily-summary-grid">
												<div className="summary-item">
													<span className="summary-label">Total Budget</span>
													<span className="summary-value">
														${dailySpending.totalProjected.toFixed(2)}
													</span>
												</div>
												<div className="summary-item">
													<span className="summary-label">
														Potential Savings
													</span>
													<span className="summary-value positive">
														${dailySpending.savings.toFixed(2)}
													</span>
												</div>
												<div className="summary-item">
													<span className="summary-label">
														Projected Spending
													</span>
													<span className="summary-value">
														$
														{(
															dailySpending.totalProjected -
															dailySpending.savings
														).toFixed(2)}
													</span>
												</div>
											</div>
										</div>

										{/* Time Periods */}
										<div className="time-periods-container">
											<h3>⏰ Suggested Spending by Period</h3>
											<div className="periods-grid">
												{dailySpending.timeSlots.map((slot, index) => (
													<div key={index} className="period-card">
														<div className="period-header">
															<span className="period-title">
																{slot.period}
															</span>
															<span className="period-time">
																{slot.timeRange}
															</span>
														</div>
														<div className="period-amount">
															${slot.suggestedAmount.toFixed(2)}
														</div>
														<div className="period-activity">
															<p>{slot.activity}</p>
														</div>
														<div className="period-tips">
															{slot.tips.map((tip, tipIndex) => (
																<div key={tipIndex} className="tip-badge">
																	{tip}
																</div>
															))}
														</div>
													</div>
												))}
											</div>
										</div>

										{/* Budget Breakdown - 50/30/20 */}
										<div className="breakdown-section">
											<h3>📊 Budget Breakdown (50/30/20 Rule)</h3>
											<div className="breakdown-grid">
												<div className="breakdown-item essentials">
													<div className="breakdown-header">
														<span className="breakdown-label">
															🏠 Essentials (50%)
														</span>
														<span className="breakdown-amount">
															$
															{dailySpending.essentialBreakdown.amount.toFixed(
																2
															)}
														</span>
													</div>
													<div className="breakdown-bar">
														<div
															className="bar-fill essentials"
															style={{ width: "50%" }}
														></div>
													</div>
													<p className="breakdown-desc">
														Housing, food, transportation, insurance
													</p>
												</div>

												<div className="breakdown-item discretionary">
													<div className="breakdown-header">
														<span className="breakdown-label">
															🎉 Discretionary (30%)
														</span>
														<span className="breakdown-amount">
															$
															{dailySpending.discretionaryBreakdown.amount.toFixed(
																2
															)}
														</span>
													</div>
													<div className="breakdown-bar">
														<div
															className="bar-fill discretionary"
															style={{ width: "30%" }}
														></div>
													</div>
													<p className="breakdown-desc">
														Entertainment, dining, subscriptions, shopping
													</p>
												</div>

												<div className="breakdown-item savings">
													<div className="breakdown-header">
														<span className="breakdown-label">
															💰 Savings (20%)
														</span>
														<span className="breakdown-amount">
															$
															{dailySpending.savingsBreakdown.amount.toFixed(2)}
														</span>
													</div>
													<div className="breakdown-bar">
														<div
															className="bar-fill savings"
															style={{ width: "20%" }}
														></div>
													</div>
													<p className="breakdown-desc">
														Emergency fund, investments, financial security
													</p>
												</div>
											</div>
										</div>

										{/* Tips & Insights */}
										<div className="tips-section">
											<h3>💡 Daily Tips</h3>
											<div className="tips-grid">
												<div className="tip-card">
													<h4>✨ Smart Spending</h4>
													<ul>
														<li>
															Plan meals in advance to avoid impulse food
															spending
														</li>
														<li>
															Use cash for discretionary items to track spending
															better
														</li>
														<li>
															Avoid shopping during peak hours when emotions are
															high
														</li>
														<li>Review transactions before bed</li>
													</ul>
												</div>
												<div className="tip-card">
													<h4>📈 Build Good Habits</h4>
													<ul>
														<li>Log every transaction immediately</li>
														<li>Set daily spending reminders</li>
														<li>Celebrate days when you stay under budget</li>
														<li>Adjust tomorrow based on today's spending</li>
													</ul>
												</div>
											</div>
										</div>
									</>
								) : (
									<div className="loading-container">
										<p>Unable to load spending plan</p>
									</div>
								)}
							</section>
						)}
					</>
				)}
			</main>

			{/* Footer */}
			<footer className="advisor-footer">
				<p>&copy; 2025 Summit Funds. All rights reserved.</p>
			</footer>
		</div>
	);
}
