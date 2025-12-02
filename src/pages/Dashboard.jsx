import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import BudgetDisplay from "../components/BudgetDisplay";
import "../App.css";

export default function Dashboard() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, logout } = useAuth();
	const [activeBudgetKey, setActiveBudgetKey] = useState(null);
	const [activeBudgetData, setActiveBudgetData] = useState(null);
	const [showBudget, setShowBudget] = useState(false);

	useEffect(() => {
		// Find the active/most recent budget
		const metadata = localStorage.getItem("budgetMetadata");
		if (metadata) {
			const parsedMetadata = JSON.parse(metadata);
			const sortedKeys = Object.keys(parsedMetadata).sort().reverse();

			if (sortedKeys.length > 0) {
				const latestKey = sortedKeys[0];
				const latestMetadata = parsedMetadata[latestKey];

				if (latestMetadata.status === "active") {
					setActiveBudgetKey(latestKey);
					setActiveBudgetData({ metadata: latestMetadata });
					setShowBudget(true);
				}
			}
		}
	}, []);

	// Poll for budget breakdown completion
	useEffect(() => {
		if (!activeBudgetKey || !activeBudgetData?.metadata?.generating) {
			return;
		}

		const pollInterval = setInterval(() => {
			const breakdowns = localStorage.getItem("budgetBreakdowns");
			if (breakdowns) {
				const parsedBreakdowns = JSON.parse(breakdowns);
				if (parsedBreakdowns[activeBudgetKey]) {
					setActiveBudgetData((prev) => ({
						...prev,
						breakdown: parsedBreakdowns[activeBudgetKey],
					}));

					// Update metadata to mark as not generating
					const metadata = localStorage.getItem("budgetMetadata");
					if (metadata) {
						const parsedMetadata = JSON.parse(metadata);
						parsedMetadata[activeBudgetKey].generating = false;
						localStorage.setItem(
							"budgetMetadata",
							JSON.stringify(parsedMetadata)
						);
						setActiveBudgetData((prev) => ({
							...prev,
							metadata: parsedMetadata[activeBudgetKey],
						}));
					}

					clearInterval(pollInterval);
				}
			}
		}, 1000); // Poll every second

		// Stop polling after 2 minutes
		const timeout = setTimeout(() => clearInterval(pollInterval), 120000);

		return () => {
			clearInterval(pollInterval);
			clearTimeout(timeout);
		};
	}, [activeBudgetKey, activeBudgetData?.metadata?.generating]);

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/");
		} catch (err) {
			console.error("Logout failed:", err);
		}
	};

	// Calculate current progression in budget plan
	const calculateProgression = (metadata) => {
		if (!metadata) return 0;

		const startDate = new Date(metadata.startDate);
		const endDate = new Date(metadata.endDate);
		const now = new Date();

		const totalDays =
			Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
		const elapsedDays =
			Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)) + 1;

		const progression = Math.min(
			100,
			Math.max(0, (elapsedDays / totalDays) * 100)
		);
		return Math.round(progression);
	};

	return (
		<div className="dashboard-container">
			{/* Header */}
			<header className="dashboard-header">
				<div className="header-left">
					<button
						className="logo logo-btn"
						onClick={() => navigate("/dashboard")}
					>
						💰 Summit Funds
					</button>
					<div className="header-title">
						<h1>Dashboard</h1>
						<p>{user?.email}</p>
					</div>
				</div>
				<div className="header-buttons">
					<button className="btn-profile" onClick={() => navigate("/profile")}>
						👤 Profile
					</button>
					<button className="btn-logout" onClick={handleLogout}>
						Logout
					</button>
				</div>
			</header>

			{/* Main Content */}
			<main className="dashboard-main">
				<div className="dashboard-content">
					{activeBudgetData?.metadata ? (
						<div
							className="budget-status-container"
							onClick={() =>
								navigate("/budget-detail", {
									state: { budgetData: activeBudgetData },
								})
							}
						>
							<div className="budget-status-card">
								<h2>{activeBudgetData.metadata.name}</h2>
								<p className="budget-reason">
									{activeBudgetData.metadata.reason}
								</p>
								<p className="budget-dates">
									{new Date(
										activeBudgetData.metadata.startDate
									).toLocaleDateString()}{" "}
									—{" "}
									{new Date(
										activeBudgetData.metadata.endDate
									).toLocaleDateString()}
								</p>
								<div className="progression-section">
									<div className="progression-label">Current Progress</div>
									<div className="progression-bar">
										<div
											className="progression-fill"
											style={{
												width: `${calculateProgression(
													activeBudgetData.metadata
												)}%`,
											}}
										></div>
									</div>
									<div className="progression-text">
										{calculateProgression(activeBudgetData.metadata)}% Complete
									</div>
								</div>
								<p className="click-hint">Click for details →</p>
							</div>
						</div>
					) : (
						<div className="no-budget-container">
							<div className="no-budget-card">
								<div className="no-budget-icon">📋</div>
								<h2>No Active Budget Plan</h2>
								<p>
									You don't have an active budget plan yet. Create one to get
									started!
								</p>
								<button
									className="create-plan-btn"
									onClick={() => navigate("/budget-plans")}
								>
									Create Budget Plan
								</button>
							</div>
						</div>
					)}
				</div>
			</main>

			{/* Footer */}
			<footer className="dashboard-footer">
				<p>&copy; 2025 Summit Funds. All rights reserved.</p>
			</footer>
		</div>
	);
}
