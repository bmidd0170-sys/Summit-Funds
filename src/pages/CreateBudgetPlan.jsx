import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { delayApiCall } from "../services/rateLimiter";
import { generateCustomBudget } from "../services/customBudgetService";
import "../styles/CreateBudgetPlan.css";

export default function CreateBudgetPlan() {
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	const [step, setStep] = useState("name"); // "name", "goal", "dates", "review"
	const [budgetName, setBudgetName] = useState("");
	const [budgetReason, setBudgetReason] = useState("");
	const [goalType, setGoalType] = useState("skip"); // "total", "monthly", or "skip"
	const [monetaryGoal, setMonetaryGoal] = useState("");
	const [monthlyGoal, setMonthlyGoal] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [userProfile, setUserProfile] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [maxEndDate, setMaxEndDate] = useState("");
	const [estimatedData, setEstimatedData] = useState(null);

	useEffect(() => {
		// Load user profile and set initial dates
		const savedProfile = localStorage.getItem("userProfile");
		if (savedProfile) {
			setUserProfile(JSON.parse(savedProfile));
		}

		// Set today as start date
		const today = new Date();
		const todayString = today.toISOString().split("T")[0];
		setStartDate(todayString);

		// Calculate max end date based on financial profile
		// Default to 12 months from today if no data
		const maxDate = new Date(today);
		maxDate.setMonth(maxDate.getMonth() + 12);
		const maxDateString = maxDate.toISOString().split("T")[0];
		setMaxEndDate(maxDateString);
	}, []);

	// Validate monetary goal
	const validateMonetaryGoal = (goal) => {
		if (!goal || goal.trim() === "") {
			return "";
		}
		const numValue = parseFloat(goal);
		if (isNaN(numValue)) {
			return "Monetary goal must be a valid number";
		}
		if (numValue <= 0) {
			return "Monetary goal must be greater than 0";
		}
		return "";
	};

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/");
		} catch (err) {
			console.error("Logout failed:", err);
		}
	};

	// Step 1: Name and Reason
	const handleNameSubmit = (e) => {
		e.preventDefault();
		setError("");

		if (!budgetName.trim()) {
			setError("Please enter a budget name");
			return;
		}

		if (budgetName.length > 50) {
			setError("Budget name must be 50 characters or less");
			return;
		}

		setStep("goal");
	};

	// Step 2: Monetary Goal
	const handleGoalSubmit = (e) => {
		e.preventDefault();
		setError("");

		if (goalType === "total" && !monetaryGoal) {
			setError("Please enter a monetary goal or select 'Skip'");
			return;
		}

		if (goalType === "monthly" && !monthlyGoal) {
			setError("Please enter a monthly goal or select 'Skip'");
			return;
		}

		const goalToValidate = goalType === "total" ? monetaryGoal : monthlyGoal;
		const goalError = validateMonetaryGoal(goalToValidate);
		if (goalToValidate && goalError) {
			setError(goalError);
			return;
		}

		setStep("dates");
	};

	// Step 3: Date Selection
	const handleDateSubmit = (e) => {
		e.preventDefault();
		setError("");

		if (!endDate) {
			setError("Please select an end date");
			return;
		}

		const start = new Date(startDate);
		const end = new Date(endDate);
		const today = new Date();

		if (end <= start) {
			setError("End date must be after start date");
			return;
		}

		if (end.getTime() > new Date(maxEndDate).getTime()) {
			setError("End date cannot exceed the realistic planning limit");
			return;
		}

		// Calculate duration
		const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
		const durationMonths = Math.ceil(durationDays / 30);

		if (durationMonths > 12) {
			setError("Budget plan duration cannot exceed 12 months");
			return;
		}

		setEstimatedData({
			durationDays,
			durationMonths,
		});

		setStep("review");
	};

	// Step 3: Review and Create
	const handleCreateBudget = async () => {
		try {
			setLoading(true);
			setError("");

			// Format dates for storage
			const dateKey = new Date(startDate).toISOString().split("T")[0];

			// Save budget metadata with generating status
			const budgetMetadata = localStorage.getItem("budgetMetadata");
			const metadata = budgetMetadata ? JSON.parse(budgetMetadata) : {};

			metadata[dateKey] = {
				name: budgetName,
				reason: budgetReason,
				goalType: goalType,
				monetaryGoal: goalType === "total" && monetaryGoal ? parseFloat(monetaryGoal) : null,
				monthlyGoal: goalType === "monthly" && monthlyGoal ? parseFloat(monthlyGoal) : null,
				startDate,
				endDate,
				createdAt: new Date().toISOString(),
				status: "active",
				generating: true, // AI is generating the breakdown
			};

			localStorage.setItem("budgetMetadata", JSON.stringify(metadata));

			// Redirect immediately to dashboard
			navigate("/dashboard", {
				state: { message: "Budget plan created! AI is generating your budget breakdown..." },
			});

			// Generate budget in background (non-blocking)
			if (userProfile && userProfile.monthlyIncome) {
				try {
					console.log("Starting budget generation...");
					const budgetBreakdown = await generateCustomBudget(userProfile, {
						goalType: goalType,
						monetaryGoal: goalType === "total" && monetaryGoal ? parseFloat(monetaryGoal) : null,
						monthlyGoal: goalType === "monthly" && monthlyGoal ? parseFloat(monthlyGoal) : null,
						budgetName,
						budgetReason,
						startDate,
						endDate,
					});
					console.log("Budget generation complete:", budgetBreakdown);
					
					// Validate the breakdown
					if (!budgetBreakdown || !budgetBreakdown.customBreakdown) {
						console.error("Invalid budget breakdown structure:", budgetBreakdown);
						throw new Error("Budget breakdown missing customBreakdown");
					}
					
					// Save the generated budget breakdown
					const budgetBreakdowns = localStorage.getItem("budgetBreakdowns");
					const breakdowns = budgetBreakdowns ? JSON.parse(budgetBreakdowns) : {};
					
					breakdowns[dateKey] = {
						...budgetBreakdown,
						planName: budgetName,
						planReason: budgetReason,
						goalType: goalType,
						monetaryGoal: goalType === "total" && monetaryGoal ? parseFloat(monetaryGoal) : null,
						monthlyGoal: goalType === "monthly" && monthlyGoal ? parseFloat(monthlyGoal) : null,
					};
					
					console.log("Saving budget to localStorage under key:", dateKey);
					localStorage.setItem("budgetBreakdowns", JSON.stringify(breakdowns));

					// Update metadata to mark as complete
					metadata[dateKey].generating = false;
					localStorage.setItem("budgetMetadata", JSON.stringify(metadata));

					// Trigger storage event to notify dashboard
					window.dispatchEvent(new StorageEvent("storage", {
						key: "budgetBreakdowns",
						newValue: JSON.stringify(breakdowns),
						oldValue: null,
						storageArea: localStorage,
					}));
					
					console.log("Budget generation and storage complete");
				} catch (aiError) {
					console.error("Error generating AI budget:", aiError.message);
					console.error("Full error:", aiError);
					// Even if AI fails, budget is already created
					// Update metadata to show generation failed
					metadata[dateKey].generating = false;
					metadata[dateKey].generationError = true;
					localStorage.setItem("budgetMetadata", JSON.stringify(metadata));
				}
			}
		} catch (err) {
			console.error("Error creating budget:", err);
			setError("Failed to create budget plan. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString + "T00:00:00").toLocaleDateString("en-US", {
			weekday: "short",
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const handleLogoutClick = async () => {
		try {
			await logout();
			navigate("/");
		} catch (err) {
			console.error("Logout failed:", err);
		}
	};

	return (
		<div className="create-budget-container">
			{/* Header */}
			<header className="create-budget-header">
				<div className="header-left">
					<button
						className="logo logo-btn"
						onClick={() => navigate("/dashboard")}
					>
						💰 Summit Funds
					</button>
					<div className="header-title">
						<h1>Create Budget Plan</h1>
					</div>
				</div>
				<div className="header-buttons">
					<button className="btn-back" onClick={() => navigate("/budget-plans")}>
						← Back
					</button>
					<button className="btn-logout" onClick={handleLogoutClick}>
						Logout
					</button>
				</div>
			</header>

			{/* Main Content */}
			<main className="create-budget-main">
				<div className="create-budget-content">
					{/* Progress Indicator */}
					<div className="progress-indicator">
						<div className={`step ${step === "name" ? "active" : step !== "name" ? "completed" : ""}`}>
							<div className="step-number">1</div>
							<div className="step-label">Name & Reason</div>
						</div>
						<div className="progress-line"></div>
						<div className={`step ${step === "goal" ? "active" : step === "dates" || step === "review" ? "completed" : ""}`}>
							<div className="step-number">2</div>
							<div className="step-label">Monetary Goal</div>
						</div>
						<div className="progress-line"></div>
						<div className={`step ${step === "dates" ? "active" : step === "review" ? "completed" : ""}`}>
							<div className="step-number">3</div>
							<div className="step-label">Date Range</div>
						</div>
						<div className="progress-line"></div>
						<div className={`step ${step === "review" ? "active" : ""}`}>
							<div className="step-number">4</div>
							<div className="step-label">Review</div>
						</div>
					</div>

					{/* Error Message */}
					{error && <div className="error-message">{error}</div>}

					{/* Step 1: Name and Reason */}
					{step === "name" && (
						<div className="step-content">
							<div className="step-header">
								<h2>📝 Name Your Budget Plan</h2>
								<p>Give your budget plan a meaningful name and tell us your goal</p>
							</div>

							<form onSubmit={handleNameSubmit} className="step-form">
								<div className="form-group">
									<label htmlFor="budgetName">Budget Plan Name</label>
									<input
										id="budgetName"
										type="text"
										placeholder="e.g., Q1 2026 Savings, Emergency Fund Build"
										value={budgetName}
										onChange={(e) => setBudgetName(e.target.value)}
										className="form-input"
										maxLength={50}
										autoFocus
									/>
									<small className="char-count">
										{budgetName.length}/50
									</small>
								</div>

								<div className="form-group">
									<label htmlFor="budgetReason">Reason for Budget (Optional)</label>
									<textarea
										id="budgetReason"
										placeholder="e.g., I want to save for a vacation, reduce spending, or prepare for a major purchase"
										value={budgetReason}
										onChange={(e) => setBudgetReason(e.target.value)}
										className="form-textarea"
										rows={4}
										maxLength={200}
									/>
									<small className="char-count">
										{budgetReason.length}/200
									</small>
								</div>

								<div className="form-actions">
									<button
										type="button"
										className="btn-cancel"
										onClick={() => navigate("/budget-plans")}
									>
										Cancel
									</button>
									<button
										type="submit"
										className="btn-next"
										disabled={!budgetName.trim()}
									>
										Next: Set Dates →
									</button>
								</div>
							</form>

							{/* Info Box */}
							<div className="info-box">
								<h3>💡 Tips for Budget Names</h3>
								<ul>
									<li>Include a time period (e.g., "Q1", "Spring 2026")</li>
									<li>Be specific about your goal or focus area</li>
									<li>Examples: "Vacation Fund Q1", "Debt Payoff Plan", "Daily Spending Tracker"</li>
								</ul>
							</div>
						</div>
					)}

					{/* Step 2: Monetary Goal */}
					{step === "goal" && (
						<div className="step-content">
							<div className="step-header">
								<h2>💰 Set Your Monetary Goal</h2>
								<p>Enter a target savings or spending goal that our AI will factor into your budget recommendations (Optional)</p>
							</div>

							<form onSubmit={handleGoalSubmit} className="step-form">
								<div className="goal-type-selector">
									<label>
										<input
											type="radio"
											value="total"
											checked={goalType === "total"}
											onChange={(e) => setGoalType(e.target.value)}
										/>
										💰 Total Savings Goal (e.g., Save $5,000)
									</label>
									<label>
										<input
											type="radio"
											value="monthly"
											checked={goalType === "monthly"}
											onChange={(e) => setGoalType(e.target.value)}
										/>
										📅 Monthly Savings Goal (e.g., Save $500/month)
									</label>
									<label>
										<input
											type="radio"
											value="skip"
											checked={goalType === "skip"}
											onChange={(e) => setGoalType(e.target.value)}
										/>
										⏭️ Skip this step
									</label>
								</div>

								{goalType === "total" && (
									<div className="form-group">
										<label htmlFor="monetaryGoal">Total Savings Goal</label>
										<div className="input-with-currency">
											<span className="currency-symbol">$</span>
											<input
												id="monetaryGoal"
												type="number"
												placeholder="e.g., 5000"
												value={monetaryGoal}
												onChange={(e) => setMonetaryGoal(e.target.value)}
												className="form-input currency-input"
												step="0.01"
												min="0"
												autoFocus
											/>
										</div>
										<small className="help-text">
											Enter the total amount you want to save during this budget period
										</small>
									</div>
								)}

								{goalType === "monthly" && (
									<div className="form-group">
										<label htmlFor="monthlyGoal">Monthly Savings Goal</label>
										<div className="input-with-currency">
											<span className="currency-symbol">$</span>
											<input
												id="monthlyGoal"
												type="number"
												placeholder="e.g., 500"
												value={monthlyGoal}
												onChange={(e) => setMonthlyGoal(e.target.value)}
												className="form-input currency-input"
												step="0.01"
												min="0"
												autoFocus
											/>
										</div>
										<small className="help-text">
											Enter the amount you want to save each month
										</small>
									</div>
								)}

								<div className="form-actions">
									<button
										type="button"
										className="btn-back-step"
										onClick={() => setStep("name")}
									>
										← Back
									</button>
									<button
										type="submit"
										className="btn-next"
									>
										Next: Set Dates →
									</button>
								</div>
							</form>

							{/* Info Box */}
							<div className="info-box">
								<h3>💡 Monetary Goal Examples</h3>
								<ul>
									<li><strong>Savings Goal:</strong> $5,000 - "I want to save $5,000 this quarter"</li>
									<li><strong>Spending Cap:</strong> $2,000 - "I want to limit spending to $2,000/month"</li>
									<li><strong>Emergency Fund:</strong> $10,000 - "I'm building an emergency fund of $10,000"</li>
									<li><strong>Leave Empty:</strong> Skip this if you don't have a specific target</li>
								</ul>
							</div>
						</div>
					)}

					{/* Step 3: Date Range */}
					{step === "dates" && (
						<div className="step-content">
							<div className="step-header">
								<h2>📅 Select Budget Duration</h2>
								<p>Choose when your budget plan will start and end</p>
							</div>

							<form onSubmit={handleDateSubmit} className="step-form">
								<div className="date-section">
									<div className="form-group">
										<label htmlFor="startDate">Start Date</label>
										<input
											id="startDate"
											type="date"
											value={startDate}
											onChange={(e) => setStartDate(e.target.value)}
											className="form-input"
											disabled
										/>
										<small className="help-text">
											Today: {formatDate(startDate)}
										</small>
									</div>

									<div className="duration-icon">→</div>

									<div className="form-group">
										<label htmlFor="endDate">End Date</label>
										<input
											id="endDate"
											type="date"
											min={
												new Date(
													new Date(startDate).getTime() +
														24 * 60 * 60 * 1000
												)
													.toISOString()
													.split("T")[0]
											}
											max={maxEndDate}
											value={endDate}
											onChange={(e) => setEndDate(e.target.value)}
											className="form-input"
											autoFocus
										/>
										<small className="help-text">
											Max: {formatDate(maxEndDate)}
										</small>
									</div>
								</div>

								{endDate && (
									<div className="duration-info">
										<div className="duration-card">
											<span className="duration-label">Duration</span>
											<span className="duration-value">
												{estimatedData?.durationDays} days
											</span>
											<span className="duration-subtext">
												≈ {estimatedData?.durationMonths} months
											</span>
										</div>
									</div>
								)}

								<div className="form-actions">
									<button
										type="button"
										className="btn-back-step"
										onClick={() => setStep("goal")}
									>
										← Back
									</button>
									<button
										type="submit"
										className="btn-next"
										disabled={!endDate}
									>
										Review Plan →
									</button>
								</div>
							</form>

							{/* Info Box */}
							<div className="info-box">
								<h3>📊 Date Selection Tips</h3>
								<ul>
									<li>Shorter budgets (1-3 months) are better for focused goals</li>
									<li>Longer budgets (6-12 months) help track long-term habits</li>
									<li>Align end date with financial milestones or seasons</li>
									<li>Maximum duration: 12 months for realistic planning</li>
								</ul>
							</div>
						</div>
					)}

					{/* Step 3: Review */}
					{step === "review" && (
						<div className="step-content">
							<div className="step-header">
								<h2>✅ Review Your Budget Plan</h2>
								<p>Confirm the details of your new budget plan</p>
							</div>

							<div className="review-section">
							<div className="review-card">
								<div className="review-item">
									<span className="review-label">📝 Budget Name</span>
									<span className="review-value">{budgetName}</span>
								</div>

								{budgetReason && (
									<div className="review-item">
										<span className="review-label">💭 Goal/Reason</span>
										<span className="review-value">{budgetReason}</span>
									</div>
								)}

								{goalType === "total" && monetaryGoal && (
									<div className="review-item">
										<span className="review-label">💰 Total Savings Goal</span>
										<span className="review-value">${parseFloat(monetaryGoal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
									</div>
								)}

								{goalType === "monthly" && monthlyGoal && (
									<div className="review-item">
										<span className="review-label">📅 Monthly Savings Goal</span>
										<span className="review-value">${parseFloat(monthlyGoal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month</span>
									</div>
								)}

								<div className="review-item">
									<span className="review-label">📅 Start Date</span>
									<span className="review-value">
										{formatDate(startDate)}
									</span>
								</div>

								<div className="review-item">
									<span className="review-label">📅 End Date</span>
									<span className="review-value">
										{formatDate(endDate)}
									</span>
								</div>

								<div className="review-item">
									<span className="review-label">⏱️ Duration</span>
									<span className="review-value">
										{estimatedData?.durationDays} days (
										≈ {estimatedData?.durationMonths} months)
									</span>
								</div>
							</div>								{/* Info about next steps */}
								<div className="info-box success">
									<h3>🎯 What Happens Next?</h3>
									<p>
										Once you create this budget plan, our AI will analyze your financial
										profile and generate a personalized budget breakdown for the duration
										you selected{(goalType === "total" && monetaryGoal) || (goalType === "monthly" && monthlyGoal) ? " while keeping your savings goal in mind" : ""}. You'll be able to:
									</p>
									<ul>
										<li>View AI-powered budget recommendations</li>
										<li>Track spending across different categories</li>
										<li>Adjust budget amounts as needed</li>
										<li>Compare against your actual spending</li>
									</ul>
								</div>
							</div>

							<div className="form-actions">
								<button
									type="button"
									className="btn-back-step"
									onClick={() => setStep("dates")}
									disabled={loading}
								>
									← Back
								</button>
								<button
									type="button"
									className="btn-create"
									onClick={handleCreateBudget}
									disabled={loading}
								>
									{loading ? "Creating..." : "✨ Create Budget Plan"}
								</button>
							</div>
						</div>
					)}
				</div>
			</main>

			{/* Footer */}
			<footer className="create-budget-footer">
				<p>&copy; 2025 Summit Funds. All rights reserved.</p>
			</footer>
		</div>
	);
}
