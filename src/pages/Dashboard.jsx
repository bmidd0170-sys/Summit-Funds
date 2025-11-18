import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch budget from Firestore
    // For now, load from localStorage
    const savedBudget = localStorage.getItem('userBudget')
    if (savedBudget) {
      setBudget(JSON.parse(savedBudget))
    }
    setLoading(false)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const handleCreateBudget = () => {
    navigate('/budget-form')
  }

  // Calculate budget tiers
  const calculateBudgetTiers = () => {
    if (!budget) return null

    const income = parseFloat(budget.monthlyIncome) || 0

    // Calculate essentials
    const essentials =
      (parseFloat(budget.housing) || 0) +
      (parseFloat(budget.utilities) || 0) +
      (parseFloat(budget.groceries) || 0) +
      (parseFloat(budget.transportation) || 0) +
      (parseFloat(budget.insurance) || 0) +
      (parseFloat(budget.phone) || 0) +
      (parseFloat(budget.internet) || 0) +
      (parseFloat(budget.creditCardPayment) || 0) +
      (parseFloat(budget.studentLoan) || 0) +
      (parseFloat(budget.personalLoan) || 0)

    // Calculate discretionary
    const discretionary =
      (parseFloat(budget.dining) || 0) +
      (parseFloat(budget.entertainment) || 0) +
      (parseFloat(budget.subscriptions) || 0) +
      (parseFloat(budget.shopping) || 0) +
      (parseFloat(budget.gym) || 0)

    // Calculate available for goals + emergency fund
    const available = income - essentials - discretionary
    const emergencyFund = parseFloat(budget.emergencyFund) || available * 0.2
    const goalSavings = available - emergencyFund

    return {
      income,
      essentials,
      discretionary,
      emergencyFund,
      goalSavings,
      total: essentials + discretionary + emergencyFund + goalSavings,
    }
  }

  const tiers = calculateBudgetTiers()

  if (loading) {
    return (
      <div className="dashboard-container">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">💰 Summit Funds</div>
          <div className="header-title">
            <h1>Dashboard</h1>
            <p>Welcome, {user?.email}</p>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {!budget ? (
          // No budget created yet
          <div className="no-budget-section">
            <div className="no-budget-card">
              <div className="no-budget-icon">📋</div>
              <h2>No Budget Plan Yet</h2>
              <p>Create your first budget plan to get started tracking your spending and reach your financial goals.</p>
              <button className="btn-create-budget" onClick={handleCreateBudget}>
                Create Your Budget Plan
              </button>
            </div>
          </div>
        ) : (
          // Budget exists - show dashboard
          <>
            {/* Goal Progress Card */}
            <section className="goal-section">
              <div className="goal-card">
                <h2>{budget.goalName}</h2>
                <div className="goal-info">
                  <div className="goal-stat">
                    <span className="label">Target Amount</span>
                    <span className="value">${parseFloat(budget.goalAmount).toFixed(2)}</span>
                  </div>
                  <div className="goal-stat">
                    <span className="label">Timeline</span>
                    <span className="value">{budget.goalTimeline || '?'} months</span>
                  </div>
                  <div className="goal-stat">
                    <span className="label">Monthly Savings Needed</span>
                    <span className="value">${(parseFloat(budget.goalAmount) / (parseFloat(budget.goalTimeline) || 12)).toFixed(2)}</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '0%' }}></div>
                </div>
                <p className="progress-text">$0 of ${parseFloat(budget.goalAmount).toFixed(2)}</p>
              </div>
            </section>

            {/* Budget Breakdown Cards */}
            <section className="budget-section">
              <h2>Your Monthly Budget Breakdown</h2>
              <div className="budget-cards">
                {/* Essentials Tier */}
                <div className="budget-tier essentials-tier">
                  <div className="tier-header">
                    <div className="tier-icon">🏠</div>
                    <div className="tier-title">
                      <h3>Essentials</h3>
                      <p>Non-negotiable expenses</p>
                    </div>
                  </div>
                  <div className="tier-amount">${tiers.essentials.toFixed(2)}</div>
                  <div className="tier-percentage">{((tiers.essentials / tiers.income) * 100).toFixed(0)}% of income</div>
                  <div className="tier-details">
                    <div className="detail-item">
                      <span>Housing</span>
                      <span>${(parseFloat(budget.housing) || 0).toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Utilities</span>
                      <span>${(parseFloat(budget.utilities) || 0).toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Groceries</span>
                      <span>${(parseFloat(budget.groceries) || 0).toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Transportation</span>
                      <span>${(parseFloat(budget.transportation) || 0).toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Insurance</span>
                      <span>${(parseFloat(budget.insurance) || 0).toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Debt Payments</span>
                      <span>${((parseFloat(budget.creditCardPayment) || 0) + (parseFloat(budget.studentLoan) || 0) + (parseFloat(budget.personalLoan) || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Discretionary Tier */}
                <div className="budget-tier discretionary-tier">
                  <div className="tier-header">
                    <div className="tier-icon">🎉</div>
                    <div className="tier-title">
                      <h3>Discretionary</h3>
                      <p>Fun & flexible spending</p>
                    </div>
                  </div>
                  <div className="tier-amount">${tiers.discretionary.toFixed(2)}</div>
                  <div className="tier-percentage">{((tiers.discretionary / tiers.income) * 100).toFixed(0)}% of income</div>
                  <div className="tier-details">
                    <div className="detail-item">
                      <span>Dining Out</span>
                      <span>${(parseFloat(budget.dining) || 0).toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Entertainment</span>
                      <span>${(parseFloat(budget.entertainment) || 0).toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Subscriptions</span>
                      <span>${(parseFloat(budget.subscriptions) || 0).toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Shopping</span>
                      <span>${(parseFloat(budget.shopping) || 0).toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Gym/Fitness</span>
                      <span>${(parseFloat(budget.gym) || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Emergency Fund Tier */}
                <div className="budget-tier savings-tier">
                  <div className="tier-header">
                    <div className="tier-icon">🛡️</div>
                    <div className="tier-title">
                      <h3>Emergency Fund</h3>
                      <p>Safety net for emergencies</p>
                    </div>
                  </div>
                  <div className="tier-amount">${tiers.emergencyFund.toFixed(2)}</div>
                  <div className="tier-percentage">{((tiers.emergencyFund / tiers.income) * 100).toFixed(0)}% of income</div>
                </div>

                {/* Goal Savings Tier */}
                <div className="budget-tier goal-tier">
                  <div className="tier-header">
                    <div className="tier-icon">🎯</div>
                    <div className="tier-title">
                      <h3>Goal Savings</h3>
                      <p>Towards your {budget.goalName}</p>
                    </div>
                  </div>
                  <div className="tier-amount">${tiers.goalSavings.toFixed(2)}</div>
                  <div className="tier-percentage">{((tiers.goalSavings / tiers.income) * 100).toFixed(0)}% of income</div>
                </div>
              </div>
            </section>

            {/* Summary Stats */}
            <section className="summary-section">
              <h2>Monthly Summary</h2>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Total Income</span>
                  <span className="summary-value">${tiers.income.toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Expenses</span>
                  <span className="summary-value">${(tiers.essentials + tiers.discretionary).toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Savings</span>
                  <span className="summary-value green">${(tiers.emergencyFund + tiers.goalSavings).toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Savings Rate</span>
                  <span className="summary-value green">{((((tiers.emergencyFund + tiers.goalSavings) / tiers.income) * 100) || 0).toFixed(0)}%</span>
                </div>
              </div>
            </section>

            {/* Edit Budget Button */}
            <div className="edit-budget-section">
              <button className="btn-edit-budget" onClick={handleCreateBudget}>
                Edit Budget Plan
              </button>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>&copy; 2025 Summit Funds. All rights reserved.</p>
      </footer>
    </div>
  )
}
