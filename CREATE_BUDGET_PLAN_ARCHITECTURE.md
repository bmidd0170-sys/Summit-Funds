# Create Budget Plan - Visual Architecture

## 🗺️ Component Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Application                          │
└─────────────────────────────────────────────────────────────┘
                           │
                 ┌─────────┼─────────┐
                 │         │         │
          ┌──────▼──┐  ┌───▼─────┐  ┌──────▼───────┐
          │Dashboard │  │ Profile │  │BudgetPlans   │
          └──────┬──┘  └─────────┘  └──────┬───────┘
                 │                         │
        ┌────────▼──────────────────────────▼─────────┐
        │  Click "✨ Create New Plan"                  │
        └────────┬──────────────────────────────────┬─┘
                 │                                  │
                 └──────────────┬───────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │ CreateBudgetPlan Page  │
                    │ (/create-budget-plan)  │
                    └───────────┬────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼────┐  ┌───────▼────┐  ┌──────▼──────┐
        │  Step 1    │  │  Step 2    │  │  Step 3     │
        │ Name &     │  │ Date       │  │ Review &    │
        │ Reason     │  │ Selection  │  │ Confirm     │
        └──────┬─────┘  └───────┬────┘  └──────┬──────┘
               │                │              │
               └────────────────┴──────────────┘
                        │
        ┌───────────────▼────────────────┐
        │ Save to localStorage            │
        │ budgetMetadata[dateKey]         │
        └───────────────┬────────────────┘
                        │
        ┌───────────────▼────────────────┐
        │ Redirect to /budget-plans       │
        │ Display success message         │
        └────────────────────────────────┘
