import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Quiz.css";

export default function Quiz() {
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [answers, setAnswers] = useState({});
	const [loading, setLoading] = useState(false);

	const questions = [
		{
			id: 1,
			question: "What's your monthly take-home income?",
			type: "currency",
			options: [
				{ label: "Less than $1,000", value: 500 },
				{ label: "$1,000 - $2,000", value: 1500 },
				{ label: "$2,000 - $3,500", value: 2750 },
				{ label: "$3,500 - $5,000", value: 4250 },
				{ label: "$5,000 - $7,500", value: 6250 },
				{ label: "$7,500+", value: 8000 },
				{ label: "None / I'm not currently working", value: 0 },
			],
		},
		{
			id: 2,
			question: "What's your current employment status?",
			type: "text",
			options: [
				{ label: "Full-time employed", value: "fulltime" },
				{ label: "Part-time employed", value: "parttime" },
				{ label: "Self-employed / Freelancer", value: "selfemployed" },
				{ label: "Student", value: "student" },
				{ label: "Retired", value: "retired" },
				{ label: "Unemployed / Between jobs", value: "unemployed" },
				{ label: "Other", value: "other" },
			],
		},
		{
			id: 3,
			question: "What industry or field do you work in?",
			type: "text",
			options: [
				{ label: "Technology / IT", value: "technology" },
				{ label: "Healthcare / Medical", value: "healthcare" },
				{ label: "Finance / Banking", value: "finance" },
				{ label: "Education", value: "education" },
				{ label: "Retail / Sales", value: "retail" },
				{ label: "Manufacturing / Construction", value: "manufacturing" },
				{ label: "Hospitality / Food Service", value: "hospitality" },
				{ label: "Transportation / Logistics", value: "transportation" },
				{ label: "Government / Public Service", value: "government" },
				{ label: "Self-Employed Business Owner", value: "business" },
				{ label: "Freelance / Contract Work", value: "freelance" },
				{ label: "Other / Multiple Industries", value: "other" },
				{ label: "Not Currently Working", value: "notworking" },
			],
		},
		{
			id: 4,
			question: "How many hours per week do you typically work?",
			type: "text",
			options: [
				{ label: "Less than 20 hours", value: 15 },
				{ label: "20 - 30 hours", value: 25 },
				{ label: "30 - 40 hours (Standard)", value: 35 },
				{ label: "40 - 50 hours", value: 45 },
				{ label: "50 - 60 hours", value: 55 },
				{ label: "60+ hours (Very demanding)", value: 65 },
				{ label: "Variable / Unpredictable", value: 40 },
				{ label: "Not Applicable", value: 0 },
			],
		},
		{
			id: 5,
			question: "How stressful is your work?",
			type: "text",
			options: [
				{ label: "Very low stress", value: "verylow" },
				{ label: "Low stress", value: "low" },
				{ label: "Moderate stress", value: "moderate" },
				{ label: "High stress", value: "high" },
				{ label: "Very high stress", value: "veryhigh" },
				{ label: "Not Applicable", value: "na" },
			],
		},
		{
			id: 6,
			question: "Do you have any side income or freelance work?",
			type: "text",
			options: [
				{ label: "No additional income", value: "none" },
				{ label: "Less than $200/month", value: "100" },
				{ label: "$200 - $500/month", value: "350" },
				{ label: "$500 - $1,000/month", value: "750" },
				{ label: "$1,000+/month", value: "1500" },
			],
		},
		{
			id: 7,
			question: "What's your living situation?",
			type: "text",
			options: [
				{ label: "Living alone", value: "alone" },
				{ label: "Living with roommate(s)", value: "roommates" },
				{ label: "Living with family / Parents", value: "family" },
				{ label: "Married / Partner (no kids)", value: "partner" },
				{ label: "Single parent with children", value: "singleparent" },
				{ label: "Married / Partner with children", value: "marriedkids" },
				{ label: "Other", value: "other" },
			],
		},
		{
			id: 8,
			question: "How many dependents do you have?",
			type: "text",
			options: [
				{ label: "No dependents", value: 0 },
				{ label: "1 dependent", value: 1 },
				{ label: "2 dependents", value: 2 },
				{ label: "3 dependents", value: 3 },
				{ label: "4 or more dependents", value: 4 },
			],
		},
		{
			id: 9,
			question: "Do you have any caregiving responsibilities? (elderly parents, children, etc.)",
			type: "text",
			options: [
				{ label: "No caregiving responsibilities", value: "none" },
				{ label: "Occasional caregiving", value: "occasional" },
				{ label: "Part-time caregiving (10-20 hrs/week)", value: "parttime" },
				{ label: "Significant caregiving (20+ hrs/week)", value: "significant" },
			],
		},
		{
			id: 10,
			question: "How much is your monthly housing cost? (rent/mortgage)",
			type: "currency",
			options: [
				{ label: "$0 - None / Living with family", value: 0 },
				{ label: "$500 - $1,000", value: 750 },
				{ label: "$1,000 - $1,500", value: 1250 },
				{ label: "$1,500 - $2,000", value: 1750 },
				{ label: "$2,000 - $3,000", value: 2500 },
				{ label: "$3,000+", value: 3500 },
			],
		},
		{
			id: 10,
			question: "How much is your monthly housing cost? (rent/mortgage)",
			type: "currency",
			options: [
				{ label: "$0 - None / Living with family", value: 0 },
				{ label: "$500 - $1,000", value: 750 },
				{ label: "$1,000 - $1,500", value: 1250 },
				{ label: "$1,500 - $2,000", value: 1750 },
				{ label: "$2,000 - $3,000", value: 2500 },
				{ label: "$3,000+", value: 3500 },
			],
		},
		{
			id: 11,
			question: "How much do you spend on utilities monthly? (electricity, water, gas)",
			type: "currency",
			options: [
				{ label: "$0 - None / Included in rent", value: 0 },
				{ label: "$50 - $100", value: 75 },
				{ label: "$100 - $150", value: 125 },
				{ label: "$150 - $250", value: 200 },
				{ label: "$250+", value: 300 },
			],
		},
		{
			id: 12,
			question: "How much do you spend on groceries monthly?",
			type: "currency",
			options: [
				{ label: "$0 - None", value: 0 },
				{ label: "$100 - $200", value: 150 },
				{ label: "$200 - $350", value: 275 },
				{ label: "$350 - $500", value: 425 },
				{ label: "$500+", value: 600 },
			],
		},
		{
			id: 13,
			question: "How much do you spend on transportation monthly? (car payment, gas, public transit, insurance)",
			type: "currency",
			options: [
				{ label: "$0 - None / Walk or bike", value: 0 },
				{ label: "$50 - $150", value: 100 },
				{ label: "$150 - $300", value: 225 },
				{ label: "$300 - $500", value: 400 },
				{ label: "$500+", value: 700 },
			],
		},
		{
			id: 14,
			question: "How much do you spend on phone/mobile service monthly?",
			type: "currency",
			options: [
				{ label: "$0 - None", value: 0 },
				{ label: "$20 - $50", value: 35 },
				{ label: "$50 - $75", value: 60 },
				{ label: "$75 - $100", value: 85 },
				{ label: "$100+", value: 120 },
			],
		},
		{
			id: 15,
			question: "How much do you spend on insurance monthly? (health, car, renters, etc.)",
			type: "currency",
			options: [
				{ label: "$0 - None / Employer covered", value: 0 },
				{ label: "$50 - $100", value: 75 },
				{ label: "$100 - $200", value: 150 },
				{ label: "$200 - $350", value: 275 },
				{ label: "$350+", value: 500 },
			],
		},
		{
			id: 16,
			question: "How much do you spend on internet monthly?",
			type: "currency",
			options: [
				{ label: "$0 - None / Using phone data only", value: 0 },
				{ label: "$30 - $50", value: 40 },
				{ label: "$50 - $75", value: 60 },
				{ label: "$75 - $100", value: 85 },
				{ label: "$100+", value: 120 },
			],
		},
		{
			id: 17,
			question: "How much do you spend on credit card payments monthly?",
			type: "currency",
			options: [
				{ label: "$0 - No credit card debt", value: 0 },
				{ label: "$50 - $150", value: 100 },
				{ label: "$150 - $300", value: 225 },
				{ label: "$300 - $500", value: 400 },
				{ label: "$500+", value: 750 },
			],
		},
		{
			id: 18,
			question: "How much do you pay monthly on student loans?",
			type: "currency",
			options: [
				{ label: "$0 - No student loans", value: 0 },
				{ label: "$50 - $150", value: 100 },
				{ label: "$150 - $300", value: 225 },
				{ label: "$300 - $500", value: 400 },
				{ label: "$500+", value: 750 },
			],
		},
		{
			id: 19,
			question: "How much do you pay monthly on personal loans?",
			type: "currency",
			options: [
				{ label: "$0 - No personal loans", value: 0 },
				{ label: "$50 - $150", value: 100 },
				{ label: "$150 - $300", value: 225 },
				{ label: "$300 - $500", value: 400 },
				{ label: "$500+", value: 750 },
			],
		},
		{
			id: 20,
			question: "How much do you spend on dining out monthly?",
			type: "currency",
			options: [
				{ label: "$0 - Never dine out", value: 0 },
				{ label: "$50 - $100", value: 75 },
				{ label: "$100 - $200", value: 150 },
				{ label: "$200 - $350", value: 275 },
				{ label: "$350+", value: 500 },
			],
		},
		{
			id: 21,
			question: "How much do you spend on entertainment monthly? (movies, events, hobbies)",
			type: "currency",
			options: [
				{ label: "$0 - None", value: 0 },
				{ label: "$25 - $75", value: 50 },
				{ label: "$75 - $150", value: 112 },
				{ label: "$150 - $250", value: 200 },
				{ label: "$250+", value: 400 },
			],
		},
		{
			id: 22,
			question: "How much do you spend on subscriptions monthly? (streaming, apps, memberships)",
			type: "currency",
			options: [
				{ label: "$0 - None", value: 0 },
				{ label: "$10 - $25", value: 17 },
				{ label: "$25 - $50", value: 37 },
				{ label: "$50 - $100", value: 75 },
				{ label: "$100+", value: 150 },
			],
		},
		{
			id: 23,
			question: "How much do you spend on shopping monthly? (clothes, accessories, household items)",
			type: "currency",
			options: [
				{ label: "$0 - Almost never", value: 0 },
				{ label: "$25 - $75", value: 50 },
				{ label: "$75 - $150", value: 112 },
				{ label: "$150 - $250", value: 200 },
				{ label: "$250+", value: 400 },
			],
		},
		{
			id: 24,
			question: "How much do you spend on gym/fitness monthly?",
			type: "currency",
			options: [
				{ label: "$0 - None", value: 0 },
				{ label: "$10 - $25", value: 17 },
				{ label: "$25 - $50", value: 37 },
				{ label: "$50 - $100", value: 75 },
				{ label: "$100+", value: 150 },
			],
		},
	];

	const handleAnswer = (value) => {
		setAnswers((prev) => ({
			...prev,
			[questions[currentQuestion].id]: value,
		}));

		// Auto-advance to next question after a short delay
		setTimeout(() => {
			if (currentQuestion < questions.length - 1) {
				setCurrentQuestion(currentQuestion + 1);
			}
		}, 300);
	};

	const handleNext = () => {
		if (currentQuestion < questions.length - 1) {
			setCurrentQuestion(currentQuestion + 1);
		}
	};

	const handlePrevious = () => {
		if (currentQuestion > 0) {
			setCurrentQuestion(currentQuestion - 1);
		}
	};

	const handleSubmit = async () => {
		setLoading(true);

		try {
			// Map quiz responses to profile form fields
			const profileData = {
				monthlyIncome: answers[1] || 0,        // Q1: Monthly income
				employmentStatus: answers[2] || "",    // Q2: Employment status
				industry: answers[3] || "",            // Q3: Industry/Field
				workHoursPerWeek: answers[4] || 0,     // Q4: Hours per week
				workStressLevel: answers[5] || "",     // Q5: Work stress
				sideIncome: answers[6] || 0,           // Q6: Side income
				livingSituation: answers[7] || "",     // Q7: Living situation
				dependents: answers[8] || 0,           // Q8: Dependents
				caregivingResponsibilities: answers[9] || "", // Q9: Caregiving
				housing: answers[10] || 0,             // Q10: Housing
				utilities: answers[11] || 0,           // Q11: Utilities
				groceries: answers[12] || 0,           // Q12: Groceries
				transportation: answers[13] || 0,      // Q13: Transportation
				phone: answers[14] || 0,               // Q14: Phone
				insurance: answers[15] || 0,           // Q15: Insurance
				internet: answers[16] || 0,            // Q16: Internet
				creditCardPayment: answers[17] || 0,   // Q17: Credit card
				studentLoan: answers[18] || 0,         // Q18: Student loan
				personalLoan: answers[19] || 0,        // Q19: Personal loan
				dining: answers[20] || 0,              // Q20: Dining out
				entertainment: answers[21] || 0,       // Q21: Entertainment
				subscriptions: answers[22] || 0,       // Q22: Subscriptions
				shopping: answers[23] || 0,            // Q23: Shopping
				gym: answers[24] || 0,                 // Q24: Gym/Fitness
			};

			// Save quiz responses to localStorage
			const quizData = {
				timestamp: new Date().toISOString(),
				responses: answers,
				profileData: profileData,
			};
			localStorage.setItem("quizResponses", JSON.stringify(quizData));

			// Navigate to financial profile page with quiz data
			navigate("/financial-profile", { state: { fromQuiz: true } });
		} catch (err) {
			console.error("Error submitting quiz:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/");
		} catch (err) {
			console.error("Logout failed:", err);
		}
	};

	const question = questions[currentQuestion];
	const progress = ((currentQuestion + 1) / questions.length) * 100;
	const isAnswered = answers[question.id] !== undefined;

	const renderOptions = () => {
		return (
			<div className="currency-options">
				{question.options.map((option) => (
					<button
						key={option.value}
						className={`currency-option ${
							answers[question.id] === option.value ? "selected" : ""
						}`}
						onClick={() => handleAnswer(option.value)}
						disabled={loading}
					>
						{option.label}
					</button>
				))}
			</div>
		);
	};

	return (
		<div className="quiz-container">
		{/* Header */}
		<header className="quiz-header">
			<div className="header-left">
				<button className="logo logo-btn" onClick={() => navigate("/dashboard")}>💰 Summit Funds</button>
				<div className="header-title">
					<h1>Financial Quiz</h1>
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
			<main className="quiz-main">
				<div className="quiz-card">
					{/* Progress Bar */}
					<div className="progress-container">
						<div className="progress-bar">
							<div
								className="progress-fill"
								style={{ width: `${progress}%` }}
							></div>
						</div>
						<p className="progress-text">
							Question {currentQuestion + 1} of {questions.length}
						</p>
					</div>

					{/* Question */}
					<div className="question-section">
						<h2>{question.question}</h2>
						<div className="options-container">{renderOptions()}</div>
					</div>

					{/* Navigation Buttons */}
					<div className="button-container">
						<button
							className="btn-prev"
							onClick={handlePrevious}
							disabled={currentQuestion === 0 || loading}
						>
							← Previous
						</button>

						{currentQuestion === questions.length - 1 ? (
							<button
								className="btn-submit"
								onClick={handleSubmit}
								disabled={!isAnswered || loading}
							>
								{loading ? "Completing Quiz..." : "Complete Quiz"}
							</button>
						) : (
							<button
								className="btn-next"
								onClick={handleNext}
								disabled={!isAnswered || loading}
							>
								Next →
							</button>
						)}
					</div>

					{/* Question Indicator */}
					<div className="question-indicator">
						{questions.map((_, index) => (
							<div
								key={index}
								className={`indicator-dot ${
									index <= currentQuestion ? "visited" : ""
								} ${index === currentQuestion ? "current" : ""} ${
									answers[questions[index].id] !== undefined ? "answered" : ""
								}`}
								onClick={() => setCurrentQuestion(index)}
								title={`Question ${index + 1}`}
							></div>
						))}
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="quiz-footer">
				<p>&copy; 2025 Summit Funds. All rights reserved.</p>
			</footer>
		</div>
	);
}
