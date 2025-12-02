# Daily Schedule Architecture & Data Flow

## Component Structure

```
AIBudgetAdvisor.jsx
├── Header (Logo, Email, Buttons)
├── View Toggle Section
│   └── Monthly Overview | Daily Schedule (buttons)
├── Main Content
│   ├── No Data Section (conditional)
│   ├── Monthly View (conditional)
│   │   ├── AI Insights Section
│   │   │   └── Overview Grid (Income, Spending, Remaining)
│   │   ├── Breakdown Comparison Section
│   │   │   ├── Recommended vs Actual
│   │   │   └── Budget Stats
│   │   ├── Recommendations Section
│   │   └── Action Buttons
│   └── Daily View (conditional)
│       ├── Date Navigation
│       ├── Daily Overview Card
│       ├── Time Slots Container
│       │   └── [Time Slot Cards] ×7
│       ├── Budget Allocation Section
│       └── Economic Insights
└── Footer

```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│            User Financial Profile (localStorage)       │
│  - Monthly Income                                      │
│  - Housing, Utilities, Groceries, Transport, etc.    │
│  - Dining, Entertainment, Subscriptions, etc.        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│           AIBudgetAdvisor Component (React)            │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Step 1: Load Profile on Mount                  │   │
│  │ - Parse localStorage                           │   │
│  │ - Set userProfile state                        │   │
│  └──────────────────┬──────────────────────────────┘   │
│                     │                                   │
│                     ▼                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Step 2: Generate Monthly Budget                │   │
│  │ - calculateMonthlyIncome()                      │   │
│  │ - Apply 50/30/20 rule                          │   │
│  │ - Set budgetBreakdown state                    │   │
│  └──────────────────┬──────────────────────────────┘   │
│                     │                                   │
│                     ▼                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Step 3: Render Monthly View (default)          │   │
│  │ - Show income, expenses, remaining             │   │
│  │ - Display budget breakdown                     │   │
│  │ - Show AI recommendations                      │   │
│  └──────────────────┬──────────────────────────────┘   │
│                     │                                   │
│         [User Clicks Daily Schedule Button]            │
│                     │                                   │
│                     ▼                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Step 4: Switch to Daily View                   │   │
│  │ - Set view = "daily"                           │   │
│  │ - Trigger loadDailySpending()                  │   │
│  └──────────────────┬──────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│        aiSpendingService.generateDailySpendingBreakdown│
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Build Prompt for AI                            │  │
│  │ - User financial profile                       │  │
│  │ - Daily budget amount                          │  │
│  │ - Selected date                                │  │
│  │ - Request JSON response structure              │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                    │
│                   ▼                                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Check if OpenAI API Key Available              │  │
│  └────┬──────────────────────────────────────┬────┘   │
│       │ YES (API Key Set)                    │ NO     │
│       │                                       │        │
│       ▼                                       ▼        │
│  ┌────────────────────┐             ┌──────────────┐  │
│  │ Call OpenAI API    │             │ Use Local    │  │
│  │ gpt-3.5-turbo      │             │ Generation   │  │
│  │ with prompt        │             └──────────────┘  │
│  └────────┬───────────┘                               │
│           │                                           │
│           ▼                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Parse Response                                │  │
│  │ - Extract JSON from response                  │  │
│  │ - Return spending breakdown                  │  │
│  └────────────────┬─────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Daily Spending Data Structure              │
│  {                                                      │
│    dayOverview: "string",                              │
│    timeSlots: [                                        │
│      {                                                  │
│        timeRange: "6:00 AM - 9:00 AM",               │
│        period: "Morning",                             │
│        suggestedAmount: 8.50,                         │
│        activity: "Breakfast and morning commute",    │
│        tips: ["Have breakfast at home", ...]         │
│      },                                                │
│      ... (6 more time slots)                          │
│    ],                                                  │
│    totalProjected: 65.00,                            │
│    savings: 8.33,                                     │
│    essentialBreakdown: {percentage: 50, amount: 32.5},│
│    discretionaryBreakdown: {percentage: 30, amount: 19.5},│
│    savingsBreakdown: {percentage: 20, amount: 13.0} │
│  }                                                      │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│           Daily View Rendering (React)                 │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 1. Date Navigation Bar                         │  │
│  │    [← Previous] [Date] [Today] [Next →]        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 2. Daily Overview Card                         │  │
│  │    - Show dayOverview text                      │  │
│  │    - Display daily budget and savings          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 3. Time Slots (Map through array)              │  │
│  │    - Render 7 time slot cards                   │  │
│  │    - Each with: time, amount, activity, tips   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 4. Budget Allocation Section                   │  │
│  │    - 3 breakdown items (Essentials, etc.)      │  │
│  │    - Visual bars with percentages              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 5. Economic Insights Section                   │  │
│  │    - 2 insight cards with tips                 │  │
│  │    - Recommendations and daily challenge       │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
                       │
                       ▼
                  User Interface
              (See daily spending plan)
```

## State Management Diagram

```
AIBudgetAdvisor Component State
├── user (Auth)
├── navigate (Router)
├── logout (Auth)
│
├── Loading States
│   ├── loading (boolean)
│   └── loadingDaily (boolean)
│
├── Profile Data
│   ├── userProfile (object from localStorage)
│   ├── budgetBreakdown (calculated 50/30/20)
│   └── budgetHistory (from localStorage)
│
├── View Control
│   ├── view ("monthly" | "daily")
│   ├── selectedDate (Date object)
│   └── dailySpending (object from API/local)
│
└── Event Handlers
    ├── handleLogout()
    ├── handlePreviousDay()
    ├── handleNextDay()
    ├── handleTodayClick()
    ├── formatDate()
    └── loadDailySpending()
