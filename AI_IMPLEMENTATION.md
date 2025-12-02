# AI Spending Breakdown Implementation Guide

## Overview

The Summit Funds application now includes AI-powered daily spending schedule generation using OpenAI's ChatGPT API. This feature helps users understand how to allocate their budget throughout the day with specific recommendations for different time periods.

## Features

### 1. **Daily Spending Breakdown**

- AI generates personalized hourly spending schedules for each selected date
- Based on user's financial profile and daily budget limit
- Follows the 50/30/20 budgeting rule (50% essentials, 30% discretionary, 20% savings)

### 2. **Time-Slot Analysis**

- Morning (6-9 AM): Breakfast and commute
- Mid-Morning (9 AM-12 PM): Work/activities
- Lunch (12-1 PM): Lunch break
- Afternoon (1-5 PM): Work/activities
- Evening Commute (5-7 PM): Commute home
- Evening (7-10 PM): Dining/entertainment
- Night (10 PM-6 AM): Sleep

### 3. **Smart Recommendations**

- Context-specific spending tips for each time slot
- Activity suggestions to optimize spending
- Daily overview and savings projections

### 4. **Fallback Support**

- If OpenAI API is unavailable, uses local rule-based generation
- Ensures app functionality even without API access

## Setup Instructions

### 1. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Create a new API key
4. Copy the key (starts with `sk-`)

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
REACT_APP_OPENAI_API_KEY=sk-your-api-key-here
```

**Important:** Never commit the `.env` file to version control. Add it to `.gitignore`:

```
.env
.env.local
```

### 3. Install Dependencies (if needed)

The project uses the native `fetch` API, so no additional dependencies are required.

## File Structure

```
src/
├── services/
│   └── aiSpendingService.js       # AI service with ChatGPT integration
├── components/
│   └── SpendingBreakdown.jsx      # Component to display spending breakdown
├── styles/
│   └── SpendingBreakdown.css      # Styling for breakdown component
└── pages/
    └── Dashboard.jsx              # Updated with AI integration
```

## API Functions

### `generateDailySpendingBreakdown(userProfile, date, dailyBudget)`

Generates AI-powered daily spending schedule for a specific date.

**Parameters:**

- `userProfile` (Object): User's financial data
- `date` (Date): Target date for spending breakdown
- `dailyBudget` (Number): Daily budget limit

**Returns:** Promise resolving to spending breakdown object

**Example:**

```javascript
const breakdown = await generateDailySpendingBreakdown(
	userProfile,
	new Date(),
	100 // $100 daily budget
);
```

### `generateLocalSpendingBreakdown(userProfile, dailyBudget)`

Fallback function using rule-based spending allocation.

**Parameters:**

- `userProfile` (Object): User's financial data
- `dailyBudget` (Number): Daily budget limit

**Returns:** Spending breakdown object

### `generateRangeSpendingBreakdown(userProfile, startDate, endDate, dailyBudget)`

Generates spending breakdowns for a date range (useful for the shaded calendar range).

**Parameters:**

- `userProfile` (Object): User's financial data
- `startDate` (Date): Range start
- `endDate` (Date): Range end
- `dailyBudget` (Number): Daily budget limit

**Returns:** Promise resolving to array of breakdown objects

## Response Format

```json
{
	"dayOverview": "Smart spending plan description",
	"timeSlots": [
		{
			"timeRange": "6:00 AM - 9:00 AM",
			"period": "Morning",
			"suggestedAmount": 8.5,
			"activity": "Breakfast and morning commute",
			"tips": ["Have breakfast at home", "Use public transit"]
		}
	],
	"totalProjected": 99.5,
	"savings": 0.5,
	"essentialBreakdown": {
		"percentage": 50,
		"amount": 50.0
	},
	"discretionaryBreakdown": {
		"percentage": 30,
		"amount": 30.0
	},
	"savingsBreakdown": {
		"percentage": 20,
		"amount": 20.0
	},
	"date": "2025-11-24",
	"source": "ai" // or "local"
}
```

## Usage in Components

### SpendingBreakdown Component

```jsx
import SpendingBreakdown from "../components/SpendingBreakdown";

// In your component
<SpendingBreakdown
	userProfile={userProfile}
	selectedDate={new Date()}
	dailyBudget={100}
/>;
```

## Features

- **Expandable UI**: Click to expand/collapse the breakdown
- **Loading States**: Shows loading animation while generating AI response
- **API Badge**: Displays "🤖 AI Powered" badge when using ChatGPT
- **Fallback Indicator**: Local generation marked with "source: local"
- **Responsive Design**: Works on mobile, tablet, and desktop

## Error Handling

The implementation includes robust error handling:

1. **Missing API Key**: Falls back to local generation
2. **API Errors**: Catches and logs errors, uses fallback
3. **Invalid Responses**: Attempts to parse, falls back on failure
4. **Network Issues**: Handled gracefully with fallback

## Performance Considerations

- **Caching**: Consider caching responses for the same date/budget
- **Batch Processing**: Use `generateRangeSpendingBreakdown` for multiple dates
- **Rate Limiting**: OpenAI API has rate limits; monitor usage

## Cost Considerations

- OpenAI API usage is billed per token
- Each request typically uses 500-1000 tokens
- Estimate: ~$0.001-0.002 per request with gpt-3.5-turbo
- Monitor usage on [OpenAI Dashboard](https://platform.openai.com/account/billing/overview)

## Future Enhancements

1. **Caching Layer**: Implement Redis or LocalStorage caching
2. **User Preferences**: Learn from past spending patterns
3. **Multiple Budgets**: Support different budgets per time slot
4. **Integration**: Connect with real spending data from bank APIs
5. **ML Improvements**: Use GPT-4 for more accurate recommendations

## Troubleshooting

### Issue: "OpenAI API key not configured"

**Solution:**

1. Create `.env` file with `REACT_APP_OPENAI_API_KEY`
2. Restart the development server
3. Verify the key is valid

### Issue: Slow response times

**Solution:**

1. Check OpenAI API status
2. Consider reducing request frequency
3. Implement caching

### Issue: Inconsistent responses

**Solution:**

1. Verify user profile data completeness
2. Check API rate limits
3. Consider temperature adjustments in API calls

## API Models

Current model: `gpt-3.5-turbo`

To upgrade to GPT-4:

```javascript
model: "gpt-4"; // in aiSpendingService.js line 45
```

## Security Notes

- Never expose API keys in frontend code
- Consider server-side proxy for production
- Monitor API usage for unauthorized access
- Rotate API keys regularly

## Integration Points

The AI spending breakdown integrates with:

- **Dashboard Calendar**: Displays for selected date
- **Budget Limits**: Uses user's daily budget
- **User Profile**: Reads financial data
- **AI Budget Advisor**: Can use same data for recommendations

## Example Workflow

1. User completes financial profile
2. User opens Dashboard calendar
3. User selects a date
4. User sets daily budget or accepts AI recommendation
5. SpendingBreakdown component requests AI schedule
6. ChatGPT generates personalized hourly schedule
7. User sees detailed breakdown with time slots and tips
8. User can expand/collapse for more details
9. User can adjust budget and see updated breakdown
10. Savings amount automatically recalculates

## References

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [ChatGPT API Guide](https://platform.openai.com/docs/guides/gpt)
- [API Pricing](https://openai.com/pricing)
