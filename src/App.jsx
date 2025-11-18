import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import './App.css'
import Introduction from './pages/Introduction'
import HowTo from './pages/HowTo'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import BudgetForm from './pages/BudgetForm'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Introduction />} />
          <Route path="/how-to" element={<HowTo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/budget-form" element={<ProtectedRoute><BudgetForm /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
