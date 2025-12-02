import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export default function Settings() {
	const navigate = useNavigate();
	const { user, logout, updateEmail, updatePassword } = useAuth();
	const [profileImage, setProfileImage] = useState(
		localStorage.getItem("profileImage") || null
	);
	const [newEmail, setNewEmail] = useState(user?.email || "");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64String = reader.result;
				setProfileImage(base64String);
				localStorage.setItem("profileImage", base64String);
				setMessage("Profile image updated successfully!");
				setTimeout(() => setMessage(""), 3000);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleEmailChange = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setMessage("");

		try {
			if (newEmail !== user?.email) {
				await updateEmail(newEmail);
				setMessage("Email updated successfully!");
				setTimeout(() => setMessage(""), 3000);
			}
		} catch (err) {
			setError(err.message || "Failed to update email");
		} finally {
			setLoading(false);
		}
	};

	const handlePasswordChange = async (e) => {
		e.preventDefault();
		setError("");
		setMessage("");

		if (newPassword !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (newPassword.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		setLoading(true);

		try {
			await updatePassword(newPassword);
			setMessage("Password updated successfully!");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setTimeout(() => setMessage(""), 3000);
		} catch (err) {
			setError(err.message || "Failed to update password");
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

	return (
		<div className="settings-container">
			{/* Header */}
			<header className="settings-header">
				<div className="header-left">
					<button
						className="logo logo-btn"
						onClick={() => navigate("/dashboard")}
					>
						💰 Summit Funds
					</button>
					<div className="header-title">
						<h1>Account Settings</h1>
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
			<main className="settings-main">
				<div className="settings-card">
					{message && <div className="success-message">{message}</div>}
					{error && <div className="error-message">{error}</div>}

					{/* Profile Picture Section */}
					<section className="settings-section">
						<h2>Profile Picture</h2>
						<div className="profile-picture-area">
							{profileImage ? (
								<img
									src={profileImage}
									alt="Profile"
									className="profile-image"
								/>
							) : (
								<div className="profile-image-placeholder">📷</div>
							)}
							<label className="upload-label">
								<input
									type="file"
									accept="image/*"
									onChange={handleImageUpload}
									disabled={loading}
								/>
								Change Picture
							</label>
						</div>
					</section>

					{/* Email Change Section */}
					<section className="settings-section">
						<h2>Email Address</h2>
						<form onSubmit={handleEmailChange}>
							<div className="form-group">
								<label htmlFor="email">Email:</label>
								<input
									type="email"
									id="email"
									value={newEmail}
									onChange={(e) => setNewEmail(e.target.value)}
									disabled={loading}
									required
								/>
							</div>
							<button type="submit" className="btn-save" disabled={loading}>
								{loading ? "Updating..." : "Update Email"}
							</button>
						</form>
					</section>

					{/* Password Change Section */}
					<section className="settings-section">
						<h2>Change Password</h2>
						<form onSubmit={handlePasswordChange}>
							<div className="form-group">
								<label htmlFor="current-password">Current Password:</label>
								<input
									type="password"
									id="current-password"
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
									disabled={loading}
								/>
							</div>
							<div className="form-group">
								<label htmlFor="new-password">New Password:</label>
								<input
									type="password"
									id="new-password"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									disabled={loading}
									required
								/>
							</div>
							<div className="form-group">
								<label htmlFor="confirm-password">Confirm Password:</label>
								<input
									type="password"
									id="confirm-password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									disabled={loading}
									required
								/>
							</div>
							<button type="submit" className="btn-save" disabled={loading}>
								{loading ? "Updating..." : "Update Password"}
							</button>
						</form>
					</section>
				</div>
			</main>

			{/* Footer */}
			<footer className="settings-footer">
				<p>&copy; 2025 Summit Funds. All rights reserved.</p>
			</footer>
		</div>
	);
}