```

---

## 📊 Data Structure Diagram

```
localStorage
│
├── budgetHistory
│   ├── "2025-11-27": 5000
│   └── "2025-12-15": 4500
│
└── budgetMetadata
    ├── "2025-11-27": {
    │   ├── name: "Q1 2026 Emergency Fund"
    │   ├── reason: "Building emergency savings"
    │   ├── startDate: "2025-11-27"
    │   ├── endDate: "2026-01-30"
    │   ├── createdAt: "2025-11-27T20:14:23.456Z"
    │   └── status: "active"
    │
    └── "2025-12-15": {
        ├── name: "Holiday Spending Plan"
        ├── reason: "Track December expenses"
        ├── startDate: "2025-12-15"
        ├── endDate: "2025-12-31"
        ├── createdAt: "2025-12-01T10:00:00.000Z"
        └── status: "active"
```

---

## 🎬 User Interaction Flow

```
START
  │
  ├─► User on Dashboard
  │    └─► Click "✨ Create New Plan" card
  │        │
  │        ↓
  │    Navigate to /create-budget-plan
  │
  ├─► User on Budget Plans page
  │    └─► Click "✨ Create New Plan" button
  │        │
  │        ↓
  │    Navigate to /create-budget-plan
  │
  └─► User enters URL directly: /create-budget-plan
       │
       ↓
   ┌──────────────────────────────────┐
   │ STEP 1: NAME & REASON             │
   │─────────────────────────────────│
   │ Input: Budget Name (required)    │
   │ Input: Budget Reason (optional)  │
   │                                  │
   │ [< Back] [Next: Set Dates →]     │
   └──────────────────┬───────────────┘
        Validation
        (error handling)
        │
        ↓
   ┌──────────────────────────────────┐
   │ STEP 2: DATE SELECTION            │
   │─────────────────────────────────│
   │ Start Date: [TODAY] (read-only)  │
   │ End Date: [DATE PICKER]          │
   │ Duration: X days ≈ Y months      │
   │                                  │
   │ [← Back] [Review Plan →]         │
   └──────────────────┬───────────────┘
        Validation
        (date logic)
        │
        ↓
   ┌──────────────────────────────────┐
   │ STEP 3: REVIEW & CONFIRM          │
   │─────────────────────────────────│
   │ ✓ Budget Name: [entered name]    │
   │ ✓ Goal/Reason: [entered reason]  │
   │ ✓ Start Date: [formatted date]   │
   │ ✓ End Date: [formatted date]     │
   │ ✓ Duration: [days & months]      │
   │                                  │
   │ [← Back] [✨ Create Plan]        │
   └──────────────────┬───────────────┘
        Submit
        │
        ↓
   Save to localStorage
   budgetMetadata[dateKey] = {...}
        │
        ↓
   Success!
   Redirect to /budget-plans
        │
        ↓
END
```

---

## 🎨 Visual Hierarchy

```
Page Level
├── Header (glass effect)
│   ├── Logo + Title
│   └── Buttons (Create, Back, Logout)
│
├── Main Content
│   ├── Progress Indicator
│   │   ├── Step 1 ✓
│   │   ├── Step 2 (active - purple)
│   │   └── Step 3
│   │
│   └── Step Content (animated in)
│       ├── Section Title
│       │   ├── Emoji icon
│       │   ├── Main heading
│       │   └── Subtitle
│       │
│       ├── Form Section
│       │   ├── Form group 1
│       │   │   ├── Label
│       │   │   ├── Input/Textarea
│       │   │   └── Character counter
│       │   │
│       │   ├── Form group 2
│       │   │   └── ...
│       │   │
│       │   └── Action buttons
│       │       ├── Cancel (gray)
│       │       └── Next (purple)
│       │
│       └── Info box (tips)
│           ├── Heading
│           ├── Description
│           └── Bullet list
│
└── Footer
    └── Copyright
```

---

## 🎯 State Management Map

```
CreateBudgetPlan Component
│
├── Form State
│   ├── budgetName: string (required)
│   ├── budgetReason: string (optional)
│   ├── startDate: string (YYYY-MM-DD, today)
│   └── endDate: string (YYYY-MM-DD, selected)
│
├── UI State
│   ├── step: "name" | "dates" | "review"
│   ├── loading: boolean
│   └── error: string
│
├── Calculation State
│   ├── maxEndDate: string (12 months limit)
│   └── estimatedData: {durationDays, durationMonths}
│
└── Data State
    ├── userProfile: object
    └── (future) financialData: object
```

---

## 🔀 Conditional Rendering

```
render() {
  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Container>
      <Header />
      <ProgressIndicator currentStep={step} />

      {step === "name" && <NameStep />}
      {step === "dates" && <DatesStep />}
      {step === "review" && <ReviewStep />}

      <Footer />
    </Container>
  )
}
```

---

## 🔄 Validation Flow

```
User Input
    │
    ├─ Name Input
    │  ├─ Is not empty? ✓
    │  └─ Length ≤ 50? ✓
    │     └─ Proceed to dates
    │
    ├─ Dates Input
    │  ├─ End date selected? ✓
    │  ├─ End > Start? ✓
    │  ├─ Within 12 months? ✓
    │  └─ Duration < 12 months? ✓
    │     └─ Proceed to review
    │
    └─ Submit
       └─ All data valid? ✓
          └─ Save to localStorage
```

---

## 🎨 CSS Grid/Flex Structure

```
.create-budget-container
└── display: flex
    └── flex-direction: column
        │
        ├── .create-budget-header
        │   └── display: flex
        │       └── justify-content: space-between
        │
        ├── .create-budget-main
        │   └── display: flex
        │       └── .create-budget-content
        │           └── max-width: 600px
        │               │
        │               ├── .progress-indicator
        │               │   └── display: flex
        │               │       └── justify-content: space-between
        │               │
        │               └── .step-content
        │                   └── animation: slideIn
        │                       │
        │                       ├── .step-form
        │                       │   └── display: flex
        │                       │       └── flex-direction: column
        │                       │
        │                       └── .info-box
        │
        └── .create-budget-footer
            └── text-align: center
```

---

## 📱 Responsive Breakpoint Map

```
Desktop (> 768px)
├── Header: Full layout with gaps
├── Progress: Horizontal with lines
├── Form: Side-by-side date inputs
├── Buttons: Row layout with gap
└── Info box: Full width

Tablet (480-768px)
├── Header: Adjusted spacing
├── Progress: Horizontal, compact
├── Form: Stacked, full width
├── Buttons: Column or auto
└── Info box: Adjusted padding

Mobile (< 480px)
├── Header: Responsive flex
├── Progress: Simplified, stacked
├── Form: Full width, single column
├── Buttons: 100% width, stacked
└── Info box: Minimal padding
```

---

## 🔐 Security & Data Flow

```
┌─────────────────────────────────────┐
│ User Input (Form)                   │
└────────────────┬────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────┐
│ Input Validation                    │
│ - Type check                        │
│ - Length validation                 │
│ - Date range validation             │
└────────────────┬────────────────────┘
                 │ (if valid)
                 ↓
┌─────────────────────────────────────┐
│ Sanitization                        │
│ - Trim whitespace                   │
│ - Format dates                      │
│ - Prepare metadata                  │
└────────────────┬────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────┐
│ localStorage.setItem()              │
│ (Client-side storage)               │
└────────────────┬────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────┐
│ Navigation & Success State          │
│ - Show confirmation                 │
│ - Redirect to view page             │
│ - Ready for AI processing           │
└─────────────────────────────────────┘
```

---

## 🎪 Form Layout (Desktop)

```
┌────────────────────────────────────────────┐
│ Step Header                                 │
│ Main Title • Subtitle                       │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Form Group 1                                │
│ Label: Budget Plan Name *                  │
│ ┌──────────────────────────────────────┐  │
│ │ Input: "Q1 2026 Savings Plan"        │  │
│ └──────────────────────────────────────┘  │
│ Character counter: 20/50                  │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Form Group 2                                │
│ Label: Reason (Optional)                   │
│ ┌──────────────────────────────────────┐  │
│ │ Textarea: "Save for vacation..."     │  │
│ │                                      │  │
│ │                                      │  │
│ └──────────────────────────────────────┘  │
│ Character counter: 45/200                 │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Action Buttons                              │
│ [Cancel] .................. [Next →]       │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ 💡 Tips Box                                 │
│ • Use specific names                       │
│ • Include time period                      │
│ • Example: "Q1 2026 Vacation Fund"         │
└────────────────────────────────────────────┘
```

---

## 📊 Success Path vs. Error Path

```
User Submits Form
    │
    ├─── Validation Passes ─────────►  ✓ Save Data
    │                                     │
    │                                     ↓
    │                            ✓ Update State
    │                                     │
    │                                     ↓
    │                            ✓ Navigate Success
    │
    └─── Validation Fails ─────────►  ✗ Show Error Message
                                         │
                                         ↓
                                    ✗ Highlight Field
                                         │
                                         ↓
                                    ✗ Disable Submit
                                         │
                                         ↓
                                    User Corrects Input
```

---

## 🚀 Integration Point with AI

```
┌──────────────────────────┐
│ Budget Created            │
│ Stored in localStorage    │
└────────────┬─────────────┘
             │
             ↓
    ┌────────────────┐
    │ AI Service     │
    │ Reads from:    │
    │ - startDate    │
    │ - endDate      │
    │ - userProfile  │
    └────────┬───────┘
             │
             ├─► Calculate duration
             ├─► Analyze financial data
             ├─► Generate categories
             └─► Create recommendations
             │
             ↓
    ┌────────────────────┐
    │ Store Budget Plan  │
    │ Details in memory  │
    └────────┬───────────┘
             │
             ↓
    ┌────────────────────┐
    │ Display to User    │
    │ Breakdown view     │
    └────────────────────┘
```

---

## 📈 Feature Expansion Roadmap

```
Current: Create Plan ✓
    ↓
Phase 1: Edit Plan
    ├─ Modify name/dates
    └─ Revert to active

Phase 2: AI Processing
    ├─ Generate breakdown
    ├─ Category allocation
    └─ Amount recommendations

Phase 3: Tracking
    ├─ Progress visualization
    ├─ Spending comparison
    └─ Category analysis

Phase 4: Advanced
    ├─ Budget templates
    ├─ Multi-plan comparison
    ├─ Predictive insights
    └─ Goal recommendations
```

---

## 🔗 Component Dependencies

```
CreateBudgetPlan
├── External Dependencies
│   ├── react (useState, useEffect)
│   ├── react-router-dom (useNavigate)
│   ├── ../context/AuthContext (useAuth)
│   ├── ../services/rateLimiter (delayApiCall)
│   └── ../styles/CreateBudgetPlan.css
│
└── Internal Usage
    ├── App.jsx (route)
    ├── Dashboard.jsx (link)
    └── BudgetPlans.jsx (link)
```
