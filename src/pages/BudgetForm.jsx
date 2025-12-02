import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export default function BudgetForm() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [profile, setProfile] = useState(null);

	useEffect(() => {
		// Load profile data
		const savedProfile = localStorage.getItem("userProfile");
		if (!savedProfile) {
			// Redirect to profile if data not found
			navigate("/profile");
			return;
		}
		setProfile(JSON.parse(savedProfile));
	}, [navigate]);

	const [formData, setFormData] = useState({
		// Goal only - other data comes from profile
		goalAmount: "",
		goalName: "",
		goalTimeline: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value === "" ? "" : value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		// Validation
		if (!formData.goalName || !formData.goalAmount) {
			setError("Goal name and amount are required.");
			setLoading(false);
			return;
		}

		try {
			// Combine profile data with goal data
			const completeBudget = {
				...profile,
				goalAmount: formData.goalAmount,
				goalName: formData.goalName,
				goalTimeline: formData.goalTimeline || 12,
			};

			// TODO: Save budget data to Firestore
			console.log("Budget form submitted:", completeBudget);

			// For now, store in localStorage as demo
			localStorage.setItem("userBudget", JSON.stringify(completeBudget));

			// Navigate to dashboard
			navigate("/dashboard");
		} catch (err) {
			setError("Failed to create budget plan. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	if (!profile) {
		return (
			<div className="budget-form-container">
				<p>Loading...</p>
			</div>
		);
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
						<p>
							Enter your income and expenses to generate a personalized budget
						</p>
					</div>

					{error && <div className="error-message">{error}</div>}

					<form onSubmit={handleSubmit} className="budget-form">
						{/* Summary of Profile Data */}
						<div className="profile-summary">
							<h3>Your Financial Profile</h3>
							<div className="summary-grid">
								<div className="summary-item">
									<span className="label">Monthly Income</span>
									<span className="value">
										${parseFloat(profile.monthlyIncome).toFixed(2)}
									</span>
								</div>
								<div className="summary-item">
									<span className="label">Total Essential Expenses</span>
									<span className="value">
										$
										{(
											(parseFloat(profile.housing) || 0) +
											(parseFloat(profile.utilities) || 0) +
											(parseFloat(profile.groceries) || 0) +
											(parseFloat(profile.transportation) || 0) +
											(parseFloat(profile.insurance) || 0) +
											(parseFloat(profile.phone) || 0) +
											(parseFloat(profile.internet) || 0) +
											(parseFloat(profile.creditCardPayment) || 0) +
											(parseFloat(profile.studentLoan) || 0) +
											(parseFloat(profile.personalLoan) || 0)
										).toFixed(2)}
									</span>
								</div>
								<div className="summary-item">
									<span className="label">Total Discretionary</span>
									<span className="value">
										$
										{(
											(parseFloat(profile.dining) || 0) +
											(parseFloat(profile.entertainment) || 0) +
											(parseFloat(profile.subscriptions) || 0) +
											(parseFloat(profile.shopping) || 0) +
											(parseFloat(profile.gym) || 0)
										).toFixed(2)}
									</span>
								</div>
							</div>
							<button
								type="button"
								className="btn-edit-profile"
								onClick={() => navigate("/profile")}
							>
								Edit Profile
							</button>
						</div>

						{/* Savings Goal Section */}
						<fieldset className="form-section">
							<legend>Your Savings Goal *</legend>
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
							{loading ? "Creating Budget..." : "Create Budget Plan"}
						</button>
					</form>
				</div>
			</div>

			{/* Footer */}
			<footer className="budget-form-footer">
				<p>&copy; 2025 Summit Funds. All rights reserved.</p>
			</footer>
		</div>
	);
}