```

## Component Interaction Diagram

```
AIBudgetAdvisor
├─ useAuth() ─────────────────► AuthContext
├─ useNavigate() ──────────────► React Router
├─ useState (view) ─────────────► Toggle Month/Daily
├─ useState (selectedDate) ─────► Date Navigation
├─ useState (dailySpending) ────► API Response
│
├─ useEffect (mount) ───────────► Load from localStorage
├─ useEffect (view/date) ───────► loadDailySpending()
│                                     │
│                                     ▼
│                            generateDailySpendingBreakdown()
│                                     │
│                                     ├─► Check API Key
│                                     │    │
│                                     │    ├─ OpenAI API Call
│                                     │    │
│                                     │    ▼
│                                     │  Parse Response
│                                     │
│                                     └─► Local Generation
│                                            (fallback)
│
└─ Render JSX
   ├─ Monthly View Components
   │  ├─ AI Insights Section
   │  ├─ Breakdown Comparison
   │  ├─ Recommendations
   │  └─ Action Buttons
   │
   └─ Daily View Components
      ├─ Date Navigation
      ├─ Daily Overview Card
      ├─ Time Slot Cards
      ├─ Budget Allocation
      └─ Economic Insights
```

## CSS Architecture

```
Stylesheet Organization
├─ Global Styles (inherited from main.css)
├─ Header Styles
│  ├─ .advisor-header
│  ├─ .logo-btn
│  └─ .header-buttons
│
├─ View Toggle Styles
│  ├─ .view-toggle-section
│  ├─ .view-toggle
│  └─ .toggle-btn
│
├─ Monthly View Styles
│  ├─ .ai-insights-section
│  ├─ .overview-grid
│  ├─ .breakdown-comparison-section
│  └─ .recommendations-section
│
├─ Daily View Styles
│  ├─ .daily-spending-section
│  ├─ .date-navigation
│  ├─ .daily-overview-card
│  ├─ .time-slots-container
│  ├─ .time-slot-card
│  ├─ .breakdown-section
│  └─ .economic-context
│
├─ Responsive Design
│  ├─ @media (1024px)
│  └─ @media (768px)
│
└─ Utility Classes
   ├─ .loading-container
   └─ .no-data-section
```

## API Integration Flow

```
generateDailySpendingBreakdown() Flow
│
├─ Input Parameters:
│  ├─ userProfile {object}
│  ├─ date {Date}
│  └─ dailyBudget {number}
│
├─ Step 1: Build Prompt
│  └─ Format: "Based on [profile], generate spending for [date]"
│
├─ Step 2: Check API Key
│  ├─ If VITE_OPENAI_API_KEY exists
│  │  ├─ Call OpenAI API
│  │  ├─ POST to https://api.openai.com/v1/chat/completions
│  │  ├─ Model: gpt-3.5-turbo
│  │  ├─ Temperature: 0.7
│  │  └─ Max tokens: 1000
│  │
│  └─ If no API Key
│     └─ Use generateLocalSpendingBreakdown()
│
├─ Step 3: Parse Response
│  ├─ Check response.ok
│  ├─ Extract message.content
│  ├─ Parse JSON from response
│  └─ Add metadata (date, source)
│
├─ Step 4: Error Handling
│  ├─ Network errors ─► Fallback to local
│  ├─ Parse errors ───► Fallback to local
│  ├─ API errors ─────► Fallback to local
│  └─ Log errors to console
│
└─ Output:
   └─ Daily spending breakdown object
```

## User Interaction Flowchart

```
Start: AI Budget Advisor Page
    │
    ├─► No Financial Profile?
    │   ├─ Show "No Data" message
    │   ├─ Show link to Financial Profile
    │   └─ End
    │
    └─► Has Financial Profile?
        │
        ├─ Default: Monthly Overview
        │  ├─ User reviews monthly plan
        │  └─ [Optional] Click Edit Profile
        │
        └─ Click "Daily Schedule"
           ├─ Load today's recommendations
           ├─ Display daily overview
           ├─ Show hourly time slots
           ├─ Display budget allocation
           └─ Show economic insights
              │
              ├─► User clicks "Previous"
              │   └─ Load previous day
              │
              ├─► User clicks "Next"
              │   └─ Load next day
              │
              ├─► User clicks "Today"
              │   └─ Load today again
              │
              └─► User clicks Toggle to Monthly
                  └─ Switch back to monthly view
```

## Performance Considerations

```
Optimization Strategy:
│
├─ State Management
│  ├─ Separate loading states
│  ├─ Conditional rendering
│  └─ useCallback for handlers (optional)
│
├─ API Calls
│  ├─ Single call per date change
│  ├─ Cache in dailySpending state
│  └─ No repeated calls for same date
│
├─ DOM Rendering
│  ├─ Time slot mapping (not creation)
│  ├─ Conditional sections
│  └─ CSS-based animations (not JS)
│
├─ Assets
│  ├─ Unicode emojis only (no images)
│  ├─ CSS over JavaScript animations
│  └─ Minimal dependencies
│
└─ Storage
   └─ localStorage caching of profiles
```

---

This architecture ensures:
✅ Clean separation of concerns
✅ Efficient data flow
✅ Responsive UI updates
✅ Fallback mechanisms
✅ Good performance
✅ Maintainable code structure
