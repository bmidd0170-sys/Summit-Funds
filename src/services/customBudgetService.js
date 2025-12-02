/**
 * Custom Budget Service
 * Generates personalized budgets based on user's complete financial profile
 * Analyzes actual spending patterns and work/life circumstances
 */

import {
	getEconomicData,
	generateEconomicContext,
} from "./economicDataService";
import { delayApiCall } from "./rateLimiter";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

/**
 * Generate a custom budget recommendation based on ALL user profile data
 * @param {Object} userProfile - Complete user financial profile
 * @param {Object} budgetMetadata - Budget plan metadata (name, goal, dates, reason)
 * @returns {Promise<Object>} - Custom budget breakdown with recommendations
 */
export const generateCustomBudget = async (userProfile, budgetMetadata = {}) => {
	if (!userProfile || !userProfile.monthlyIncome) {
		return generateLocalCustomBudget(userProfile);
	}

	if (!OPENAI_API_KEY) {
		console.warn("⚠️ OpenAI API key not configured. Using local budget generation.");
		return generateLocalCustomBudget(userProfile);
	}

	// Check if user prefers offline mode
	const offlineMode = localStorage.getItem("offlineMode") === "true";
	if (offlineMode) {
		console.log("📴 Offline mode enabled. Using local budget generation.");
		return generateLocalCustomBudget(userProfile);
	}

	try {
		// Fetch economic data for context
		const economicData = await getEconomicData();
		const economicContext = generateEconomicContext(economicData);

		// Build detailed profile summary
		const profileSummary = buildProfileSummary(userProfile);

		// Build monetary goal context if available
		let goalContext = "";
		if (budgetMetadata.goalType === "total" && budgetMetadata.monetaryGoal) {
			goalContext = `\n\n🎯 MONETARY GOAL: The user wants to SAVE a total of $${budgetMetadata.monetaryGoal} during this budget period. Please allocate budget categories to help them reach this goal.`;
		} else if (budgetMetadata.goalType === "monthly" && budgetMetadata.monthlyGoal) {
			goalContext = `\n\n🎯 MONTHLY SAVINGS GOAL: The user wants to save $${budgetMetadata.monthlyGoal} per month. Please allocate budget categories to help them achieve this monthly savings target.`;
		}

		const prompt = `You are an expert financial advisor AI specializing in creating personalized budgets based on individual circumstances and economic conditions.

${economicContext}

Create a CUSTOM MONTHLY BUDGET for this person. Do NOT use the standard 50/30/20 rule. Instead, customize the budget based on their specific situation:

${profileSummary}${goalContext}

Based on this person's COMPLETE SITUATION and current economic conditions:
1. Analyze their actual spending across all categories
2. Consider their work/life circumstances (hours worked, stress, caregiving, dependents)
3. Adjust for inflation and economic factors
4. Create REALISTIC spending percentages that match their life
5. Provide personalized recommendations

Important: The percentages should be custom, not 50/30/20. For example, a single parent might need 60% essentials/20% discretionary/20% savings, or someone with high stress work might benefit from more discretionary spending for mental health.

Return ONLY valid JSON with NO additional text:
{
  "monthlyIncome": ${parseFloat(userProfile.monthlyIncome) || 0},
  "dailyBudget": calculated daily amount,
  "customBreakdown": {
    "essentials": {
      "percentage": custom percentage,
      "amount": calculated amount,
      "description": "explanation of what's included"
    },
    "discretionary": {
      "percentage": custom percentage,
      "amount": calculated amount,
      "description": "explanation of what's included"
    },
    "savings": {
      "percentage": custom percentage,
      "amount": calculated amount,
      "description": "explanation of what's included"
    },
    "other": {
      "percentage": custom percentage,
      "amount": calculated amount,
      "description": "debt payments, caregiving costs, etc."
    }
  },
  "actualCategorySpending": {
    "housing": ${parseFloat(userProfile.housing) || 0},
    "utilities": ${parseFloat(userProfile.utilities) || 0},
    "groceries": ${parseFloat(userProfile.groceries) || 0},
    "transportation": ${parseFloat(userProfile.transportation) || 0},
    "insurance": ${parseFloat(userProfile.insurance) || 0},
    "phone": ${parseFloat(userProfile.phone) || 0},
    "internet": ${parseFloat(userProfile.internet) || 0},
    "dining": ${parseFloat(userProfile.dining) || 0},
    "entertainment": ${parseFloat(userProfile.entertainment) || 0},
    "subscriptions": ${parseFloat(userProfile.subscriptions) || 0},
    "shopping": ${parseFloat(userProfile.shopping) || 0},
    "gym": ${parseFloat(userProfile.gym) || 0},
    "creditCard": ${parseFloat(userProfile.creditCardPayment) || 0},
    "studentLoan": ${parseFloat(userProfile.studentLoan) || 0},
    "personalLoan": ${parseFloat(userProfile.personalLoan) || 0}
  },
  "recommendations": [
    "Specific recommendation 1 based on their profile",
    "Specific recommendation 2 addressing their situation",
    "Specific recommendation 3 for their circumstances"
  ],
  "alerts": [
    "Alert if overspending in category",
    "Alert if financial risk detected",
    "Alert if opportunity to save identified"
  ],
  "reasoning": "Detailed explanation of why this custom budget matches their situation"
}`;

		await delayApiCall();
		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${OPENAI_API_KEY}`,
			},
			body: JSON.stringify({
				model: "gpt-3.5-turbo",
				messages: [
					{
						role: "system",
						content:
							"You are a financial advisor AI that creates custom budgets based on individual circumstances. Always respond with valid JSON only, no additional text. Do NOT use 50/30/20 unless it genuinely matches their situation.",
					},
					{
						role: "user",
						content: prompt,
					},
				],
				temperature: 0.7,
				max_tokens: 1500,
			}),
		});

		if (!response.ok) {
			if (response.status === 429) {
				console.warn("⚠️ OpenAI API rate limited (429). Using local fallback.");
				localStorage.setItem("apiUnavailable", "true");
				localStorage.setItem("apiUnavailableReason", "Rate limit exceeded");
				return generateLocalCustomBudget(userProfile);
			}
			if (response.status === 401) {
				console.warn("⚠️ OpenAI API authentication failed (401). Check your API key.");
				localStorage.setItem("apiUnavailable", "true");
				localStorage.setItem("apiUnavailableReason", "Authentication failed - invalid API key");
				return generateLocalCustomBudget(userProfile);
			}
			if (response.status === 403) {
				console.warn("⚠️ OpenAI API access forbidden (403). Check billing and permissions.");
				localStorage.setItem("apiUnavailable", "true");
				localStorage.setItem("apiUnavailableReason", "Access forbidden - check account billing");
				return generateLocalCustomBudget(userProfile);
			}
			const errorData = await response.text();
			console.error("OpenAI API error:", response.status, response.statusText, errorData);
			localStorage.setItem("apiUnavailable", "true");
			localStorage.setItem("apiUnavailableReason", `API Error: ${response.status}`);
			return generateLocalCustomBudget(userProfile);
		}

		const data = await response.json();
		console.log("API Response received:", { 
			hasChoices: !!data.choices,
			choicesLength: data.choices?.length,
			hasMessage: !!data.choices?.[0]?.message,
			hasContent: !!data.choices?.[0]?.message?.content,
		});

		if (!data.choices || !data.choices[0] || !data.choices[0].message) {
			console.error("Invalid API response structure:", JSON.stringify(data, null, 2));
			return generateLocalCustomBudget(userProfile);
		}
		
		const content = data.choices[0].message.content;
		console.log("Raw content from API:", content.substring(0, 100) + "...");

		// Extract JSON from response - improved parsing
		let customBudget;
		try {
			// Try to parse the entire response first
			console.log("Attempting direct JSON parse...");
			customBudget = JSON.parse(content);
			console.log("Direct parse successful");
		} catch (e) {
			console.log("Direct parse failed, attempting regex extraction...", e.message);
			// If that fails, try to extract JSON block
			const jsonMatch = content.match(/\{[\s\S]*\}/);
			if (!jsonMatch) {
				console.error("Could not extract JSON from response:", content);
				throw new Error("Could not parse AI response - no JSON block found");
			}
			try {
				console.log("Extracted JSON block, attempting parse...");
				customBudget = JSON.parse(jsonMatch[0]);
				console.log("Regex extraction parse successful");
			} catch (parseError) {
				console.error("Invalid JSON extracted:", jsonMatch[0]);
				throw new Error("Could not parse extracted JSON: " + parseError.message);
			}
		}
		
		// Validate the parsed result
		if (!customBudget || !customBudget.customBreakdown) {
			console.error("Parsed budget missing customBreakdown:", customBudget);
			throw new Error("Missing customBreakdown in parsed budget");
		}
		
		console.log("Budget parsed successfully with keys:", Object.keys(customBudget));
		return {
			...customBudget,
			generatedAt: new Date().toISOString(),
			source: "ai",
			isCustom: true,
		};
	} catch (error) {
		console.error("Error generating custom budget:", error.message);
		console.error("Error details:", error);
		return generateLocalCustomBudget(userProfile);
	}
};

/**
 * Build a comprehensive profile summary from all user data
 * @param {Object} userProfile - User's complete profile
 * @returns {string} - Formatted profile summary
 */
const buildProfileSummary = (userProfile) => {
	const lines = [];

	lines.push("=== FINANCIAL OVERVIEW ===");
	lines.push(`Monthly Income: $${parseFloat(userProfile.monthlyIncome) || 0}`);
	lines.push(
		`Employment Status: ${userProfile.employmentStatus || "Not specified"}`
	);
	lines.push(`Industry: ${userProfile.industry || "Not specified"}`);
	lines.push(
		`Hours Per Week: ${userProfile.workHoursPerWeek || "Not specified"} hours`
	);
	lines.push(`Work Stress Level: ${userProfile.workStressLevel || "Not specified"}`);
	lines.push(
		`Side Income: $${parseFloat(userProfile.sideIncome) || 0} per month`
	);

	lines.push("\n=== LIVING SITUATION ===");
	lines.push(`Living Arrangement: ${userProfile.livingSituation || "Not specified"}`);
	lines.push(`Number of Dependents: ${userProfile.dependents || 0}`);
	lines.push(
		`Caregiving Responsibilities: ${userProfile.caregivingResponsibilities || "None"}`
	);

	lines.push("\n=== ACTUAL MONTHLY SPENDING ===");
	lines.push(`Housing: $${parseFloat(userProfile.housing) || 0}`);
	lines.push(`Utilities: $${parseFloat(userProfile.utilities) || 0}`);
	lines.push(`Groceries: $${parseFloat(userProfile.groceries) || 0}`);
	lines.push(`Transportation: $${parseFloat(userProfile.transportation) || 0}`);
	lines.push(`Insurance: $${parseFloat(userProfile.insurance) || 0}`);
	lines.push(`Phone: $${parseFloat(userProfile.phone) || 0}`);
	lines.push(`Internet: $${parseFloat(userProfile.internet) || 0}`);
	lines.push(`Dining Out: $${parseFloat(userProfile.dining) || 0}`);
	lines.push(`Entertainment: $${parseFloat(userProfile.entertainment) || 0}`);
	lines.push(`Subscriptions: $${parseFloat(userProfile.subscriptions) || 0}`);
	lines.push(`Shopping: $${parseFloat(userProfile.shopping) || 0}`);
	lines.push(`Gym: $${parseFloat(userProfile.gym) || 0}`);

	lines.push("\n=== DEBT OBLIGATIONS ===");
	lines.push(`Credit Card Payments: $${parseFloat(userProfile.creditCardPayment) || 0}`);
	lines.push(`Student Loans: $${parseFloat(userProfile.studentLoan) || 0}`);
	lines.push(`Personal Loans: $${parseFloat(userProfile.personalLoan) || 0}`);

	// Calculate totals
	const essentials =
		(parseFloat(userProfile.housing) || 0) +
		(parseFloat(userProfile.utilities) || 0) +
		(parseFloat(userProfile.groceries) || 0) +
		(parseFloat(userProfile.transportation) || 0) +
		(parseFloat(userProfile.insurance) || 0) +
		(parseFloat(userProfile.phone) || 0) +
		(parseFloat(userProfile.internet) || 0);

	const discretionary =
		(parseFloat(userProfile.dining) || 0) +
		(parseFloat(userProfile.entertainment) || 0) +
		(parseFloat(userProfile.subscriptions) || 0) +
		(parseFloat(userProfile.shopping) || 0) +
		(parseFloat(userProfile.gym) || 0);

	const debt =
		(parseFloat(userProfile.creditCardPayment) || 0) +
		(parseFloat(userProfile.studentLoan) || 0) +
		(parseFloat(userProfile.personalLoan) || 0);

	const totalSpending = essentials + discretionary + debt;
	const monthlyIncome = parseFloat(userProfile.monthlyIncome) || 0;
	const remaining = monthlyIncome - totalSpending;

	lines.push("\n=== SPENDING ANALYSIS ===");
	lines.push(`Essentials Total: $${essentials.toFixed(2)} (${((essentials / monthlyIncome) * 100).toFixed(1)}% of income)`);
	lines.push(`Discretionary Total: $${discretionary.toFixed(2)} (${((discretionary / monthlyIncome) * 100).toFixed(1)}% of income)`);
	lines.push(`Debt Obligations: $${debt.toFixed(2)} (${((debt / monthlyIncome) * 100).toFixed(1)}% of income)`);
	lines.push(`Total Current Spending: $${totalSpending.toFixed(2)}`);
	lines.push(`Remaining/Savings: $${remaining.toFixed(2)} (${((remaining / monthlyIncome) * 100).toFixed(1)}% of income)`);

	return lines.join("\n");
};

/**
 * Generate local custom budget (fallback)
 * Analyzes actual spending and creates realistic percentages
 * @param {Object} userProfile - User's complete profile
 * @returns {Object} - Custom budget breakdown
 */
const generateLocalCustomBudget = (userProfile) => {
	if (!userProfile || !userProfile.monthlyIncome) {
		return getDefaultBudget();
	}

	const monthlyIncome = parseFloat(userProfile.monthlyIncome) || 0;

	// Calculate actual spending in each category
	const essentials =
		(parseFloat(userProfile.housing) || 0) +
		(parseFloat(userProfile.utilities) || 0) +
		(parseFloat(userProfile.groceries) || 0) +
		(parseFloat(userProfile.transportation) || 0) +
		(parseFloat(userProfile.insurance) || 0) +
		(parseFloat(userProfile.phone) || 0) +
		(parseFloat(userProfile.internet) || 0);

	const discretionary =
		(parseFloat(userProfile.dining) || 0) +
		(parseFloat(userProfile.entertainment) || 0) +
		(parseFloat(userProfile.subscriptions) || 0) +
		(parseFloat(userProfile.shopping) || 0) +
		(parseFloat(userProfile.gym) || 0);

	const debt =
		(parseFloat(userProfile.creditCardPayment) || 0) +
		(parseFloat(userProfile.studentLoan) || 0) +
		(parseFloat(userProfile.personalLoan) || 0);

	const totalSpending = essentials + discretionary + debt;
	const savings = Math.max(monthlyIncome - totalSpending, 0);

	// Calculate actual percentages
	const essentialsPercent = Math.round((essentials / monthlyIncome) * 100);
	const discretionaryPercent = Math.round((discretionary / monthlyIncome) * 100);
	const debtPercent = Math.round((debt / monthlyIncome) * 100);
	const savingsPercent = Math.round((savings / monthlyIncome) * 100);

	// Build recommendations based on situation
	const recommendations = [];
	const alerts = [];

	if (essentialsPercent > 55) {
		recommendations.push(
			`Your essential expenses are ${essentialsPercent}% of income. Consider looking for ways to reduce housing or transportation costs.`
		);
		alerts.push("⚠️ High essential expenses - review housing and transportation");
	}

	if (discretionaryPercent > 35) {
		recommendations.push(
			`Your discretionary spending is ${discretionaryPercent}% of income. Look for opportunities to cut back on dining out or subscriptions.`
		);
		alerts.push("⚠️ High discretionary spending - review subscriptions and dining");
	}

	if (debtPercent > 20) {
		recommendations.push(
			`Your debt payments are ${debtPercent}% of income. Consider a debt payoff strategy to free up more income.`
		);
		alerts.push("🔴 High debt obligations - prioritize debt reduction");
	}

	if (savingsPercent < 5) {
		recommendations.push(
			`You're saving less than 5% of income. Try to cut discretionary spending to increase emergency fund.`
		);
		alerts.push("📌 Low savings rate - prioritize building emergency fund");
	}

	// Add positive feedback
	if (essentialsPercent <= 55 && discretionaryPercent <= 35 && savingsPercent >= 10) {
		recommendations.push(
			`Great balance! You're successfully managing your essentials while maintaining discretionary spending and savings.`
		);
		alerts.push("✅ Good financial balance");
	}

	// Customize based on life situation
	if (userProfile.dependents > 0) {
		recommendations.push(
			`With ${userProfile.dependents} dependent(s), focus on essentials and building emergency fund for unexpected expenses.`
		);
	}

	if (userProfile.caregivingResponsibilities &&
		userProfile.caregivingResponsibilities !== "none") {
		recommendations.push(
			`Your caregiving responsibilities may require flexible budgeting. Keep discretionary spending modest for unexpected care-related costs.`
		);
	}

	if (
		userProfile.workStressLevel === "high" ||
		userProfile.workStressLevel === "veryhigh"
	) {
		recommendations.push(
			`Given your high work stress, allocate some discretionary funds for stress relief and mental health (exercise, entertainment, hobbies).`
		);
	}

	if (userProfile.workHoursPerWeek > 50) {
		recommendations.push(
			`Working ${userProfile.workHoursPerWeek}+ hours per week - ensure you budget for convenience and stress relief to maintain wellbeing.`
		);
	}

	return {
		monthlyIncome,
		dailyBudget: parseFloat((monthlyIncome / 30).toFixed(2)),
		customBreakdown: {
			essentials: {
				percentage: essentialsPercent,
				amount: parseFloat(essentials.toFixed(2)),
				description: `Housing, utilities, groceries, transportation, insurance, phone, internet (your actual: ${essentialsPercent}% of income)`,
			},
			discretionary: {
				percentage: discretionaryPercent,
				amount: parseFloat(discretionary.toFixed(2)),
				description: `Dining out, entertainment, subscriptions, shopping, gym (your actual: ${discretionaryPercent}% of income)`,
			},
			savings: {
				percentage: savingsPercent,
				amount: parseFloat(savings.toFixed(2)),
				description: `Emergency fund, investments, financial goals (${savingsPercent}% of income)`,
			},
			debt: {
				percentage: debtPercent,
				amount: parseFloat(debt.toFixed(2)),
				description: `Credit cards, student loans, personal loans (${debtPercent}% of income)`,
			},
		},
		actualCategorySpending: {
			housing: parseFloat(userProfile.housing) || 0,
			utilities: parseFloat(userProfile.utilities) || 0,
			groceries: parseFloat(userProfile.groceries) || 0,
			transportation: parseFloat(userProfile.transportation) || 0,
			insurance: parseFloat(userProfile.insurance) || 0,
			phone: parseFloat(userProfile.phone) || 0,
			internet: parseFloat(userProfile.internet) || 0,
			dining: parseFloat(userProfile.dining) || 0,
			entertainment: parseFloat(userProfile.entertainment) || 0,
			subscriptions: parseFloat(userProfile.subscriptions) || 0,
			shopping: parseFloat(userProfile.shopping) || 0,
			gym: parseFloat(userProfile.gym) || 0,
			creditCard: parseFloat(userProfile.creditCardPayment) || 0,
			studentLoan: parseFloat(userProfile.studentLoan) || 0,
			personalLoan: parseFloat(userProfile.personalLoan) || 0,
		},
		recommendations,
		alerts,
		reasoning: `This budget is customized based on your actual spending patterns and life situation. Your essentials are ${essentialsPercent}% of income, discretionary is ${discretionaryPercent}%, and you have ${savingsPercent}% available for savings. This is more realistic than a standard 50/30/20 rule because it accounts for your specific circumstances, work-life balance, and actual expenses.`,
		generatedAt: new Date().toISOString(),
		source: "local",
		isCustom: true,
	};
};

