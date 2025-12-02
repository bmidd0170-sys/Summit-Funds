import { useState, useEffect, useRef } from "react";
import {
	generateBudgetAdvice,
	generateGoalImprovementTips,
} from "../services/aiChatService";
import "../App.css";

export default function BudgetChatbot({
	userProfile,
	budgetPlan,
	dailyBudget,
	selectedDate,
}) {
	const [messages, setMessages] = useState([]);
	const [inputValue, setInputValue] = useState("");
	const [loading, setLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const messagesEndRef = useRef(null);

	// Initialize with welcome message
	useEffect(() => {
		if (messages.length === 0) {
			const hasGoal = budgetPlan?.goalType && budgetPlan?.goalType !== "skip";
			const goalInfo = hasGoal
				? `\n• 🎯 Tips to reach your ${
						budgetPlan.goalType === "total" ? "savings" : "monthly"
				  } goal`
				: "";

			setMessages([
				{
					id: 1,
					type: "bot",
					text: `Hello! 👋 I'm your AI Budget Advisor. I can help you with:
• Daily budget planning and spending tips
• How current economic events affect your budget
• Answering questions about inflation, market trends
• Seasonal spending advice
• Personalized budget recommendations${goalInfo}

What would you like to know today?`,
					timestamp: new Date(),
				},
			]);
		}
	}, [budgetPlan]);

	// Auto-scroll to latest message
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSendMessage = async (e) => {
		e.preventDefault();

		if (!inputValue.trim() || loading) return;

		const userQuestionText = inputValue;

		// Add user message
		const userMessage = {
			id: messages.length + 1,
			type: "user",
			text: userQuestionText,
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInputValue("");
		setLoading(true);

		try {
			// Check if user is asking for goal tips
			const isGoalQuestion =
				userQuestionText.toLowerCase().includes("🎯") ||
				userQuestionText.toLowerCase().includes("goal") ||
				userQuestionText.toLowerCase().includes("reach my");

			let response;
			if (isGoalQuestion && hasGoal) {
				// Get goal-specific improvement tips
				const breakdowns = localStorage.getItem("budgetBreakdowns");
				const breakdown = breakdowns
					? JSON.parse(breakdowns)[Object.keys(JSON.parse(breakdowns))[0]]
					: null;
				response = await generateGoalImprovementTips(
					userProfile,
					budgetPlan,
					breakdown
				);
			} else {
				// Get general budget advice
				response = await generateBudgetAdvice(
					userProfile,
					budgetPlan,
					dailyBudget,
					selectedDate,
					userQuestionText,
					messages
				);
			}

			const botMessage = {
				id: messages.length + 2,
				type: "bot",
				text: response,
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, botMessage]);
		} catch (error) {
			console.error("Error getting response:", error);

			const errorMessage = {
				id: messages.length + 2,
				type: "bot",
				text: "Sorry, I encountered an error. Please try again.",
				timestamp: new Date(),
				isError: true,
			};

			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setLoading(false);
		}
	};

	const handleClearChat = () => {
		setMessages([
			{
				id: 1,
				type: "bot",
				text: `Hello! 👋 I'm your AI Budget Advisor. I can help you with:
• Daily budget planning and spending tips
• How current economic events affect your budget
• Answering questions about inflation, market trends
• Seasonal spending advice
• Personalized budget recommendations

What would you like to know today?`,
				timestamp: new Date(),
			},
		]);
	};

	const quickQuestions = [
		"How should I spend today based on current economy?",
		"What are current inflation impacts on my budget?",
		"How can I save more this month?",
		"What economic events should I worry about?",
		"Is it a good time to make purchases?",
	];

	// Add goal-specific quick question if user has a goal
	const hasGoal = budgetPlan?.goalType && budgetPlan?.goalType !== "skip";
	const goalQuestion = hasGoal
		? budgetPlan?.goalType === "total"
			? "🎯 Tips to reach my total savings goal?"
			: "🎯 How can I reach my monthly savings goal?"
		: null;

	return (
		<div className={`chatbot-container ${isOpen ? "open" : "closed"}`}>
			{/* Chat Widget Button */}
			<button
				className="chatbot-toggle-btn"
				onClick={() => setIsOpen(!isOpen)}
				title={isOpen ? "Close chat" : "Open AI Budget Advisor"}
			>
				{isOpen ? "✕" : "💬"}
			</button>

			{/* Chat Window */}
			{isOpen && (
				<div className="chatbot-window">
					{/* Header */}
					<div className="chatbot-header">
						<div className="header-content">
							<h3>🤖 AI Budget Advisor</h3>
							<p>Ask me anything about your budget</p>
						</div>
						<button
							className="header-close-btn"
							onClick={() => setIsOpen(false)}
						>
							✕
						</button>
					</div>
					{/* Messages Area */}
					<div className="chatbot-messages">
						{messages.map((message) => (
							<div
								key={message.id}
								className={`message ${message.type} ${
									message.isError ? "error" : ""
								}`}
							>
								<div className="message-avatar">
									{message.type === "bot" ? "🤖" : "👤"}
								</div>
								<div className="message-content">
									<p>{message.text}</p>
									<span className="message-time">
										{message.timestamp.toLocaleTimeString("en-US", {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</div>
							</div>
						))}

						{loading && (
							<div className="message bot">
								<div className="message-avatar">🤖</div>
								<div className="message-content">
									<div className="typing-indicator">
										<span></span>
										<span></span>
										<span></span>
									</div>
								</div>
							</div>
						)}

						<div ref={messagesEndRef} />
					</div>
					{/* Quick Questions */}
					{messages.length === 1 && (
						<div className="quick-questions">
							<div className="questions-grid">
								{goalQuestion && (
									<button
										className="quick-question-btn goal-question"
										onClick={() => {
											setInputValue(goalQuestion);
										}}
										title="Get AI tips for reaching your goal"
									>
										{goalQuestion}
									</button>
								)}
								{quickQuestions.map((question, index) => (
									<button
										key={index}
										className="quick-question-btn"
										onClick={() => {
											setInputValue(question);
										}}
									>
										{question}
									</button>
								))}
							</div>
						</div>
					)}{" "}
					{/* Input Area */}
					<form className="chatbot-input-form" onSubmit={handleSendMessage}>
						<input
							type="text"
							placeholder="Ask me about your budget..."
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							disabled={loading}
							className="chatbot-input"
						/>
						<button
							type="submit"
							disabled={loading || !inputValue.trim()}
							className="send-btn"
						>
							{loading ? "..." : "Send"}
						</button>
					</form>
					{/* Footer */}
					<div className="chatbot-footer">
						<button className="clear-chat-btn" onClick={handleClearChat}>
							Clear chat
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
