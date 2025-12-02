import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export default function FinancialProfile() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, logout } = useAuth();
	const [formData, setFormData] = useState({
		monthlyIncome: "",
		housing: "",
		utilities: "",
		groceries: "",
		transportation: "",
		insurance: "",
		phone: "",
		internet: "",
		creditCardPayment: "",
		studentLoan: "",
		personalLoan: "",
		dining: "",
		entertainment: "",
		subscriptions: "",
		shopping: "",
		gym: "",
	});
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(true);
	const [fromQuiz, setFromQuiz] = useState(false);
	const [currencyDisplay, setCurrencyDisplay] = useState({
		monthlyIncome: "$",
		housing: "$",
		utilities: "$",
		groceries: "$",
		transportation: "$",
		insurance: "$",
		phone: "$",
		internet: "$",
		creditCardPayment: "$",
		studentLoan: "$",
		personalLoan: "$",
		dining: "$",
		entertainment: "$",
		subscriptions: "$",
		shopping: "$",
		gym: "$",
	});

	useEffect(() => {
		// Check if coming from quiz
		if (location.state?.fromQuiz) {
			setFromQuiz(true);
			// Load quiz responses
			const quizData = localStorage.getItem("quizResponses");
			if (quizData) {
				const { profileData } = JSON.parse(quizData);
				// Populate profile form with quiz data
				if (profileData) {
					setFormData((prev) => ({
						...prev,
						monthlyIncome: profileData.monthlyIncome || "",
						housing: profileData.housing || "",
						utilities: profileData.utilities || "",
						groceries: profileData.groceries || "",
						transportation: profileData.transportation || "",
						phone: profileData.phone || "",
						insurance: profileData.insurance || "",
						internet: profileData.internet || "",
						creditCardPayment: profileData.creditCardPayment || "",
						studentLoan: profileData.studentLoan || "",
						personalLoan: profileData.personalLoan || "",
						dining: profileData.dining || "",
						entertainment: profileData.entertainment || "",
						subscriptions: profileData.subscriptions || "",
						shopping: profileData.shopping || "",
						gym: profileData.gym || "",
					}));
				}
			}
		} else {
			// Load existing profile data if available
			const savedProfile = localStorage.getItem("userProfile");
			if (savedProfile) {
				setFormData(JSON.parse(savedProfile));
			}
		}

		// Load currency display settings if available
		const savedCurrencySettings = localStorage.getItem(
			"currencyDisplaySettings"
		);
		if (savedCurrencySettings) {
			setCurrencyDisplay(JSON.parse(savedCurrencySettings));
		}

		setLoading(false);
	}, [location.state?.fromQuiz]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		// Clear error for this field when user starts typing
		if (errors[name]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[name];
				return newErrors;
			});
		}
	};

	const toggleCurrencyDisplay = (fieldName) => {
		setCurrencyDisplay((prev) => {
			const newState = prev[fieldName] === "$" ? "None" : "$";
			// If switching to "None", clear the field
			if (newState === "None") {
				setFormData((prevData) => ({
					...prevData,
					[fieldName]: "",
				}));
			}
			return {
				...prev,
				[fieldName]: newState,
			};
		});
	};

	const validateForm = () => {
		const newErrors = {};

		// Allow monthly income to be marked as "None"
		if (!formData.monthlyIncome && currencyDisplay.monthlyIncome === "$") {
			newErrors.monthlyIncome =
				"Monthly income is required when not marked as None";
		} else if (
			formData.monthlyIncome &&
			parseFloat(formData.monthlyIncome) <= 0
		) {
			newErrors.monthlyIncome = "Monthly income must be positive";
		}

		// Allow housing to be marked as "None"
		if (!formData.housing && currencyDisplay.housing === "$") {
			newErrors.housing = "Housing cost is required when not marked as None";
		} else if (formData.housing && parseFloat(formData.housing) <= 0) {
			newErrors.housing = "Housing cost must be positive";
		}

		return newErrors;
	};

	const handleSaveProfile = (e) => {
		e.preventDefault();

		const newErrors = validateForm();
		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		// Auto-convert empty fields to "None"
		const updatedFormData = { ...formData };
		const updatedCurrencyDisplay = { ...currencyDisplay };

		Object.keys(updatedFormData).forEach((key) => {
			if (!updatedFormData[key] || updatedFormData[key] === "") {
				updatedFormData[key] = "";
				updatedCurrencyDisplay[key] = "None";
			}
		});

		// Save to localStorage
		localStorage.setItem("userProfile", JSON.stringify(updatedFormData));
		localStorage.setItem(
			"currencyDisplaySettings",
			JSON.stringify(updatedCurrencyDisplay)
		);

		// Redirect to profile (user profile page)
		navigate("/profile");
	};

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/");
		} catch (err) {
			console.error("Logout failed:", err);
		}
	};

	if (loading) {
		return (
			<div className="profile-container">
				<p>Loading...</p>
			</div>
		);
	}

	return (
		<div className="profile-container">
			{/* Header */}
			<header className="profile-header">
				<div className="header-left">
					<button
						className="logo logo-btn"
						onClick={() => navigate("/dashboard")}
					>
						💰 Summit Funds
					</button>
					<div className="header-title">
						<h1>Edit Financial Profile</h1>
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
			<main className="profile-main">
				<div className="profile-card">
					<div className="profile-intro">
						<h2>Tell Us About Your Finances</h2>
						<p>
							{fromQuiz
								? "Based on your quiz responses, we've estimated your financial data below. Please review and adjust as needed for accuracy."
								: "Enter your income and expenses so we can help you create a personalized budget plan tailored to your goals."}
						</p>
					</div>

					<form onSubmit={handleSaveProfile} className="profile-form">
						{/* Monthly Income Section */}
						<section className="form-section">
							<h3>Monthly Income</h3>
							<div className="form-group">
								<label htmlFor="monthlyIncome">
									Monthly Income <span className="required">*</span>
								</label>
								<div className="currency-wrapper">
									<button
										type="button"
										className="currency-prefix-btn"
										onClick={() => toggleCurrencyDisplay("monthlyIncome")}
										title="Click to toggle currency display"
									>
										{currencyDisplay.monthlyIncome}
									</button>
									<input
										type="number"
										id="monthlyIncome"
										name="monthlyIncome"
										value={formData.monthlyIncome}
										onChange={handleChange}
										placeholder="Enter your total monthly income"
										step="0.01"
										min="0"
										disabled={currencyDisplay.monthlyIncome === "None"}
										className={errors.monthlyIncome ? "input-error" : ""}
									/>
								</div>
								{errors.monthlyIncome && (
									<span className="error-text">{errors.monthlyIncome}</span>
								)}
							</div>
						</section>{" "}
						{/* Essential Expenses Section */}
						<section className="form-section">
							<h3>Essential Expenses</h3>
							<div className="form-group">
								<label htmlFor="housing">
									Housing (Rent/Mortgage) <span className="required">*</span>
								</label>
								<div className="currency-wrapper">
									<button
										type="button"
										className="currency-prefix-btn"
										onClick={() => toggleCurrencyDisplay("housing")}
										title="Click to toggle currency display"
									>
										{currencyDisplay.housing}
									</button>
									<input
										type="number"
										id="housing"
										name="housing"
										value={formData.housing}
										onChange={handleChange}
										placeholder="e.g., 1500"
										step="0.01"
										min="0"
										disabled={currencyDisplay.housing === "None"}
										className={errors.housing ? "input-error" : ""}
									/>
								</div>
								{errors.housing && (
									<span className="error-text">{errors.housing}</span>
								)}
							</div>{" "}
							<div className="form-grid">
								<div className="form-group">
									<label htmlFor="utilities">Utilities</label>
									<div className="currency-wrapper">
										<button
											type="button"
											className="currency-prefix-btn"
											onClick={() => toggleCurrencyDisplay("utilities")}
											title="Click to toggle currency display"
										>
											{currencyDisplay.utilities}
										</button>
										<input
											type="number"
											id="utilities"
											name="utilities"
											value={formData.utilities}
											onChange={handleChange}
											placeholder="e.g., 150"
											step="0.01"
											min="0"
											disabled={currencyDisplay.utilities === "None"}
										/>
									</div>
								</div>
								<div className="form-group">
									<label htmlFor="groceries">Groceries</label>
									<div className="currency-wrapper">
										<button
											type="button"
											className="currency-prefix-btn"
											onClick={() => toggleCurrencyDisplay("groceries")}
											title="Click to toggle currency display"
										>
											{currencyDisplay.groceries}
										</button>
										<input
											type="number"
											id="groceries"
											name="groceries"
											value={formData.groceries}
											onChange={handleChange}
											placeholder="e.g., 300"
											step="0.01"
											min="0"
											disabled={currencyDisplay.groceries === "None"}
										/>
									</div>
								</div>
								<div className="form-group">
									<label htmlFor="transportation">Transportation</label>
									<div className="currency-wrapper">
										<button
											type="button"
											className="currency-prefix-btn"
											onClick={() => toggleCurrencyDisplay("transportation")}
											title="Click to toggle currency display"
										>
											{currencyDisplay.transportation}
										</button>
										<input
											type="number"
											id="transportation"
											name="transportation"
											value={formData.transportation}
											onChange={handleChange}
											placeholder="e.g., 200"
											step="0.01"
											min="0"
											disabled={currencyDisplay.transportation === "None"}
										/>
									</div>
								</div>
								<div className="form-group">
									<label htmlFor="insurance">Insurance</label>
									<div className="currency-wrapper">
										<button
											type="button"
											className="currency-prefix-btn"
											onClick={() => toggleCurrencyDisplay("insurance")}
											title="Click to toggle currency display"
										>
											{currencyDisplay.insurance}
										</button>
										<input
											type="number"
											id="insurance"
											name="insurance"
											value={formData.insurance}
											onChange={handleChange}
											placeholder="e.g., 100"
											step="0.01"
											min="0"
											disabled={currencyDisplay.insurance === "None"}
										/>
									</div>
								</div>
								<div className="form-group">
									<label htmlFor="phone">Phone</label>
									<div className="currency-wrapper">
										<button
											type="button"
											className="currency-prefix-btn"
											onClick={() => toggleCurrencyDisplay("phone")}
											title="Click to toggle currency display"
										>
											{currencyDisplay.phone}
										</button>
										<input
											type="number"
											id="phone"
											name="phone"
											value={formData.phone}
											onChange={handleChange}
											placeholder="e.g., 80"
											step="0.01"
											min="0"
											disabled={currencyDisplay.phone === "None"}
										/>
									</div>
								</div>
								<div className="form-group">
									<label htmlFor="internet">Internet</label>
									<div className="currency-wrapper">
										<button
											type="button"
											className="currency-prefix-btn"
											onClick={() => toggleCurrencyDisplay("internet")}
											title="Click to toggle currency display"
										>
											{currencyDisplay.internet}
										</button>
										<input
											type="number"
											id="internet"
											name="internet"
											value={formData.internet}
											onChange={handleChange}
											placeholder="e.g., 60"
											step="0.01"
											min="0"
											disabled={currencyDisplay.internet === "None"}
										/>
									</div>
								</div>
							</div>
						</section>
						{/* Debt Payments Section */}
						<section className="form-section">
							<h3>Debt Payments</h3>
							<div className="form-grid">
								<div className="form-group">
									<label htmlFor="creditCardPayment">Credit Card</label>
									<div className="currency-wrapper">
										<button
											type="button"
											className="currency-prefix-btn"
											onClick={() => toggleCurrencyDisplay("creditCardPayment")}
											title="Click to toggle currency display"
										>
											{currencyDisplay.creditCardPayment}
										</button>
										<input
											type="number"
											id="creditCardPayment"
											name="creditCardPayment"
											value={formData.creditCardPayment}
											onChange={handleChange}
											placeholder="e.g., 200"
											step="0.01"
											min="0"
											disabled={currencyDisplay.creditCardPayment === "None"}
										/>
									</div>
								</div>
								<div className="form-group">
									<label htmlFor="studentLoan">Student Loan</label>
									<div className="currency-wrapper">
										<button
											type="button"
											className="currency-prefix-btn"
											onClick={() => toggleCurrencyDisplay("studentLoan")}
											title="Click to toggle currency display"
										>
											{currencyDisplay.studentLoan}
										</button>
										<input
											type="number"
											id="studentLoan"
											name="studentLoan"
											value={formData.studentLoan}
											onChange={handleChange}
											placeholder="e.g., 200"
											step="0.01"
											min="0"
											disabled={currencyDisplay.studentLoan === "None"}
										/>
									</div>
								</div>
								<div className="form-group">
									<label htmlFor="personalLoan">Personal Loan</label>
									<div className="currency-wrapper">
										<button
											type="button"
											className="currency-prefix-btn"
											onClick={() => toggleCurrencyDisplay("personalLoan")}
											title="Click to toggle currency display"
										>
											{currencyDisplay.personalLoan}
										</button>
										<input
											type="number"
											id="personalLoan"
											name="personalLoan"
											value={formData.personalLoan}
											onChange={handleChange}
											placeholder="e.g., 150"
											step="0.01"
											min="0"
											disabled={currencyDisplay.personalLoan === "None"}
										/>
									</div>
								</div>
							</div>
						</section>{" "}
						{/* Discretionary Spending Section */}
						<section className="form-section">
							<h3>Discretionary Spending</h3>
							<div className="form-grid">
								<div className="form-group">
									<label htmlFor="dining">Dining Out</label>
									<div className="currency-wrapper">
										<button
											type="button"
											className="currency-prefix-btn"
											onClick={() => toggleCurrencyDisplay("dining")}
											title="Click to toggle currency display"
										>
											{currencyDisplay.dining}
										</button>
										<input
											type="number"
											id="dining"
											name="dining"
											value={formData.dining}
											onChange={handleChange}
											placeholder="e.g., 200"
											step="0.01"
											min="0"
											disabled={currencyDisplay.dining === "None"}
										/>
									</div>
								</div>
								<div className="form-group">
									<label htmlFor="entertainment">Entertainment</label>
									<div className="currency-wrapper">
										<button
											type="button"
											className="currency-prefix-btn"
											onClick={() => toggleCurrencyDisplay("entertainment")}
											title="Click to toggle currency display"
										>
											{currencyDisplay.entertainment}
										</button>
										<input
											type="number"
											id="entertainment"
											name="entertainment"
											value={formData.entertainment}
											onChange={handleChange}
											placeholder="e.g., 100"
											step="0.01"
											min="0"
											disabled={currencyDisplay.entertainment === "None"}
										/>
									</div>
								</div>
								<div className="form-group">
									<label htmlFor="subscriptions">Subscriptions</label>
									<div className="currency-wrapper">
										<button
											type="button"
											className="currency-prefix-btn"
											onClick={() => toggleCurrencyDisplay("subscriptions")}
											title="Click to toggle currency display"
										>
											{currencyDisplay.subscriptions}
										</button>
										<input
											type="number"
											id="subscriptions"
											name="subscriptions"
											value={formData.subscriptions}
											onChange={handleChange}
											placeholder="e.g., 50"
											step="0.01"
											min="0"
											disabled={currencyDisplay.subscriptions === "None"}
										/>
									</div>
								</div>
								<div className="form-group">
									<label htmlFor="shopping">Shopping</label>
									<div className="currency-wrapper">
										<button
											type="button"
											className="currency-prefix-btn"
											onClick={() => toggleCurrencyDisplay("shopping")}
											title="Click to toggle currency display"
										>
											{currencyDisplay.shopping}
										</button>
										<input
											type="number"
											id="shopping"
											name="shopping"
											value={formData.shopping}
											onChange={handleChange}
											placeholder="e.g., 150"
											step="0.01"
											min="0"
											disabled={currencyDisplay.shopping === "None"}
										/>
									</div>
								</div>
								<div className="form-group">
									<label htmlFor="gym">Gym/Fitness</label>
									<div className="currency-wrapper">
										<button
											type="button"
											className="currency-prefix-btn"
											onClick={() => toggleCurrencyDisplay("gym")}
											title="Click to toggle currency display"
										>
											{currencyDisplay.gym}
										</button>
										<input
											type="number"
											id="gym"
											name="gym"
											value={formData.gym}
											onChange={handleChange}
											placeholder="e.g., 50"
											step="0.01"
											min="0"
											disabled={currencyDisplay.gym === "None"}
										/>
									</div>
								</div>
							</div>
						</section>
						{/* Submit Button */}
						<div className="form-actions">
							<button type="submit" className="btn-save-profile">
								Save Financial Profile
							</button>
						</div>
					</form>
				</div>
			</main>

			{/* Footer */}
			<footer className="profile-footer">
				<p>&copy; 2025 Summit Funds. All rights reserved.</p>
			</footer>
		</div>
	);
}