/**
 * Get default budget structure
 * @returns {Object} - Default budget
 */
const getDefaultBudget = () => {
	const monthlyIncome = 3000; // Default example

	return {
		monthlyIncome,
		dailyBudget: 100,
		customBreakdown: {
			essentials: {
				percentage: 50,
				amount: 1500,
				description: "Housing, utilities, food, transportation, insurance",
			},
			discretionary: {
				percentage: 30,
				amount: 900,
				description: "Entertainment, dining, subscriptions, shopping",
			},
			savings: {
				percentage: 20,
				amount: 600,
				description: "Emergency fund and investments",
			},
		},
		recommendations: [
			"Complete your financial profile for a personalized budget",
		],
		alerts: ["📋 Add your spending details for custom recommendations"],
		reasoning:
			"This is a default 50/30/20 budget. Complete your profile for a custom budget based on your actual situation.",
		generatedAt: new Date().toISOString(),
		source: "default",
		isCustom: false,
	};
};

/**
 * Generate actionable steps to help user start saving when overspending
 * @param {Object} userProfile - User's financial profile
 * @returns {Promise<Object>} - Steps to reduce spending and start saving
 */
export const generateSavingSteps = async (userProfile) => {
	if (!userProfile) {
		return generateDefaultSavingSteps();
	}

	if (!OPENAI_API_KEY) {
		return generateLocalSavingSteps(userProfile);
	}

	// Check if user prefers offline mode
	const offlineMode = localStorage.getItem("offlineMode") === "true";
	if (offlineMode) {
		return generateLocalSavingSteps(userProfile);
	}

	try {
		await delayApiCall();

		const discretionary =
			(parseFloat(userProfile.dining) || 0) +
			(parseFloat(userProfile.entertainment) || 0) +
			(parseFloat(userProfile.subscriptions) || 0) +
			(parseFloat(userProfile.shopping) || 0) +
			(parseFloat(userProfile.gym) || 0);

		const prompt = `You are a financial advisor helping someone who is spending more than they earn.

Their monthly spending breakdown:
- Discretionary (dining, entertainment, subscriptions, shopping, gym): $${discretionary.toFixed(2)}
- Housing: $${userProfile.housing || 0}
- Utilities: $${userProfile.utilities || 0}
- Groceries: $${userProfile.groceries || 0}
- Transportation: $${userProfile.transportation || 0}
- Insurance: $${userProfile.insurance || 0}
- Phone: $${userProfile.phone || 0}
- Internet: $${userProfile.internet || 0}

Their monthly income: $${userProfile.monthlyIncome || 0}

Provide exactly 5 specific, actionable steps they can take RIGHT NOW to start saving money. Focus on realistic changes they can implement immediately. Format as a JSON object with:
{
  "steps": ["step 1", "step 2", ...],
  "potentialSavings": estimated monthly savings
}`;

		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${OPENAI_API_KEY}`,
			},
			body: JSON.stringify({
				model: "gpt-3.5-turbo",
				messages: [
					{
						role: "system",
						content:
							"You are a helpful financial advisor. Always respond with valid JSON only, no additional text.",
					},
					{ role: "user", content: prompt },
				],
				temperature: 0.7,
				max_tokens: 500,
			}),
		});

		if (!response.ok) {
			if (response.status === 429) {
				console.warn("⚠️ API quota exceeded, using local steps");
				localStorage.setItem("apiUnavailable", "true");
			}
			return generateLocalSavingSteps(userProfile);
		}

		const data = await response.json();
		const content = data.choices?.[0]?.message?.content || "{}";

		try {
			const result = JSON.parse(content);
			return {
				steps: result.steps || [],
				potentialSavings: result.potentialSavings || 0,
				source: "ai",
			};
		} catch {
			return generateLocalSavingSteps(userProfile);
		}
	} catch (error) {
		console.error("Error generating saving steps:", error);
		return generateLocalSavingSteps(userProfile);
	}
};

/**
 * Generate local saving steps without AI
 * @param {Object} userProfile - User's financial profile
 * @returns {Object} - Actionable saving steps
 */
function generateLocalSavingSteps(userProfile) {
	const steps = [];
	let estimatedSavings = 0;

	// Analyze spending areas
	const dining = parseFloat(userProfile?.dining) || 0;
	const entertainment = parseFloat(userProfile?.entertainment) || 0;
	const subscriptions = parseFloat(userProfile?.subscriptions) || 0;
	const shopping = parseFloat(userProfile?.shopping) || 0;
	const gym = parseFloat(userProfile?.gym) || 0;

	// Add steps based on actual spending
	if (dining > 150) {
		steps.push(
			"Reduce dining out: Cook more meals at home. Aim to cut eating out by 50% to save $" +
				(dining * 0.5).toFixed(2) +
				"/month"
		);
		estimatedSavings += dining * 0.5;
	}

	if (subscriptions > 0) {
		steps.push(
			"Cancel unused subscriptions: Review streaming, apps, and memberships. Eliminate ones you don't use regularly (potential savings: $" +
				(subscriptions * 0.7).toFixed(2) +
				")"
		);
		estimatedSavings += subscriptions * 0.7;
	}

	if (shopping > 100) {
		steps.push(
			"Cut impulse shopping: Implement a 30-day rule before any non-essential purchase (potential savings: $" +
				(shopping * 0.4).toFixed(2) +
				")"
		);
		estimatedSavings += shopping * 0.4;
	}

	if (entertainment > 100) {
		steps.push(
			"Find free entertainment: Explore free activities, community events, and local parks (potential savings: $" +
				(entertainment * 0.3).toFixed(2) +
				")"
		);
		estimatedSavings += entertainment * 0.3;
	}

	// If spending is high overall, add a general step
	if (steps.length < 3) {
		steps.push("Create a spending tracker app to monitor daily expenses and identify patterns");
	}

	// Add another step if needed
	if (steps.length < 5) {
		steps.push(
			"Set up automatic transfers to a separate savings account on payday to enforce a savings habit"
		);
	}

	return {
		steps: steps.slice(0, 5),
		potentialSavings: Math.max(0, estimatedSavings),
		source: "local",
	};
}

/**
 * Default saving steps when no profile data
 * @returns {Object} - Generic saving steps
 */
function generateDefaultSavingSteps() {
	return {
		steps: [
			"Review your discretionary spending and identify areas to cut back",
			"Look for subscriptions you're not using and cancel them",
			"Set up automatic transfers to a savings account on payday",
			"Try the 30-day rule before making any non-essential purchases",
			"Find free or low-cost alternatives for entertainment and dining",
		],
		potentialSavings: 0,
		source: "default",
	};
}

export default {
	generateCustomBudget,
	generateLocalCustomBudget,
	generateSavingSteps,
};
