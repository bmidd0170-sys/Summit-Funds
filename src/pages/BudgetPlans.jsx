import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export default function BudgetPlans() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [budgetHistory, setBudgetHistory] = useState({});
	const [budgetMetadata, setBudgetMetadata] = useState({});
	const [sortBy, setSortBy] = useState("date-desc");
	const [filterMonth, setFilterMonth] = useState("");
	const [loading, setLoading] = useState(true);
	const [deleteConfirm, setDeleteConfirm] = useState(null);

	useEffect(() => {
		// Load budget data from localStorage
		const savedHistory = localStorage.getItem("budgetHistory");
		const savedMetadata = localStorage.getItem("budgetMetadata");

		if (savedHistory) {
			setBudgetHistory(JSON.parse(savedHistory));
		}
		if (savedMetadata) {
			setBudgetMetadata(JSON.parse(savedMetadata));
		}

		setLoading(false);
	}, []);

	// Format date to readable format
	const formatDate = (dateString) => {
		const date = new Date(dateString + "T00:00:00");
		return date.toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Get month from date string (YYYY-MM)
	const getMonth = (dateString) => {
		return dateString.substring(0, 7);
	};

	// Get all budget entries as array
	const getBudgetEntries = () => {
		return Object.entries(budgetHistory).map(([date, amount]) => ({
			date,
			amount: parseFloat(amount),
			metadata: budgetMetadata[date] || {},
		}));
	};

	// Filter budgets
	const getFilteredBudgets = () => {
		let entries = getBudgetEntries();

		// Filter by month if selected
		if (filterMonth) {
			entries = entries.filter((e) => getMonth(e.date) === filterMonth);
		}

		// Sort
		entries.sort((a, b) => {
			switch (sortBy) {
				case "date-desc":
					return new Date(b.date) - new Date(a.date);
				case "date-asc":
					return new Date(a.date) - new Date(b.date);
				case "amount-high":
					return b.amount - a.amount;
				case "amount-low":
					return a.amount - b.amount;
				default:
					return new Date(b.date) - new Date(a.date);
			}
		});

		return entries;
	};

	// Delete budget
	const handleDeleteBudget = (date) => {
		const newHistory = { ...budgetHistory };
		delete newHistory[date];
		setBudgetHistory(newHistory);
		localStorage.setItem("budgetHistory", JSON.stringify(newHistory));

		const newMetadata = { ...budgetMetadata };
		if (newMetadata[date]) {
			delete newMetadata[date];
			setBudgetMetadata(newMetadata);
			localStorage.setItem("budgetMetadata", JSON.stringify(newMetadata));
		}

		setDeleteConfirm(null);
	};

	// Edit budget
	const handleEditBudget = (date) => {
		navigate("/dashboard", {
			state: { selectedDate: new Date(date + "T00:00:00") },
		});
	};

	// Get all unique months
	const getAvailableMonths = () => {
		const months = [
			...new Set(getBudgetEntries().map((e) => getMonth(e.date))),
		];
		return months.sort().reverse();
	};

	// Calculate statistics
	const calculateStats = () => {
		const entries = getBudgetEntries();
		if (entries.length === 0) return null;

		const amounts = entries.map((e) => e.amount);
		const total = amounts.reduce((a, b) => a + b, 0);
		const average = total / amounts.length;
		const highest = Math.max(...amounts);
		const lowest = Math.min(...amounts);

		return {
			total: parseFloat(total.toFixed(2)),
			average: parseFloat(average.toFixed(2)),
			highest: parseFloat(highest.toFixed(2)),
			lowest: parseFloat(lowest.toFixed(2)),
			count: entries.length,
		};
	};

	const filteredBudgets = getFilteredBudgets();
	const stats = calculateStats();
	const availableMonths = getAvailableMonths();

	if (loading) {
		return (
			<div className="budget-plans-container">
				<p>Loading budget plans...</p>
			</div>
		);
	}

	return (
		<div className="budget-plans-container">
			{/* Header */}
			<header className="budget-plans-header">
				<div className="header-content">
					<h1>📊 Budget Plans</h1>
					<p>View and manage all your budget plans</p>
				</div>
				<button className="btn-back" onClick={() => navigate("/profile")}>
					← Back to Profile
				</button>
			</header>

			{/* Statistics Section */}
			{stats && (
				<section className="stats-section">
					<div className="stats-grid">
						<div className="stat-card">
							<div className="stat-icon">📈</div>
							<div className="stat-info">
								<span className="stat-label">Total Budgets</span>
								<span className="stat-value">{stats.count}</span>
							</div>
						</div>
						<div className="stat-card">
							<div className="stat-icon">💰</div>
							<div className="stat-info">
								<span className="stat-label">Average Daily Budget</span>
								<span className="stat-value">${stats.average}</span>
							</div>
						</div>
						<div className="stat-card">
							<div className="stat-icon">📊</div>
							<div className="stat-info">
								<span className="stat-label">Total Budgeted</span>
								<span className="stat-value">${stats.total}</span>
							</div>
						</div>
						<div className="stat-card">
							<div className="stat-icon">🎯</div>
							<div className="stat-info">
								<span className="stat-label">Budget Range</span>
								<span className="stat-value">
									${stats.lowest} - ${stats.highest}
								</span>
							</div>
						</div>
					</div>
				</section>
			)}

			{/* Filters Section */}
			<section className="filters-section">
				<div className="filter-group">
					<label htmlFor="monthFilter">Filter by Month:</label>
					<select
						id="monthFilter"
						value={filterMonth}
						onChange={(e) => setFilterMonth(e.target.value)}
						className="filter-select"
					>
						<option value="">All Months</option>
						{availableMonths.map((month) => (
							<option key={month} value={month}>
								{new Date(month + "-01T00:00:00").toLocaleDateString("en-US", {
									month: "long",
									year: "numeric",
								})}
							</option>
						))}
					</select>
				</div>

				<div className="filter-group">
					<label htmlFor="sortBy">Sort by:</label>
					<select
						id="sortBy"
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value)}
						className="filter-select"
					>
						<option value="date-desc">Newest First</option>
						<option value="date-asc">Oldest First</option>
						<option value="amount-high">Highest Budget</option>
						<option value="amount-low">Lowest Budget</option>
					</select>
				</div>
			</section>

			{/* Budget Plans List */}
			<section className="plans-section">
				{filteredBudgets.length === 0 ? (
					<div className="empty-state">
						<div className="empty-icon">📋</div>
						<h2>No Budget Plans Found</h2>
						<p>
							{Object.keys(budgetHistory).length === 0
								? "Start by creating your first budget plan!"
								: "No plans match your filters."}
						</p>
						<button
							className="btn-create-budget"
							onClick={() => navigate("/create-budget-plan")}
						>
							Create Budget Plan
						</button>
					</div>
				) : (
					<div className="plans-grid">
						{filteredBudgets.map((budget) => (
							<div key={budget.date} className="plan-card">
								<div className="card-header">
									<div className="date-info">
										<h3>{formatDate(budget.date)}</h3>
										<span className="day-type">
											{new Date(budget.date + "T00:00:00").toLocaleDateString(
												"en-US",
												{
													weekday: "short",
												}
											)}
										</span>
									</div>
									<div className="card-actions">
										<button
											className="btn-edit"
											onClick={() => handleEditBudget(budget.date)}
											title="Edit this budget"
										>
											✎
										</button>
										<button
											className="btn-delete"
											onClick={() => setDeleteConfirm(budget.date)}
											title="Delete this budget"
										>
											🗑️
										</button>
									</div>
								</div>

								<div className="card-content">
									<div className="budget-amount">
										<span className="label">Daily Budget</span>
										<span className="amount">${budget.amount}</span>
									</div>

									{budget.metadata && (
										<>
											{budget.metadata.name && (
												<div className="metadata-item">
													<span className="meta-label">Plan Name:</span>
													<span className="meta-value">
														{budget.metadata.name}
													</span>
												</div>
											)}
											{budget.metadata.reason && (
												<div className="metadata-item">
													<span className="meta-label">Reason:</span>
													<span className="meta-value">
														{budget.metadata.reason}
													</span>
												</div>
											)}
											{budget.metadata.createdAt && (
												<div className="metadata-item">
													<span className="meta-label">Created:</span>
													<span className="meta-value">
														{new Date(
															budget.metadata.createdAt
														).toLocaleDateString("en-US", {
															month: "short",
															day: "numeric",
															hour: "2-digit",
															minute: "2-digit",
														})}
													</span>
												</div>
											)}
										</>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</section>

			{/* Delete Confirmation Modal */}
			{deleteConfirm && (
				<div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h2>Delete Budget Plan</h2>
							<button
								className="modal-close"
								onClick={() => setDeleteConfirm(null)}
							>
								✕
							</button>
						</div>

						<div className="modal-body">
							<p>
								Are you sure you want to delete the budget plan for{" "}
								<strong>{formatDate(deleteConfirm)}</strong>?
							</p>
							<p className="warning">This action cannot be undone.</p>
						</div>

						<div className="modal-footer">
							<button
								className="modal-btn cancel-btn"
								onClick={() => setDeleteConfirm(null)}
							>
								Cancel
							</button>
							<button
								className="modal-btn delete-btn"
								onClick={() => handleDeleteBudget(deleteConfirm)}
							>
								Delete Budget
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Footer */}
			<footer className="budget-plans-footer">
				<p>&copy; 2025 Summit Funds. All rights reserved.</p>
			</footer>
		</div>
	);
}
