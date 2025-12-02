/**
 * AI Chat Service
 * Handles all conversations with ChatGPT for budget advice
 * Incorporates economic data and user context
 */

import {
	getEconomicData,
	generateEconomicContext,
} from "./economicDataService";
import { delayApiCall } from "./rateLimiter";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

/**
 * Generate budget advice based on user question
 * @param {Object} userProfile - User's financial profile
 * @param {Object} budgetPlan - User's current budget plan with metadata
 * @param {number} dailyBudget - The daily budget limit
 * @param {Date} selectedDate - The selected date
 * @param {string} userQuestion - User's question
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<string>} - AI response
 */
export const generateBudgetAdvice = async (
	userProfile,
	budgetPlan,
	dailyBudget,
	selectedDate,
	userQuestion,
	conversationHistory = []
) => {
	if (!OPENAI_API_KEY) {
		console.warn("⚠️ OpenAI API key not configured. Using local budget advice.");
		return getLocalBudgetAdvice(
			userProfile,
			budgetPlan,
			dailyBudget,
			userQuestion,
			selectedDate
		);
	}

	// Check if user prefers offline mode
	const offlineMode = localStorage.getItem("offlineMode") === "true";
	if (offlineMode) {
		console.log("📴 Offline mode enabled. Using local budget advice.");
		return getLocalBudgetAdvice(
			userProfile,
			budgetPlan,
			dailyBudget,
			userQuestion,
			selectedDate
		);
	}

	try {
		// Get economic data for context
		const economicData = await getEconomicData();
		const economicContext = generateEconomicContext(economicData);

		// Build budget plan context with goal information
		let budgetContext = "";
		if (budgetPlan) {
			budgetContext = `
User's Active Budget Plan:
- Plan Name: ${budgetPlan.name}
- Plan Reason: ${budgetPlan.reason}
- Duration: ${budgetPlan.startDate} to ${budgetPlan.endDate}
- Status: ${budgetPlan.status}`;
			
			// Add goal context if present
			if (budgetPlan.goalType && budgetPlan.goalType !== "skip") {
				if (budgetPlan.goalType === "total") {
					budgetContext += `
- 🎯 MONETARY GOAL: User wants to save a TOTAL of $${budgetPlan.monetaryGoal} during this budget period`;
				} else if (budgetPlan.goalType === "monthly") {
					budgetContext += `
- 📅 MONTHLY GOAL: User wants to save $${budgetPlan.monthlyGoal} every month`;
				}
			}
		}

		// Build conversation context
		const systemPrompt = `You are an expert financial advisor AI specialized in personal budgeting and current financial events. You have comprehensive access to the user's financial profile, active budget plan, and current economic data.

${economicContext}

${budgetContext}

CRITICAL CAPABILITIES - You can now discuss:
1. Current economic events and their financial impact
2. Market trends affecting household budgets
3. Geopolitical events with economic implications
4. Inflation trends and cost-of-living impacts
5. Interest rates and how they affect borrowing/savings
6. Stock market movements and investment implications
7. Employment trends and job market conditions
8. Housing market and real estate implications
9. Currency exchange rates for travelers/international transactions
10. Seasonal economic patterns and holidays
11. 🎯 GOAL-FOCUSED ADVICE: When user has set a monetary goal, provide specific tips to reach it

GOAL-SPECIFIC GUIDANCE:
If the user has a TOTAL SAVINGS GOAL:
- Calculate required monthly savings rate
- Suggest specific expense cuts to meet goal
- Recommend investment strategies for savings
- Track progress milestones

If the user has a MONTHLY SAVINGS GOAL:
- Verify current budget allocation
- Suggest discretionary spending reductions
- Recommend side income opportunities if needed
- Provide weekly savings checkpoints

IMPORTANT: When users ask "HOW do I reach my goal?" or "TIPS to improve budget?" provide specific, actionable options organized in a clear format.

Key principles:
1. Provide practical, actionable advice when possible
2. Always consider current economic conditions and recent events
3. Use the 50/30/20 rule as a baseline (50% essentials, 30% discretionary, 20% savings)
4. Adjust recommendations based on inflation, market conditions, and seasonal factors
5. Prioritize goal achievement when recommendations conflict with general guidelines
6. Be empathetic and supportive
7. Ask clarifying questions if needed
8. Provide specific numbers and percentages when giving advice
9. If you cannot directly answer a question, be honest about it and suggest related budget topics you CAN help with
10. Connect current events to the user's personal finances when relevant
11. Reference their active budget plan and goals when discussing long-term planning
12. When asked for improvement tips, focus on realistic changes that support their stated goals

User's Financial Profile:
- Monthly Income: $${parseFloat(userProfile?.monthlyIncome) || 0}
- Daily Budget: $${dailyBudget}
- Employment Status: ${userProfile?.employmentStatus || "Not specified"}
- Industry: ${userProfile?.industry || "Not specified"}
- Work Hours/Week: ${userProfile?.workHoursPerWeek || "Not specified"}
- Dependents: ${userProfile?.dependents || 0}
- Housing: $${parseFloat(userProfile?.housing) || 0}
- Utilities: $${parseFloat(userProfile?.utilities) || 0}
- Groceries: $${parseFloat(userProfile?.groceries) || 0}
- Transportation: $${parseFloat(userProfile?.transportation) || 0}
- Insurance: $${parseFloat(userProfile?.insurance) || 0}
- Phone & Internet: $${parseFloat(userProfile?.phone || 0) + parseFloat(userProfile?.internet || 0)}
- Dining Out: $${parseFloat(userProfile?.dining) || 0}
- Entertainment: $${parseFloat(userProfile?.entertainment) || 0}
- Subscriptions: $${parseFloat(userProfile?.subscriptions) || 0}
- Shopping: $${parseFloat(userProfile?.shopping) || 0}
- Gym: $${parseFloat(userProfile?.gym) || 0}
- Credit Card Payments: $${parseFloat(userProfile?.creditCardPayment) || 0}
- Student Loans: $${parseFloat(userProfile?.studentLoan) || 0}
- Personal Loans: $${parseFloat(userProfile?.personalLoan) || 0}

Current Date: ${selectedDate.toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		})}

Response Guidelines:
- Keep responses concise but informative (2-3 paragraphs max)
- Use emojis sparingly for emphasis
- Connect current events to the user's specific financial situation
- Reference their budget plan when discussing planning horizons
- If asked "where should I shop" or "what are alternatives", provide OPTIONS in a clear numbered or bulleted format
- If you CANNOT answer: Say so clearly, then suggest 2-3 related budget topics you CAN help with
- Always provide actionable recommendations
- Consider seasonal factors and upcoming economic events`;

		// Build messages array for conversation
		const messages = [
			{
				role: "system",
				content: systemPrompt,
			},
		];

		// Add conversation history (last 5 exchanges to keep context)
		const recentHistory = conversationHistory.slice(-10);
		recentHistory.forEach((msg) => {
			messages.push({
				role: msg.type === "user" ? "user" : "assistant",
				content: msg.text,
			});
		});

		// Add current user question
		messages.push({
			role: "user",
			content: userQuestion,
		});

		// Call OpenAI API
		await delayApiCall();
		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${OPENAI_API_KEY}`,
			},
			body: JSON.stringify({
				model: "gpt-3.5-turbo",
				messages: messages,
				temperature: 0.7,
				max_tokens: 600,
				top_p: 0.9,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			if (response.status === 429) {
				console.warn("⚠️ OpenAI API rate limited (429). Using local advice.");
				localStorage.setItem("apiUnavailable", "true");
			} else if (response.status === 401) {
				console.warn("⚠️ OpenAI API authentication failed. Check your API key.");
				localStorage.setItem("apiUnavailable", "true");
			} else if (response.status === 403) {
				console.warn("⚠️ OpenAI API access forbidden. Check account billing.");
				localStorage.setItem("apiUnavailable", "true");
			}
			throw new Error(
				errorData.error?.message || `API error: ${response.status}`
			);
		}

		const data = await response.json();
		const aiResponse = data.choices[0]?.message?.content;

		if (!aiResponse) {
			console.error("No response content from AI:", data);
			throw new Error("No response from AI");
		}

		return aiResponse;
	} catch (error) {
		console.error("Error generating budget advice:", error.message);
		console.error("Full error:", error);
		return getLocalBudgetAdvice(
			userProfile,
			budgetPlan,
			dailyBudget,
			userQuestion,
			selectedDate
		);
	}
};

/**
 * Get local budget advice (fallback when API fails)
 * Uses rule-based responses for common budget questions
 * @param {Object} userProfile - User's financial profile
 * @param {Object} budgetPlan - User's active budget plan
 * @param {number} dailyBudget - Daily budget
 * @param {string} question - User's question
 * @param {Date} selectedDate - Selected date
 * @returns {string} - Local advice
 */
const getAlternativeRecommendations = (budgetPlan) => {
	const budgetInfo = budgetPlan ? `

📋 Your Active Budget Plan: "${budgetPlan.name}"
• Duration: ${budgetPlan.startDate} to ${budgetPlan.endDate}` : "";

	return `Here are budget-related topics I CAN help you with:

💡 Budget Planning & Spending:
• "How should I spend today?"
• "How do I allocate my monthly budget?"
• "What's the 50/30/20 rule and how do I apply it?"

💰 Savings Strategies:
• "How can I save more money?"
• "What are quick ways to cut expenses?"
• "How do I build an emergency fund?"

📈 Economic & Market Understanding:
• "How is inflation affecting my budget?"
• "What economic factors should I monitor?"
• "How do current events impact my finances?"
• "How do seasonal changes affect spending?"
• "What about interest rates and borrowing costs?"

🛍️ Smart Purchasing:
• "Is it a good time to buy [item]?"
• "How do I make smart purchase decisions?"
• "Should I wait for a sale or buy now?"

📊 Expense Tracking & Analysis:
• "How do I track my spending?"
• "What are my biggest expenses?"
• "How can I optimize category spending?"

Try asking me one of these, or tell me what aspect of your budget you'd like to improve! 🎯${budgetInfo}`;
};

const getLocalBudgetAdvice = (userProfile, budgetPlan, dailyBudget, question, selectedDate) => {
	const lowerQuestion = question.toLowerCase();

	// SHOPPING & BUYING QUESTIONS - Provide options
	if (
		lowerQuestion.includes("where should") ||
		lowerQuestion.includes("where can i") ||
		lowerQuestion.includes("alternatives") ||
		lowerQuestion.includes("options for") ||
		lowerQuestion.includes("what are") ||
		lowerQuestion.includes("shop for") ||
		(lowerQuestion.includes("can't afford") && (lowerQuestion.includes("shop") || lowerQuestion.includes("buy")))
	) {
		// Detect what category they're asking about
		if (lowerQuestion.includes("grocery") || lowerQuestion.includes("groceries") || lowerQuestion.includes("food")) {
			return getGroceryShoppingOptions(userProfile);
		}
		if (lowerQuestion.includes("entertainment") || lowerQuestion.includes("fun") || lowerQuestion.includes("movies")) {
			return getEntertainmentOptions(userProfile);
		}
		if (lowerQuestion.includes("restaurant") || lowerQuestion.includes("dining") || lowerQuestion.includes("eat")) {
			return getDiningOutOptions(userProfile);
		}
		if (lowerQuestion.includes("gym") || lowerQuestion.includes("fitness") || lowerQuestion.includes("workout")) {
			return getGymAlternatives(userProfile);
		}
		if (lowerQuestion.includes("subscription") || lowerQuestion.includes("streaming")) {
			return getSubscriptionAlternatives();
		}
		if (lowerQuestion.includes("shopping") || lowerQuestion.includes("clothes") || lowerQuestion.includes("buy")) {
			return getShoppingAlternatives(userProfile);
		}
		// Generic options response
		return getGenericAlternatives();
	}

	// Budget spending questions
	if (
		lowerQuestion.includes("how should") ||
		lowerQuestion.includes("spend today") ||
		lowerQuestion.includes("budget recommendation")
	) {
		const essentials = (dailyBudget * 0.5).toFixed(2);
		const discretionary = (dailyBudget * 0.3).toFixed(2);
		const savings = (dailyBudget * 0.2).toFixed(2);

		return `Based on your daily budget of $${dailyBudget}, here's how I recommend you spend today:

📊 Budget Breakdown:
• 🏠 Essentials (50%): $${essentials} - Food, transportation, bills
• 🎉 Discretionary (30%): $${discretionary} - Entertainment, dining out
• 💰 Savings (20%): $${savings} - Emergency fund, investments

💡 Today's Tips:
• Start the day by planning your meals
• Bring lunch from home if possible
• Limit non-essential purchases to your discretionary budget
• Track every expense as you spend

Would you like specific advice on any category?`;
	}

	// Inflation and economic questions
	if (
		lowerQuestion.includes("inflation") ||
		lowerQuestion.includes("economic") ||
		lowerQuestion.includes("price") ||
		lowerQuestion.includes("cost of living")
	) {
		return `💭 Economic Impact on Your Budget:

Current economic conditions are affecting household budgets significantly:

📈 Recent Trends:
• Inflation is moderate at ~3%, primarily affecting groceries and utilities
• Food prices remain elevated compared to previous years
• Energy costs fluctuate with seasons
• Job market remains relatively stable

🎯 What You Should Do:
• Buy seasonal produce - cheaper and often better quality
• Stock up on non-perishables when they're on sale
• Consider generic brands to save 20-30%
• Monitor your utility usage seasonally
• Build a 3-6 month emergency fund

Would you like specific recommendations for your situation?`;
	}

	// Savings questions
	if (
		lowerQuestion.includes("save") ||
		lowerQuestion.includes("saving") ||
		lowerQuestion.includes("more money")
	) {
		return `💡 Ways to Save More Money:

Based on your profile, here are targeted strategies:

🎯 Quick Wins (Save $50-100/month):
• Switch to generic brands: ~$30/month
• Cancel unused subscriptions: ~$20/month
• Use public transit 1-2x weekly: ~$20/month

📊 Medium Term (Save $100-200/month):
• Meal prep on Sundays: ~$50/month
• Reduce dining out by 50%: ~$100/month
• Shop sales for groceries: ~$50/month

🏆 Long Term (Save $200+/month):
• Negotiate insurance rates
• Switch to lower phone plan
• Find free entertainment options

Start with one or two strategies and build from there. Small changes compound!`;
	}

	// Spending strategy questions
	if (
		lowerQuestion.includes("should i") ||
		lowerQuestion.includes("purchase") ||
		lowerQuestion.includes("buy") ||
		lowerQuestion.includes("good time")
	) {
		return `🤔 Purchase Decision Framework:

Before buying anything, ask yourself:

1️⃣ Is this an essential or discretionary item?
   - Essentials: Necessary for survival/daily life
   - Discretionary: Nice to have

2️⃣ Do I have budget available?
   - Your daily discretionary budget: $${(dailyBudget * 0.3).toFixed(2)}
   - Today's spending so far: [track as you go]

3️⃣ Is this the right time?
   - Can I wait for a sale?
   - Is there a cheaper alternative?
   - Do I already have something similar?

4️⃣ Impact Assessment:
   - Will this affect other budget areas?
   - Can I still save $${(dailyBudget * 0.2).toFixed(2)} today?

💡 Rule of Thumb: If you're unsure, wait 24 hours before buying.`;
	}

	// Default response - when we can't determine what to help with
	return `I'm here to help with your budget! 💰

${getAlternativeRecommendations(budgetPlan)}`;
};

/**
 * Get affordable grocery shopping options
 */
function getGroceryShoppingOptions(userProfile) {
	const budgetAllocation = (parseFloat(userProfile?.groceries) || 300);
	const dailyGroceryBudget = (budgetAllocation / 30).toFixed(2);

	return `🛒 Affordable Grocery Shopping Options:

Your Current Budget: $${budgetAllocation}/month (~$${dailyGroceryBudget}/day)

💰 Budget-Friendly Stores:
1. **Aldi** - Known for low prices on staples (save 15-20% vs regular stores)
2. **Walmart** - Great for bulk purchases and sales
3. **Costco/Sam's Club** - Bulk buying saves 20-30% (membership fee ~$50-60/year)
4. **Trader Joe's** - Good for organic items at reasonable prices
5. **Local Markets** - Often have better deals on produce than chains
6. **ALDI & Store Brands** - Save $${(budgetAllocation * 0.25).toFixed(2)}/month by switching to store brands

💡 Money-Saving Tips:
• Shop with a list - avoid impulse purchases ($${(budgetAllocation * 0.1).toFixed(2)}/month savings)
• Buy seasonal produce - 30-50% cheaper than off-season
• Use coupons & apps (Ibotta, Checkout 51) - $${(budgetAllocation * 0.05).toFixed(2)}/month
• Buy generic brands - Same quality, 20-30% cheaper
• Buy chicken/rice/beans in bulk - Cheapest proteins

📊 Potential Savings:
With these strategies, you could save $${(budgetAllocation * 0.35).toFixed(2)}/month on groceries!

Would you like specific meal planning tips to stay within budget?`;
}

/**
 * Get affordable dining out options
 */
function getDiningOutOptions(userProfile) {
	const diningBudget = (parseFloat(userProfile?.dining) || 200);
	const dailyDiningBudget = (diningBudget / 30).toFixed(2);

	return `🍽️ Affordable Dining Out Options:

Your Current Budget: $${diningBudget}/month (~$${dailyDiningBudget}/day)

💰 Budget-Friendly Restaurants:
1. **Chipotle/Panera** - $8-12 meals, filling portions
2. **Taco Bell/Wendy's** - $5-7 meals, satisfying
3. **Local food trucks** - Often $6-10 for quality meals
4. **Ethnic restaurants** - Chinese, Indian, Thai often $8-12 for large portions
5. **Happy Hour deals** - Many restaurants offer 50% off 4-7pm
6. **Buffets** - Pay once, eat unlimited (Indian, Chinese, Brazilian)

🤑 Money-Saving Strategies:
• Use apps (DoorDash, Uber Eats) - Often have $10-15 off first order
• Go to lunch instead of dinner - Lunch specials are 30-40% cheaper
• Skip drinks and dessert - Save $4-6 per meal
• Share entrees - Most restaurant portions are huge
• Visit ethnic neighborhoods - $${diningBudget * 0.4}/month cheaper

📊 Affordable Options by Budget:
• **Tight Budget ($5-8)**: Food trucks, value menus, ethnic spots
• **Medium Budget ($10-15)**: Local restaurants, lunch specials
• **Social Dining ($15-20)**: Date nights at casual restaurants

💡 Pro Tip: Meal prep 3-4 times per week to reduce dining out by 50%!

Can you dine out less and cook at home more?`;
}

/**
 * Get gym and fitness alternatives
 */
function getGymAlternatives(userProfile) {
	const gymBudget = (parseFloat(userProfile?.gym) || 50);

	return `💪 Affordable Fitness & Gym Alternatives:

Your Current Budget: $${gymBudget}/month

💰 Budget-Friendly Options:
1. **Planet Fitness** - $10-15/month (no contract, very affordable)
2. **YMCA** - $30-50/month (sliding scale, very inclusive)
3. **Anytime Fitness** - $30-35/month (24/7 access)
4. **LA Fitness** - $20-30/month (group classes included)
5. **Apple Fitness+** - $10/month (home workouts)
6. **YouTube/Apps** - FREE! (FitnessBlender, Nike Training Club, Peloton Free)

🆓 FREE Fitness Alternatives:
• **Running/Walking** - Completely free (parks, trails, neighborhoods)
• **Home Workouts** - YouTube channels (1M+ views with great trainers)
• **Parks/Recreation Centers** - Often FREE or $5-10 classes
• **Group fitness apps** - Strava, AllTrails for running communities
• **Home equipment** - Dumbbells, yoga mat, resistance bands (~$20-50 one-time)
• **Bodyweight exercises** - Push-ups, squats, planks, lunges

💡 Hybrid Approach:
• Use FREE YouTube workouts (FitnessBlender, AthleanX) during week
• 1-2x per week gym for heavy lifting or pool
• Saves you $${(gymBudget * 0.5).toFixed(2)}-$${gymBudget}/month!

📊 Your Savings Potential:
• **Switch to Planet Fitness**: Save $${(gymBudget - 15).toFixed(2)}/month
• **Try home workouts**: Save $${gymBudget}/month
• **Hybrid approach**: Save $${(gymBudget * 0.5).toFixed(2)}/month

Would you like workout recommendations for home?`;
}

/**
 * Get entertainment alternatives
 */
function getEntertainmentOptions(userProfile) {
	const entertainmentBudget = (parseFloat(userProfile?.entertainment) || 100);

	return `🎬 Affordable Entertainment Options:

Your Current Budget: $${entertainmentBudget}/month

💰 Budget-Friendly Entertainment:
1. **Movie Nights**: 
   - Streaming services (Netflix $7, Disney+ $5, HBOMax $10) - SHARE accounts!
   - Matinee movies ($6-8 vs $12-15)
   - Free movie apps (Tubi, Pluto TV, Free Movies - no subscription!)

2. **Outdoor Activities (FREE/Cheap)**:
   - Park walks/hiking trails - FREE
   - Beach days - FREE
   - Picnics - $5-10
   - Farmers markets - Browse for FREE, buy cheap produce

3. **Social Activities**:
   - Game nights at home - $10-20 for snacks/drinks
   - Potlucks with friends - $5-10 per person
   - Community events - Often FREE
   - Volunteer activities - FREE and fulfilling

🆓 FREE Entertainment:
• Library - Free books, movies, games, sometimes concerts
• Community centers - Free classes, events
• Meetup.com - Free social groups
• Festivals & farmers markets - FREE to attend
• Bookstores - Free coffee + browsing (buy nothing!)

📊 Streaming Smart:
• Instead of 5 subscriptions ($60/month), share accounts or rotate
• Borrow passwords from family - Save $${entertainmentBudget * 0.5}/month
• Use free trials strategically - Try without paying

💡 Money-Saving Strategy:
• Mix: 1-2 streaming services ($10-15) + free activities + occasional outing
• Saves you $${(entertainmentBudget * 0.6).toFixed(2)}/month

What types of entertainment do you enjoy most?`;
}

/**
 * Get subscription alternatives
 */
function getSubscriptionAlternatives() {
	return `📱 Streaming & Subscription Alternatives:

💰 Smart Subscription Strategy:
1. **Share Accounts**: Netflix, Disney+, Hulu (split cost with family)
   - Netflix: Share plan = $7-10 per person instead of $15
   - Disney Bundle: $14 for 3 services!
   - HBOMax: Share with 1 other person

2. **Free Alternatives**:
   - **Movies**: Tubi, Pluto TV, Freevee (all FREE)
   - **Music**: Spotify Free (with ads), YouTube Music Free, Pandora Free
   - **TV Shows**: Free ad-supported services on YouTube, Roku Channel
   - **Books**: Libby App (borrow free from library!)

3. **Rotate Subscriptions**:
   - Subscribe for 1-2 months, cancel, switch to another
   - Catch all the shows you want over the year
   - Pay for 4-6 months instead of 12

📊 Subscription Audit:
Ask yourself about EACH subscription:
• ✓ Do I use this weekly? 
• ✓ Can I get it free elsewhere?
• ✓ Can I borrow someone's login?
• ✗ If not, CANCEL IT!

💡 Recommended Bundle:
• Netflix ($7-10) + Disney Bundle ($14) = $21-24/month
• Free services fill the rest
• Traditional cost: $80-100/month → Your cost: $25/month
• **SAVES YOU $75+/MONTH!**

🎯 Action Plan:
1. List all current subscriptions this month
2. Mark which ones you actually use
3. Cancel ones you haven't used in 30 days
4. Switch to free/shared alternatives

Ready to save some money? What subscriptions do you have?`;
}

/**
 * Get shopping alternatives
 */
function getShoppingAlternatives(userProfile) {
	const shoppingBudget = (parseFloat(userProfile?.shopping) || 100);

	return `🛍️ Smart Shopping Alternatives:

Your Current Budget: $${shoppingBudget}/month

💰 Budget-Friendly Shopping Options:
1. **Thrift Stores** - Save 70-80% on clothes
   - Goodwill, Salvation Army - $2-5 per item
   - Local consignment shops - $3-10 per item
   - Vs full price: $30-50 per item

2. **Outlet Stores** - Save 30-50% on brand names
   - Nike Outlet, Gap Outlet, J.Crew Factory
   - Same quality, just last season's styles

3. **Fast Fashion** - Very affordable new clothes
   - H&M, Target, Old Navy - $5-15 per item
   - Shein (risky but cheap) - $2-8 per item

4. **Secondhand Online** - Safe, easy, cheap
   - Poshmark - Clothes from $3-10
   - ThredUp - $5-15 per item, free shipping
   - Facebook Marketplace - Negotiate prices directly
   - Depop - Trendy pieces, $5-20 range

🆓 FREE Shopping Options:
• Clothing swaps with friends
• Hand-me-downs from family
• Buy Nothing groups on Facebook
• Freecycle.org - People giving away free items
• Clothing libraries - Rent clothes monthly

💡 Shopping Smart:
• Don't buy new when thrift has options - Save $${(shoppingBudget * 0.7).toFixed(2)}/month
• Wait for sales (Black Friday, end of season) - Save 30-50%
• Make a list, don't shop impulsively - Avoid $${(shoppingBudget * 0.2).toFixed(2)}/month waste
• Quality over quantity - Buy less, keeps longer

📊 Your Savings Potential:
• **All thrift/secondhand**: Save $${(shoppingBudget * 0.7).toFixed(2)}/month
• **Mix thrift + outlet sales**: Save $${(shoppingBudget * 0.4).toFixed(2)}/month
• **Smart shopping**: Save $${(shoppingBudget * 0.2).toFixed(2)}/month

🎯 Challenge: Buy nothing new for 30 days, shop secondhand instead!

What type of shopping can you do secondhand?`;
}

/**
 * Generic alternatives response
 */
function getGenericAlternatives() {
	return `🤔 Need Options? I Can Help!

I can provide specific alternatives for:

🛒 **Shopping & Groceries**
- "Where should I buy groceries on a budget?"
- "What are alternatives to my grocery store?"

🍽️ **Dining Out**
- "Where can I eat affordably?"
- "What cheap restaurant options are nearby?"

💪 **Fitness & Gym**
- "What are alternatives to expensive gyms?"
- "How can I exercise without a gym membership?"

🎬 **Entertainment**
- "What free activities can I do?"
- "Where can I find cheap entertainment options?"

🛍️ **Shopping**
- "Where can I buy clothes cheaply?"
- "What are secondhand shopping options?"

📱 **Subscriptions**
- "How can I save on streaming services?"
- "What free alternatives exist?"

**Try asking me:**
• "Where should I shop for [item] on a budget?"
• "What are alternatives to [service]?"
• "How can I save on [category]?"

What would you like budget-friendly options for?`;
}

/**
 * Generate goal-specific improvement tips
 * @param {Object} userProfile - User's financial profile
 * @param {Object} budgetPlan - User's budget plan with goal info
 * @param {Object} breakdown - Budget breakdown data
 * @returns {Promise<string>} - Goal improvement tips
 */
export const generateGoalImprovementTips = async (
	userProfile,
	budgetPlan,
	breakdown
) => {
	if (!budgetPlan || !budgetPlan.goalType || budgetPlan.goalType === "skip") {
		return "You haven't set a specific goal yet. Create a budget plan with a goal to get personalized improvement tips!";
	}

	if (!OPENAI_API_KEY) {
		return getLocalGoalTips(userProfile, budgetPlan, breakdown);
	}

	const offlineMode = localStorage.getItem("offlineMode") === "true";
	if (offlineMode) {
		return getLocalGoalTips(userProfile, budgetPlan, breakdown);
	}

	try {
		const systemPrompt = `You are an expert financial advisor specializing in helping people reach their savings goals. Analyze the user's profile and budget, then provide 5-7 specific, actionable tips to help them reach their goal.

User Profile:
- Monthly Income: $${userProfile?.monthlyIncome || 0}
- Goal Type: ${budgetPlan.goalType === "total" ? "Total Savings Goal" : "Monthly Savings Goal"}
- Goal Amount: $${budgetPlan.goalType === "total" ? budgetPlan.monetaryGoal : budgetPlan.monthlyGoal}
- Current Savings Allocated: $${breakdown?.customBreakdown?.savings?.amount || 0}
- Savings Rate: ${breakdown?.customBreakdown?.savings?.percentage || 0}%

Categories:
${Object.entries(breakdown?.customBreakdown || {})
	.filter(([key]) => key !== "savings")
	.map(([key, cat]) => `- ${key}: $${cat.amount} (${cat.percentage}%)`)
	.join("\n")}

Provide tips in this exact format:
1. [Tip 1]: [Action] - Save $[amount] per month
2. [Tip 2]: [Action] - Save $[amount] per month
... (continue for 5-7 tips)

TOTAL POTENTIAL SAVINGS: $[total] per month

Be specific with dollar amounts and realistic. Focus on the categories where they have the most flexibility.`;

		const messages = [
			{
				role: "system",
				content: systemPrompt,
			},
			{
				role: "user",
				content: `Based on my profile and goal, what specific improvements can I make to reach my ${budgetPlan.goalType === "total" ? "total savings goal" : "monthly savings goal"}?`,
			},
		];

		await delayApiCall();
		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${OPENAI_API_KEY}`,
			},
			body: JSON.stringify({
				model: "gpt-3.5-turbo",
				messages: messages,
				temperature: 0.7,
				max_tokens: 600,
			}),
		});

		if (!response.ok) {
			console.error("OpenAI API error:", response.statusText);
			return getLocalGoalTips(userProfile, budgetPlan, breakdown);
		}

		const data = await response.json();
		return data.choices?.[0]?.message?.content || getLocalGoalTips(userProfile, budgetPlan, breakdown);
	} catch (error) {
		console.error("Error generating goal tips:", error);
		return getLocalGoalTips(userProfile, budgetPlan, breakdown);
	}
};

/**
 * Local goal improvement tips generator
 */
const getLocalGoalTips = (userProfile, budgetPlan, breakdown) => {
	const monthlyIncome = parseFloat(userProfile?.monthlyIncome) || 0;
	const currentSavings = breakdown?.customBreakdown?.savings?.amount || 0;
	const goal = budgetPlan.goalType === "total" ? budgetPlan.monetaryGoal : budgetPlan.monthlyGoal;
	const shortfall = Math.max(0, goal - currentSavings);

	let tips = `🎯 GOAL IMPROVEMENT TIPS\n\n`;

	if (budgetPlan.goalType === "total") {
		tips += `Your Goal: Save $${budgetPlan.monetaryGoal} total\n`;
		tips += `Currently Allocated: $${currentSavings}/month\n\n`;
	} else {
		tips += `Your Goal: Save $${budgetPlan.monthlyGoal}/month\n`;
		tips += `Currently Allocated: $${currentSavings}/month\n`;
		tips += `${currentSavings >= goal ? "✅ ON TRACK!" : `⚠️ Shortfall: $${shortfall}/month`}\n\n`;
	}

	tips += `Here are ways to increase your savings:\n\n`;

	// Dining tips
	const dining = parseFloat(userProfile?.dining) || 0;
	if (dining > 0) {
		const savingsPotential = Math.round(dining * 0.3 * 100) / 100;
		tips += `1. 🍽️ **Reduce Dining Out**: Cut 30% = Save $${savingsPotential}/month\n`;
		tips += `   • Cook at home 2 more times per week\n`;
		tips += `   • Pack lunch instead of buying\n\n`;
	}

	// Entertainment tips
	const entertainment = parseFloat(userProfile?.entertainment) || 0;
	if (entertainment > 0) {
		const savingsPotential = Math.round(entertainment * 0.4 * 100) / 100;
		tips += `2. 🎬 **Entertainment Optimization**: Cut 40% = Save $${savingsPotential}/month\n`;
		tips += `   • Use free entertainment options (parks, libraries, hiking)\n`;
		tips += `   • Share streaming subscriptions with family\n\n`;
	}

	// Subscriptions tips
	const subscriptions = parseFloat(userProfile?.subscriptions) || 0;
	if (subscriptions > 0) {
		const savingsPotential = Math.round(subscriptions * 0.5 * 100) / 100;
		tips += `3. 📱 **Cancel Unused Subscriptions**: Cut 50% = Save $${savingsPotential}/month\n`;
		tips += `   • Review all active subscriptions\n`;
		tips += `   • Keep only 1-2 streaming services\n\n`;
	}

	// Shopping tips
	const shopping = parseFloat(userProfile?.shopping) || 0;
	if (shopping > 0) {
		const savingsPotential = Math.round(shopping * 0.5 * 100) / 100;
		tips += `4. 🛍️ **Smart Shopping**: Cut 50% = Save $${savingsPotential}/month\n`;
		tips += `   • Buy secondhand/thrift instead\n`;
		tips += `   • Wait for sales before purchasing\n\n`;
	}

	// Utilities tips
	const utilities = parseFloat(userProfile?.utilities) || 0;
	if (utilities > 0) {
		const savingsPotential = Math.round(utilities * 0.15 * 100) / 100;
		tips += `5. 💡 **Reduce Utilities**: Cut 15% = Save $${savingsPotential}/month\n`;
		tips += `   • Lower thermostat by 2 degrees\n`;
		tips += `   • Switch to LED bulbs\n\n`;
	}

	// Gym tips
	const gym = parseFloat(userProfile?.gym) || 0;
	if (gym > 0) {
		tips += `6. 💪 **Free Fitness**: Save $${gym}/month\n`;
		tips += `   • Use free workout videos (YouTube)\n`;
		tips += `   • Run or walk outdoors\n\n`;
	}

	const totalPotential = dining * 0.3 + entertainment * 0.4 + subscriptions * 0.5 + shopping * 0.5 + utilities * 0.15 + gym;
	tips += `📊 **Total Potential Monthly Savings: $${Math.round(totalPotential * 100) / 100}**\n\n`;
	
	if (shortfall > 0 && totalPotential < shortfall) {
		tips += `💡 **Pro Tip**: Your spending adjustments alone may not reach your goal. Consider:\n`;
		tips += `• Increasing income (side gigs, freelancing)\n`;
		tips += `• Asking for a raise\n`;
		tips += `• Selling unused items\n`;
	}

	return tips;
};

export default {
	generateBudgetAdvice,
	generateGoalImprovementTips,
};
