/**
 * Developer Utilities Service
 * Provides dev view functionality for developer email (Braydenmiddlebrooks@gmail.com)
 * Allows testing all features without restrictions
 */

/**
 * Check if a user is a developer
 * @param {string} email - User email to check
 * @returns {boolean} - True if developer
 */
export const isDeveloperEmail = (email) => {
	return email?.toLowerCase() === "braydenmiddlebrooks@gmail.com";
};

/**
 * Get default profile for development
 * Pre-filled with test data for quick testing
 * @returns {Object} - Default profile object
 */
export const getDevProfile = () => {
	return {
		monthlyIncome: 5000,
		housing: 1200,
		utilities: 150,
		groceries: 400,
		transportation: 300,
		insurance: 200,
		phone: 80,
		internet: 60,
		dining: 250,
		entertainment: 150,
		subscriptions: 50,
		shopping: 200,
		gym: 50,
		creditCardPayment: 200,
		studentLoan: 300,
		personalLoan: 0,
		dependents: 1,
		workHoursPerWeek: 40,
		employmentStatus: "Full-time",
		industry: "Technology",
		workStressLevel: "medium",
		livingSituation: "Apartment",
		caregivingResponsibilities: "none",
		sideIncome: 0,
	};
};

/**
 * Initialize developer mode
 * Sets up profile and sample budget data for testing
 */
export const initializeDeveloperMode = () => {
	console.log("🔧 Initializing Developer Mode");

	// Set profile data
	const devProfile = getDevProfile();
	localStorage.setItem("userProfile", JSON.stringify(devProfile));
	console.log("✅ Dev profile set");

	// Create sample budget metadata
	const budgetMetadata = {
		dev_budget_1: {
			name: "Monthly Budget",
			reason: "Testing custom budget generation",
			startDate: new Date().toISOString().split("T")[0],
			endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
				.toISOString()
				.split("T")[0],
			status: "active",
			generating: false,
		},
	};
	localStorage.setItem("budgetMetadata", JSON.stringify(budgetMetadata));
	console.log("✅ Sample budget metadata set");

	// Create sample budget breakdown
	const budgetBreakdowns = {
		dev_budget_1: {
			customBreakdown: {
				essentials: {
					percentage: 50,
					amount: 2500,
					description: "Housing, utilities, food, insurance",
				},
				discretionary: {
					percentage: 30,
					amount: 1500,
					description: "Entertainment, dining, shopping",
				},
				savings: {
					percentage: 20,
					amount: 1000,
					description: "Emergency fund and investments",
				},
			},
			recommendations: [
				"Great balance between essential and discretionary spending",
				"Consider increasing emergency fund to 6 months of expenses",
				"Monitor subscription costs - potential savings of $20-30/month",
				"Transportation costs are reasonable for your lifestyle",
			],
			alerts: [
				"✅ Good financial balance",
				"📌 Emergency fund target: $15,000 (6 months)",
				"💡 Opportunity: Review subscriptions monthly",
			],
			source: "dev",
		},
	};
	localStorage.setItem("budgetBreakdowns", JSON.stringify(budgetBreakdowns));
	console.log("✅ Sample budget breakdown set");

	// Create sample quiz data
	const quizData = {
		financialGoal: "Build emergency fund",
		goalAmount: 5000,
		goalTimeline: 12,
		riskTolerance: "medium",
	};
	localStorage.setItem("quizData", JSON.stringify(quizData));
	console.log("✅ Quiz data set");

	console.log("🔧 Developer Mode Initialized");
	console.log("📋 Available test data:");
	console.log("  - Profile: Monthly income $5,000 with full expenses");
	console.log("  - Budget: 50/30/20 split with personalized recommendations");
	console.log("  - Quiz: Pre-filled financial goals");
	console.log("📍 You can now access all pages via the dashboard");
};

/**
 * Reset developer mode data
 */
export const resetDeveloperMode = () => {
	console.log("🔧 Resetting Developer Mode");
	localStorage.removeItem("userProfile");
	localStorage.removeItem("budgetMetadata");
	localStorage.removeItem("budgetBreakdowns");
	localStorage.removeItem("quizData");
	console.log("✅ Developer Mode reset");
};

/**
 * Get developer status and info
 */
export const getDeveloperStatus = () => {
	const profile = localStorage.getItem("userProfile");
	const budgets = localStorage.getItem("budgetMetadata");
	const breakdowns = localStorage.getItem("budgetBreakdowns");

	return {
		profileSet: !!profile,
		budgetsSet: !!budgets,
		breakdownsSet: !!breakdowns,
		allReady: !!(profile && budgets && breakdowns),
	};
};

/**
 * Get all pages available in dev mode
 */
export const getAvailablePages = () => {
	return [
		{
			name: "Dashboard",
			path: "/dashboard",
			description: "View active budget and progress",
		},
		{
			name: "Quiz",
			path: "/quiz",
			description: "Financial goals questionnaire",
		},
		{
			name: "Profile",
			path: "/profile",
			description: "Personal and financial information",
		},
		{
			name: "Financial Profile",
			path: "/financial-profile",
			description: "Detailed income and expense tracking",
		},
		{
			name: "Create Budget Plan",
			path: "/create-budget-plan",
			description: "Generate new budget plans",
		},
		{
			name: "Budget Plans",
			path: "/budget-plans",
			description: "View all budget plans",
		},
		{
			name: "AI Budget Advisor",
			path: "/ai-budget-advisor",
			description: "Daily spending advice and time slots",
		},
		{
			name: "Settings",
			path: "/settings",
			description: "Application settings",
		},
	];
};

export default {
	isDeveloperEmail,
	getDevProfile,
	initializeDeveloperMode,
	resetDeveloperMode,
	getDeveloperStatus,
	getAvailablePages,
};
