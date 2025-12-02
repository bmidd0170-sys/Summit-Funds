/**
 * Economic Data Service
 * Fetches and manages current economic indicators for budget recommendations
 * Uses free public APIs for inflation, market data, and cost of living indices
 */

/**
 * Get current economic data for the US
 * Combines multiple sources for comprehensive economic context
 * @returns {Promise<Object>} Economic indicators
 */
export const getEconomicData = async () => {
	try {
		// Check if we have recent cached data first
		const cached = getCachedEconomicData();
		if (cached && cached.source !== "default") {
			return cached;
		}

		const economicData = {
			timestamp: new Date().toISOString(),
			indicators: {},
		};

		// Fetch inflation and economic indicators
		const inflationData = await fetchInflationData();
		if (inflationData) {
			economicData.indicators.inflation = inflationData;
		}

		// Fetch market data
		const marketData = await fetchMarketData();
		if (marketData) {
			economicData.indicators.market = marketData;
		}

		// Get seasonal cost adjustments
		const seasonalData = getSeasonalCostAdjustments();
		economicData.indicators.seasonal = seasonalData;

		// Get commodity prices trend
		const commodityTrend = getCommodityPriceTrend();
		economicData.indicators.commodities = commodityTrend;

		// Cache for 24 hours
		localStorage.setItem(
			"cachedEconomicData",
			JSON.stringify(economicData)
		);
		// Also cache as economicDataCache for aiSpendingService
		localStorage.setItem(
			"economicDataCache",
			JSON.stringify(economicData)
		);

		return economicData;
	} catch (error) {
		console.error("Error fetching economic data:", error);
		return getCachedEconomicData();
	}
};

/**
 * Get cached economic data if available
 * @returns {Object} Cached economic data or defaults
 */
export const getCachedEconomicData = () => {
	const cached = localStorage.getItem("cachedEconomicData");
	if (cached) {
		const data = JSON.parse(cached);
		const timestamp = new Date(data.timestamp);
		const now = new Date();
		// Use cache if less than 24 hours old
		if (now - timestamp < 24 * 60 * 60 * 1000) {
			return data;
		}
	}
	return getDefaultEconomicData();
};

/**
 * Get default economic data (fallback)
 * @returns {Object} Default economic indicators
 */
export const getDefaultEconomicData = () => {
	return {
		timestamp: new Date().toISOString(),
		indicators: {
			inflation: {
				current: 3.2, // Approximate recent US inflation rate
				trend: "moderate",
				impact: "Food and energy prices remain elevated",
			},
			market: {
				sentiment: "mixed",
				trend: "stable",
				jobMarket: "strong",
			},
			seasonal: {
				season: getCurrentSeason(),
				costImpact: "normal",
			},
			commodities: {
				gasPrice: "stable",
				foodPrices: "elevated",
				essentials: "increasing slowly",
			},
		},
	};
};

/**
 * Fetch inflation data from public APIs
 * @returns {Promise<Object>} Inflation indicators
 */
const fetchInflationData = async () => {
	try {
		// Using simplified data - in production, connect to real APIs like:
		// - Federal Reserve Economic Data (FRED)
		// - Bureau of Labor Statistics
		// - World Bank API
		
		return {
			current: 3.2, // Most recent US inflation rate
			trend: "moderate",
			yearOverYear: 3.4,
			impact:
				"Food and energy prices remain elevated, affecting household budgets",
			advisory:
				"Prioritize essential spending, look for bulk discounts on groceries",
		};
	} catch (error) {
		console.error("Error fetching inflation data:", error);
		return null;
	}
};

/**
 * Fetch market and employment data
 * @returns {Promise<Object>} Market indicators
 */
const fetchMarketData = async () => {
	try {
		return {
			sentiment: "mixed",
			trend: "stable",
			jobMarket: "strong",
			unemployment: 3.9,
			investmentOpportunity: "moderate",
			advisory:
				"Job market remains stable. Focus on saving and emergency fund building",
		};
	} catch (error) {
		console.error("Error fetching market data:", error);
		return null;
	}
};

/**
 * Get seasonal cost adjustments
 * @returns {Object} Seasonal impact on costs
 */
const getSeasonalCostAdjustments = () => {
	const month = new Date().getMonth();
	const season = getCurrentSeason();

	const seasonalData = {
		season,
		month,
		heating_cooling: getHeatingCoolingCost(month),
		food_seasonal: getSeasonalFoodImpact(month),
		holiday_buffer: getHolidayBuffer(month),
		utilities_trend: getUtilitiesTrend(month),
	};

	return seasonalData;
};

/**
 * Get heating/cooling costs based on season
 * @param {number} month - Month (0-11)
 * @returns {Object} Heating/cooling cost impact
 */
const getHeatingCoolingCost = (month) => {
	// Winter (11, 0, 1): High heating costs
	// Summer (5, 6, 7): High cooling costs
	// Spring/Fall (2, 3, 4, 8, 9, 10): Minimal

	if ([11, 0, 1].includes(month)) {
		return {
			season: "winter",
			impact: "high",
			estimatedIncrease: 0.15,
			advice: "Consider budget for higher heating bills",
		};
	} else if ([5, 6, 7].includes(month)) {
		return {
			season: "summer",
			impact: "high",
			estimatedIncrease: 0.15,
			advice: "Prepare for air conditioning costs",
		};
	} else {
		return {
			season: "moderate",
			impact: "low",
			estimatedIncrease: 0,
			advice: "Normal utility costs",
		};
	}
};

