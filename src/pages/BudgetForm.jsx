import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/BudgetForm.css'

export default function BudgetForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    // Income
    monthlyIncome: '',
    
    // Essential Expenses
    housing: '',
    utilities: '',
    groceries: '',
    transportation: '',
    insurance: '',
    phone: '',
    internet: '',
    
    // Debt
    creditCardPayment: '',
    studentLoan: '',
    personalLoan: '',
    
    // Discretionary
    dining: '',
    entertainment: '',
    subscriptions: '',
    shopping: '',
    gym: '',
    
    // Savings
    emergencyFund: '',
    goalAmount: '',
    goalName: '',
    goalTimeline: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : parseFloat(value) || ''
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!formData.monthlyIncome) {
      setError('Monthly income is required.')
      setLoading(false)
      return
    }

    if (!formData.housing) {
      setError('Housing expense is required.')
      setLoading(false)
      return
    }

    if (!formData.goalName || !formData.goalAmount) {
      setError('Goal name and amount are required.')
      setLoading(false)
      return
    }

    try {
      // TODO: Save budget data to Firestore
      console.log('Budget form submitted:', formData)
      
      // For now, store in localStorage as demo
      localStorage.setItem('userBudget', JSON.stringify(formData))
      
      // Navigate to dashboard
      navigate('/dashboard')
    } catch (err) {
      setError('Failed to create budget plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="budget-form-container">
      {/* Header */}
      <header className="budget-form-header">
        <div className="logo">💰 Summit Funds</div>
        <div className="user-info">
          <span>{user?.email}</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="budget-form-wrapper">
        <div className="form-card">
          <div className="form-title">
            <h1>Create Your Budget Plan</h1>
            <p>Enter your income and expenses to generate a personalized budget</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="budget-form">
            {/* Income Section */}
            <fieldset className="form-section">
              <legend>Monthly Income</legend>
              <div className="form-group-large">
                <label htmlFor="monthlyIncome">Take-Home Monthly Income *</label>
                <input
                  id="monthlyIncome"
                  type="number"
                  name="monthlyIncome"
                  placeholder="e.g., 3500"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  step="0.01"
                  disabled={loading}
                  required
                />
              </div>
            </fieldset>

            {/* Essential Expenses */}
            <fieldset className="form-section">
              <legend>Essential Monthly Expenses</legend>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="housing">Housing (Rent/Mortgage) *</label>
                  <input
                    id="housing"
                    type="number"
                    name="housing"
                    placeholder="0.00"
                    value={formData.housing}
                    onChange={handleChange}
                    step="0.01"
                    disabled={loading}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="utilities">Utilities</label>
                  <input
                    id="utilities"
                    type="number"
                    name="utilities"
                    placeholder="0.00"
                    value={formData.utilities}
                    onChange={handleChange}
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="groceries">Groceries</label>
                  <input
                    id="groceries"
                    type="number"
                    name="groceries"
                    placeholder="0.00"
                    value={formData.groceries}
                    onChange={handleChange}
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="transportation">Transportation</label>
                  <input
                    id="transportation"
                    type="number"
                    name="transportation"
                    placeholder="0.00"
                    value={formData.transportation}
                    onChange={handleChange}
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="insurance">Insurance</label>
                  <input
                    id="insurance"
                    type="number"
                    name="insurance"
                    placeholder="0.00"
                    value={formData.insurance}
                    onChange={handleChange}
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    type="number"
                    name="phone"
                    placeholder="0.00"
                    value={formData.phone}
                    onChange={handleChange}
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="internet">Internet</label>
                  <input
                    id="internet"
                    type="number"
                    name="internet"
                    placeholder="0.00"
                    value={formData.internet}
                    onChange={handleChange}
                    step="0.01"
                    disabled={loading}
                  />
                </div>
              </div>
            </fieldset>

            {/* Debt */}
            <fieldset className="form-section">
              <legend>Monthly Debt Payments</legend>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="creditCardPayment">Credit Card Payment</label>
                  <input
                    id="creditCardPayment"
                    type="number"
                    name="creditCardPayment"
                    placeholder="0.00"
                    value={formData.creditCardPayment}
                    onChange={handleChange}
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="studentLoan">Student Loan</label>
                  <input
                    id="studentLoan"
                    type="number"
                    name="studentLoan"
                    placeholder="0.00"
                    value={formData.studentLoan}
                    onChange={handleChange}
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="personalLoan">Personal Loan</label>
                  <input
                    id="personalLoan"
                    type="number"
                    name="personalLoan"
                    placeholder="0.00"
                    value={formData.personalLoan}
                    onChange={handleChange}
                    step="0.01"
                    disabled={loading}
                  />
                </div>
              </div>
            </fieldset>

            {/* Discretionary */}
            <fieldset className="form-section">
              <legend>Discretionary Spending</legend>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="dining">Dining Out</label>
                  <input
                    id="dining"
                    type="number"
                    name="dining"
                    placeholder="0.00"
                    value={formData.dining}
                    onChange={handleChange}
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="entertainment">Entertainment</label>
                  <input
                    id="entertainment"
                    type="number"
                    name="entertainment"
                    placeholder="0.00"
                    value={formData.entertainment}
                    onChange={handleChange}
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subscriptions">Subscriptions</label>
                  <input
                    id="subscriptions"
                    type="number"
                    name="subscriptions"
                    placeholder="0.00"
                    value={formData.subscriptions}
                    onChange={handleChange}
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="shopping">Shopping</label>
                  <input
                    id="shopping"
                    type="number"
                    name="shopping"
                    placeholder="0.00"
                    value={formData.shopping}
                    onChange={handleChange}
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="gym">Gym/Fitness</label>
                  <input
                    id="gym"
                    type="number"
                    name="gym"
                    placeholder="0.00"
                    value={formData.gym}
                    onChange={handleChange}
                    step="0.01"
                    disabled={loading}
                  />
                </div>
              </div>
            </fieldset>

            {/* Savings Goal */}
            <fieldset className="form-section">
              <legend>Savings Goal *</legend>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="goalName">What are you saving for? *</label>
                  <input
                    id="goalName"
                    type="text"
                    name="goalName"
                    placeholder="e.g., Emergency Fund, Vacation, Car"
                    value={formData.goalName}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="goalAmount">Target Amount *</label>
                  <input
                    id="goalAmount"
                    type="number"
                    name="goalAmount"
                    placeholder="e.g., 5000"
                    value={formData.goalAmount}
                    onChange={handleChange}
                    step="0.01"
                    disabled={loading}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="goalTimeline">Timeline (months)</label>
                  <input
                    id="goalTimeline"
                    type="number"
                    name="goalTimeline"
                    placeholder="e.g., 12"
                    value={formData.goalTimeline}
                    onChange={handleChange}
                    step="1"
                    min="1"
                    disabled={loading}
                  />
                </div>
              </div>
            </fieldset>

            {/* Submit Button */}
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating Budget...' : 'Create Budget Plan'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="budget-form-footer">
        <p>&copy; 2025 Summit Funds. All rights reserved.</p>
      </footer>
    </div>
  )
}
