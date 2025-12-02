/**
 * AI Spending Breakdown Service
 * Uses OpenAI ChatGPT to generate daily spending schedules and recommendations
 * Based on real economic data and user financial profile
 */

import {
	getEconomicData,
	generateEconomicContext,
} from "./economicDataService";
import { delayApiCall } from "./rateLimiter";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

/**
 * Generate AI-powered daily spending breakdown for a specific date
 * @param {Object} userProfile - User's financial profile
 * @param {Date} date - The date to generate spending for
 * @param {number} dailyBudget - The daily budget limit
 * @returns {Promise<Object>} - Daily spending breakdown
 */
export const generateDailySpendingBreakdown = async (
	userProfile,
	date,
	dailyBudget
) => {
	if (!OPENAI_API_KEY) {
		console.warn("⚠️ OpenAI API key not configured. Using local spending breakdown.");
		return generateLocalSpendingBreakdown(userProfile, dailyBudget);
	}

	// Check if user prefers offline mode
	const offlineMode = localStorage.getItem("offlineMode") === "true";
	if (offlineMode) {
		console.log("📴 Offline mode enabled. Using local spending breakdown.");
		return generateLocalSpendingBreakdown(userProfile, dailyBudget);
	}

	try {
		// Fetch current economic data
		const economicData = await getEconomicData();
		const economicContext = generateEconomicContext(economicData);

		const prompt = `You are a financial advisor AI specializing in realistic budget recommendations based on current economic conditions.

${economicContext}

Generate a REALISTIC daily spending schedule for ${date.toLocaleDateString()} (${date.toLocaleDateString(
			"en-US",
			{ weekday: "long" }
		)}).

Adjust all spending recommendations based on:
1. Current inflation rates and cost of living
2. Seasonal factors (heating/cooling, holiday seasons)
3. Recent commodity price trends
4. User's actual spending patterns

User Financial Profile:
- Monthly Income: $${parseFloat(userProfile.monthlyIncome) || 0}
- Housing: $${parseFloat(userProfile.housing) || 0}
- Utilities: $${parseFloat(userProfile.utilities) || 0}
- Groceries: $${parseFloat(userProfile.groceries) || 0}
- Transportation: $${parseFloat(userProfile.transportation) || 0}
- Insurance: $${parseFloat(userProfile.insurance) || 0}
- Phone: $${parseFloat(userProfile.phone) || 0}
- Internet: $${parseFloat(userProfile.internet) || 0}
- Dining Out: $${parseFloat(userProfile.dining) || 0}
- Entertainment: $${parseFloat(userProfile.entertainment) || 0}
- Subscriptions: $${parseFloat(userProfile.subscriptions) || 0}
- Shopping: $${parseFloat(userProfile.shopping) || 0}
- Gym: $${parseFloat(userProfile.gym) || 0}
- Daily Budget: $${dailyBudget}

Based on CURRENT economic conditions and this profile, generate a realistic daily budget breakdown. Include practical spending tips that account for today's economy. Return ONLY valid JSON with NO additional text:
{
  "dayOverview": "Realistic summary considering current economy and user profile",
  "economicContext": "Brief note about how current economic conditions affect this day's budget",
  "dayType": "weekday|weekend",
  "timeSlots": [
    {
      "timeRange": "6:00 AM - 9:00 AM",
      "period": "Morning",
      "suggestedAmount": amount as number,
      "activity": "Description of typical activity",
      "tips": ["tip1", "tip2"]
    }
  ],
  "totalProjected": ${dailyBudget},
  "savings": amount as number,
  "essentialBreakdown": {
    "percentage": 50,
    "amount": ${(dailyBudget * 0.5).toFixed(2)}
  },
  "discretionaryBreakdown": {
    "percentage": 30,
    "amount": ${(dailyBudget * 0.3).toFixed(2)}
  },
  "savingsBreakdown": {
    "percentage": 20,
    "amount": ${(dailyBudget * 0.2).toFixed(2)}
  }
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
							"You are a financial advisor AI that provides detailed daily spending schedules. Always respond with valid JSON only, no additional text.",
					},
					{
						role: "user",
						content: prompt,
					},
				],
				temperature: 0.7,
				max_tokens: 1000,
			}),
		});

		if (!response.ok) {
			if (response.status === 429) {
				console.warn("⚠️ OpenAI API rate limited (429). Using local fallback.");
				localStorage.setItem("apiUnavailable", "true");
				return generateLocalSpendingBreakdown(userProfile, dailyBudget);
			}
			if (response.status === 401) {
				console.warn("⚠️ OpenAI API authentication failed. Check your API key.");
				localStorage.setItem("apiUnavailable", "true");
			} else if (response.status === 403) {
				console.warn("⚠️ OpenAI API access forbidden. Check account billing.");
				localStorage.setItem("apiUnavailable", "true");
			}
			console.error("OpenAI API error:", response.statusText);
			return generateLocalSpendingBreakdown(userProfile, dailyBudget);
		}

		const data = await response.json();
		const content = data.choices[0].message.content;

		// Extract JSON from response (in case there's extra text)
		const jsonMatch = content.match(/\{[\s\S]*\}/);
		if (!jsonMatch) {
			throw new Error("Could not parse AI response");
		}

		const spending = JSON.parse(jsonMatch[0]);
		return {
			...spending,
			date: date.toISOString().split("T")[0],
			source: "ai",
		};
	} catch (error) {
		console.error("Error generating AI spending breakdown:", error);
		return generateLocalSpendingBreakdown(userProfile, dailyBudget);
	}
};

/**
 * Generate local spending breakdown (fallback when API is not available)
 * Uses rule-based approach for daily spending distribution with economic awareness
 * @param {Object} userProfile - User's financial profile
 * @param {number} dailyBudget - The daily budget limit
 * @returns {Object} - Daily spending breakdown
 */
export const generateLocalSpendingBreakdown = (userProfile, dailyBudget) => {
	// Load economicData from cache
	let economicData = { indicators: {} };
	try {
		const cached = localStorage.getItem("economicDataCache");
		if (cached) {
			economicData = JSON.parse(cached);
		}
	} catch (error) {
		console.warn("Could not load economic data cache", error);
	}
	const { indicators } = economicData;

	// Apply economic adjustments to spending
	let essentials = dailyBudget * 0.5;
	let discretionary = dailyBudget * 0.3;
	let savings = dailyBudget * 0.2;

	// Adjust for inflation if high
	if (indicators?.inflation?.current > 3) {
		essentials = dailyBudget * 0.55;
		discretionary = dailyBudget * 0.25;
		savings = dailyBudget * 0.2;
	}

	// Adjust for seasonal heating/cooling costs
	if (indicators?.seasonal?.heating_cooling?.impact === "high") {
		essentials = dailyBudget * 0.58;
		discretionary = dailyBudget * 0.22;
		savings = dailyBudget * 0.2;
	}

	// Adjust for holiday periods
	if (indicators?.seasonal?.holiday_buffer?.buffer > 0) {
		discretionary = dailyBudget * (0.3 + indicators.seasonal.holiday_buffer.buffer);
		essentials = dailyBudget * 0.5;
		savings = dailyBudget * (0.2 - (indicators.seasonal.holiday_buffer.buffer / 2));
	}

	// Generate smart time-based spending recommendations
	const timeSlots = [
		{
			timeRange: "6:00 AM - 9:00 AM",
			period: "Morning",
			suggestedAmount: essentials * 0.15, // ~15% of essential budget
			activity: "Breakfast and morning commute",
			tips: [
				"Prepare breakfast at home",
				"Use public transit or carpool",
				"Brew coffee before leaving",
			],
		},
		{
			timeRange: "9:00 AM - 12:00 PM",
			period: "Mid-Morning",
			suggestedAmount: 0,
			activity: "Work/activities",
			tips: [
				"Bring lunch from home",
				"Avoid unnecessary shopping",
				"Stay focused on work",
			],
		},
		{
			timeRange: "12:00 PM - 1:00 PM",
			period: "Lunch",
			suggestedAmount: essentials * 0.2, // ~20% of essential budget
			activity: "Lunch break",
			tips: [
				"Pack lunch from home",
				"Limit dining out to occasional treats",
			],
		},
		{
			timeRange: "1:00 PM - 5:00 PM",
			period: "Afternoon",
			suggestedAmount: discretionary * 0.1, // ~10% of discretionary
			activity: "Work/activities",
			tips: [
				"Avoid coffee shop visits",
				"Skip impulsive purchases",
				"Plan evening activities",
			],
		},
		{
			timeRange: "5:00 PM - 7:00 PM",
			period: "Evening Commute",
			suggestedAmount: essentials * 0.1, // ~10% of essential
			activity: "Commute home",
			tips: [
				"Use same transit as morning",
				"Consider walking or biking",
			],
		},
		{
			timeRange: "7:00 PM - 10:00 PM",
			period: "Evening",
			suggestedAmount: discretionary * 0.6, // ~60% of discretionary
			activity: "Dining/entertainment/relaxation",
			tips: [
				"Limit dining out to budgeted amount",
				"Choose free entertainment",
				"Spend time with family/friends",
			],
		},
		{
			timeRange: "10:00 PM - 6:00 AM",
			period: "Night",
			suggestedAmount: 0,
			activity: "Sleep",
			tips: ["No spending expected", "Rest and recharge"],
		},
	];

	const totalProjected = timeSlots.reduce(
		(sum, slot) => sum + slot.suggestedAmount,
		0
	);

	// Generate economic context message
	let economicContextMessage = "Economic context: Standard budgeting applies.";
	if (indicators?.inflation?.current > 3) {
		economicContextMessage = `Inflation at ${indicators.inflation.current}%. Adjusted budget prioritizes essentials. ${indicators.inflation.impact}`;
	}
	if (indicators?.seasonal?.heating_cooling?.impact === "high") {
		economicContextMessage = indicators.seasonal.heating_cooling.advice;
	}

	return {
		dayOverview: `Smart spending plan for a $${dailyBudget} budget day. Focus on essentials in the morning and commute, discretionary spending in the evening.`,
		economicContext: economicContextMessage,
		dayType: new Date().getDay() % 6 === 0 ? "weekend" : "weekday",
		timeSlots,
		totalProjected: parseFloat(totalProjected.toFixed(2)),
		savings: parseFloat((dailyBudget - totalProjected).toFixed(2)),
		essentialBreakdown: {
			percentage: 50,
			amount: parseFloat(essentials.toFixed(2)),
		},
		discretionaryBreakdown: {
			percentage: 30,
			amount: parseFloat(discretionary.toFixed(2)),
		},
		savingsBreakdown: {
			percentage: 20,
			amount: parseFloat(savings.toFixed(2)),
		},
		date: new Date().toISOString().split("T")[0],
		source: "local",
	};
};

/**
 * Generate AI spending breakdown for a date range
 * @param {Object} userProfile - User's financial profile
 * @param {Date} startDate - Start date of range
 * @param {Date} endDate - End date of range
 * @param {number} dailyBudget - The daily budget limit
 * @returns {Promise<Array>} - Array of daily spending breakdowns
 */
export const generateRangeSpendingBreakdown = async (
	userProfile,
	startDate,
	endDate,
	dailyBudget
) => {
	const results = [];
	const currentDate = new Date(startDate);

	while (currentDate <= endDate) {
		const breakdown = await generateDailySpendingBreakdown(
			userProfile,
			new Date(currentDate),
			dailyBudget
		);
		results.push(breakdown);
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return results;
};