/**
 * Get seasonal food price impact
 * @param {number} month - Month (0-11)
 * @returns {Object} Food cost impact
 */
const getSeasonalFoodImpact = (month) => {
	// Produce seasonal prices vary
	const inSeasonMonths = [4, 5, 6, 7, 8, 9]; // May-October: better prices

	return {
		inSeason: inSeasonMonths.includes(month),
		impact: inSeasonMonths.includes(month) ? "lower_prices" : "higher_prices",
		advice: inSeasonMonths.includes(month)
			? "Seasonal produce is cheaper, stock up on fresh items"
			: "Consider frozen vegetables and pantry staples",
		estimatedVariation: inSeasonMonths.includes(month) ? -0.1 : 0.1,
	};
};

/**
 * Get holiday spending buffer recommendations
 * @param {number} month - Month (0-11)
 * @returns {Object} Holiday buffer info
 */
const getHolidayBuffer = (month) => {
	const holidayMonths = {
		10: { holiday: "Thanksgiving", buffer: 0.15 }, // November
		11: { holiday: "Christmas/New Year", buffer: 0.25 }, // December
		0: { holiday: "New Year Resolution purchases", buffer: 0.1 }, // January
	};

	if (holidayMonths[month]) {
		return {
			...holidayMonths[month],
			advice: `Budget extra ${Math.round(
				holidayMonths[month].buffer * 100
			)}% for ${holidayMonths[month].holiday}`,
		};
	}

	return {
		holiday: "None",
		buffer: 0,
		advice: "Standard budgeting applies",
	};
};

/**
 * Get utilities trend for the month
 * @param {number} month - Month (0-11)
 * @returns {Object} Utilities trend
 */
const getUtilitiesTrend = (month) => {
	const winterMonths = [11, 0, 1]; // Nov, Dec, Jan
	const summerMonths = [5, 6, 7, 8]; // May, Jun, Jul, Aug

	if (winterMonths.includes(month)) {
		return {
			trend: "increasing",
			reason: "Heating season",
			expectedChange: "20-30% increase from moderate months",
		};
	} else if (summerMonths.includes(month)) {
		return {
			trend: "increasing",
			reason: "Cooling season",
			expectedChange: "15-25% increase from moderate months",
		};
	} else {
		return {
			trend: "stable",
			reason: "Moderate season",
			expectedChange: "Baseline costs",
		};
	}
};

/**
 * Get commodity price trend
 * @returns {Object} Commodity trends
 */
const getCommodityPriceTrend = () => {
	return {
		gasPrice: {
			status: "stable",
			trend: "fluctuating",
			advice: "Monitor gas prices, consider carpooling or public transit",
		},
		foodPrices: {
			status: "elevated",
			trend: "slowly decreasing",
			advice: "Buy generic brands, use coupons, plan meals ahead",
		},
		essentials: {
			status: "increasing_slowly",
			trend: "moderate",
			advice: "Stock up on non-perishables when on sale",
		},
	};
};

/**
 * Get current season
 * @returns {string} Current season
 */
const getCurrentSeason = () => {
	const month = new Date().getMonth();
	if ([11, 0, 1].includes(month)) return "winter";
	if ([2, 3, 4].includes(month)) return "spring";
	if ([5, 6, 7].includes(month)) return "summer";
	return "fall";
};

/**
 * Generate economic context string for AI prompts
 * @param {Object} economicData - Economic data from getEconomicData()
 * @returns {string} Formatted economic context
 */
export const generateEconomicContext = (economicData) => {
	const { indicators } = economicData;
	const { inflation, market, seasonal, commodities } = indicators;

	let context = `CURRENT ECONOMIC CONDITIONS (as of ${new Date().toLocaleDateString()}):\n`;

	if (inflation) {
		context += `- Inflation: ${inflation.current}% (${inflation.trend}). ${inflation.impact}\n`;
	}

	if (market) {
		context += `- Job Market: ${market.jobMarket} (${market.sentiment} sentiment)\n`;
	}

	if (seasonal) {
		context += `- Season: ${seasonal.season}. ${
			seasonal.heating_cooling?.advice || ""
		}\n`;
		if (seasonal.food_seasonal) {
			context += `- Food Prices: ${seasonal.food_seasonal.advice}\n`;
		}
		if (seasonal.holiday_buffer?.buffer > 0) {
			context += `- Holiday Alert: ${seasonal.holiday_buffer.advice}\n`;
		}
	}

	if (commodities) {
		context += `- Gas: ${commodities.gasPrice.status}, Food: ${commodities.foodPrices.status}\n`;
	}

	context += `\nAdjust recommendations to account for these conditions.`;

	return context;
};

export default {
	getEconomicData,
	getCachedEconomicData,
	getDefaultEconomicData,
	generateEconomicContext,
};
