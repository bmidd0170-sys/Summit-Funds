# Daily Spending Schedule Implementation

## Overview

The AI Budget Advisor now features an interactive **Daily Schedule** view that shows users their recommended daily spending broken down by hourly time slots, based on their financial profile and current economic context.

## Features Implemented

### 1. **Dual View System**

- **Monthly Overview**: Shows monthly income, expenses, and 50/30/20 budget breakdown
- **Daily Schedule**: Shows hour-by-hour spending recommendations with personalized tips

### 2. **Daily Schedule Features**

#### Date Navigation

- Navigate to previous/next days
- "Today" button for quick navigation to current date
- Date displayed in full format (e.g., "Monday, November 24, 2025")

#### Daily Overview Card

- Shows the day's overall spending plan summary
- Displays daily budget and potential savings
- Provides motivational overview text

#### Hourly Spending Schedule (⏰)

- **7 time slots** throughout the day:
  - 6:00 AM - 9:00 AM (Morning)
  - 9:00 AM - 12:00 PM (Mid-Morning)
  - 12:00 PM - 1:00 PM (Lunch)
  - 1:00 PM - 5:00 PM (Afternoon)
  - 5:00 PM - 7:00 PM (Evening Commute)
  - 7:00 PM - 10:00 PM (Evening)
  - 10:00 PM - 6:00 AM (Night)

Each time slot card includes:

- **Time Range**: Specific hours for the period
- **Period Tag**: Named period (e.g., "Morning", "Lunch")
- **Suggested Amount**: Dollar amount to spend in that time slot
- **Activity**: What the user should do during that time
- **Smart Tips**: 2-3 actionable tips to help stay within budget

#### Budget Allocation (📊)

Shows the 50/30/20 breakdown:

- **🏠 Essentials** (50%): Housing, utilities, transportation
- **🎉 Discretionary** (30%): Dining, entertainment, shopping
- **💰 Savings Goal** (20%): Amount to save daily

Each category includes:

- Visual progress bar
- Percentage of daily budget
- Dollar amount allocated

#### Economic Insights (🌍)

Two insight cards:

1. **💡 Current Recommendations**

   - Focus on essentials during high-cost hours
   - Limit impulse purchases in afternoon
   - Allocate discretionary budget wisely for evening
   - Prioritize savings for financial resilience

2. **📈 Daily Challenge**
   - Encourages users to stick to the plan
   - Highlights importance of transaction tracking
   - Promotes better financial decision-making

### 3. **AI-Powered Recommendations**

Uses OpenAI ChatGPT API (via `aiSpendingService.js`) to:

- Generate personalized daily spending schedules
- Consider user's financial profile
- Take into account current economic conditions
- Provide fallback local recommendations if API is unavailable

### 4. **User Interface Enhancements**

#### View Toggle Section

- Easy switching between Monthly and Daily views
- Active state indicator
- Smooth transitions

#### Responsive Design

- Mobile-friendly layouts
- Adjusts for smaller screens
- Single-column layout on mobile devices

#### Visual Hierarchy

- Color-coded categories (blue for essentials, orange for discretionary, green for savings)
- Gradient backgrounds for important sections
- Clear iconography throughout

### 5. **State Management**

New state variables added to AIBudgetAdvisor component:

- `selectedDate`: Tracks selected day for viewing
- `dailySpending`: Stores AI-generated daily spending data
- `loadingDaily`: Indicates when daily data is loading
- `view`: Toggles between "monthly" and "daily" views

## Data Flow

```
User Financial Profile (localStorage)
    ↓
generateAIBudget() → Monthly breakdown (50/30/20)
    ↓
User switches to Daily View
    ↓
generateDailySpendingBreakdown(profile, date, dailyBudget)
    ↓
OpenAI API (with fallback to local generation)
    ↓
AI-powered daily spending schedule with time slots
    ↓
Display to user with economic insights
```

## Technical Implementation

### Files Modified

1. **`src/pages/AIBudgetAdvisor.jsx`**

   - Added daily view state management
   - Implemented date navigation functions
   - Added daily spending UI components
   - Integrated with aiSpendingService

2. **`src/styles/AIBudgetAdvisor.css`**

   - Added 250+ lines of new styles
   - View toggle section styling
   - Date navigation styling
   - Time slot cards styling
   - Budget breakdown grid styling
   - Economic insights styling
   - Responsive design breakpoints

3. **`src/services/aiSpendingService.js`** (Already implemented)
   - `generateDailySpendingBreakdown()`: Generates AI daily spending
   - `generateLocalSpendingBreakdown()`: Fallback local generation
   - Support for date ranges

### Dependencies Used

- React hooks (useState, useEffect)
- OpenAI Chat API (via existing chatgpt.js config)
- localStorage for data persistence

## Features Highlights

✅ **Daily Spending Breakdown** - Hour-by-hour spending recommendations
✅ **Economic Context** - Tailored tips based on current financial situation
✅ **Smart Navigation** - Easy date selection with prev/next/today buttons
✅ **AI Integration** - ChatGPT-powered recommendations
✅ **Fallback Support** - Local generation when API unavailable
✅ **Responsive Design** - Mobile and desktop support
✅ **Interactive UI** - Hover effects, smooth transitions
✅ **Color-Coded Categories** - Visual budget allocation
✅ **Actionable Tips** - Practical advice for each time period

## Usage Instructions

1. **Completing Financial Profile**

   - Navigate to Financial Profile
   - Enter monthly income and expenses
   - Save profile

2. **Accessing Daily Schedule**

   - Go to AI Budget Advisor
   - Click "📅 Daily Schedule" button
   - View current day's spending plan

3. **Navigating Dates**

   - Use "← Previous" and "Next →" buttons to change dates
   - Click "Today" to return to current date
   - Schedule auto-loads for selected date

4. **Understanding Recommendations**
   - Read the daily overview for context
   - Follow hourly spending suggestions
   - Use tips to stay within budget
   - Monitor potential savings

## Future Enhancements

- Export daily schedule to PDF
- Compare actual vs. planned spending
- Historical tracking and analytics
- Weekly/monthly aggregate views
- Real-time spending notifications
- Integration with banking APIs
- Customizable time slots
- Multiple spending scenarios

## Environment Variables Required

```bash
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

If not set, the app will use local generation as fallback.
