import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import BudgetChatbot from "./BudgetChatbot";
import "../styles/FloatingChatbot.css";

export default function FloatingChatbot() {
	const { user } = useAuth();
	const [userProfile, setUserProfile] = useState(null);
	const [budgetPlan, setBudgetPlan] = useState(null);
	const [show, setShow] = useState(false);

	useEffect(() => {
		// Load user profile from localStorage
		const savedProfile = localStorage.getItem("userProfile");
		if (savedProfile) {
			setUserProfile(JSON.parse(savedProfile));
		}

		// Load active budget plan
		const activeKey = localStorage.getItem("activeBudgetKey");
		if (activeKey) {
			const metadata = localStorage.getItem("budgetMetadata");
			if (metadata) {
				const parsed = JSON.parse(metadata);
				if (parsed[activeKey]) {
					setBudgetPlan(parsed[activeKey]);
				}
			}
		}

		// Listen for budget plan changes
		const handleStorageChange = (e) => {
			if (e.key === "budgetMetadata" || e.key === "activeBudgetKey") {
				const key = localStorage.getItem("activeBudgetKey");
				if (key) {
					const meta = localStorage.getItem("budgetMetadata");
					if (meta) {
						const parsed = JSON.parse(meta);
						if (parsed[key]) {
							setBudgetPlan(parsed[key]);
						}
					}
				}
			}
		};

		window.addEventListener("storage", handleStorageChange);
		return () => window.removeEventListener("storage", handleStorageChange);
	}, []);

	// Only show chatbot if user is logged in
	if (!user || !userProfile) {
		return null;
	}

	return (
		<div className="floating-chatbot-wrapper">
			<BudgetChatbot
				userProfile={userProfile}
				budgetPlan={budgetPlan}
				dailyBudget={userProfile.monthlyIncome ? userProfile.monthlyIncome / 30 : 0}
				selectedDate={new Date()}
			/>
		</div>
	);
}

