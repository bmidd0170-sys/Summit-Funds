import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import FloatingChatbot from "./components/FloatingChatbot";
import "./App.css";
import Introduction from "./pages/Introduction";
import HowTo from "./pages/HowTo";
import Login from "./pages/Login";
import Quiz from "./pages/Quiz";
import Profile from "./pages/ProfileInfo";
import FinancialProfile from "./pages/FinancialProfile";
import Dashboard from "./pages/Dashboard";
import BudgetForm from "./pages/BudgetForm";
import Settings from "./pages/Settings";
import AIBudgetAdvisor from "./pages/AIBudgetAdvisor";
import BudgetPlans from "./pages/BudgetPlans";
import CreateBudgetPlan from "./pages/CreateBudgetPlan";
import BudgetDetail from "./pages/BudgetDetail";

function App() {
	return (
		<Router>
			<AuthProvider>
				<FloatingChatbot />
				<Routes>
					<Route path="/" element={<Introduction />} />
					<Route path="/how-to" element={<HowTo />} />
					<Route path="/login" element={<Login />} />
					<Route
						path="/quiz"
						element={
							<ProtectedRoute>
								<Quiz />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/profile"
						element={
							<ProtectedRoute>
								<Profile />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/financial-profile"
						element={
							<ProtectedRoute>
								<FinancialProfile />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/settings"
						element={
							<ProtectedRoute>
								<Settings />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/dashboard"
						element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/budget-form"
						element={
							<ProtectedRoute>
								<BudgetForm />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/ai-budget-advisor"
						element={
							<ProtectedRoute>
								<AIBudgetAdvisor />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/budget-plans"
						element={
							<ProtectedRoute>
								<BudgetPlans />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/create-budget-plan"
						element={
							<ProtectedRoute>
								<CreateBudgetPlan />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/budget-detail"
						element={
							<ProtectedRoute>
								<BudgetDetail />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</AuthProvider>
		</Router>
	);
}

export default App;
