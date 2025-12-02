import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }) {
	const { user, loading, isDeveloper } = useAuth();

	if (loading) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
				}}
			>
				<div style={{ textAlign: "center" }}>
					<p style={{ fontSize: "1.2rem", color: "#666" }}>Loading...</p>
				</div>
			</div>
		);
	}

	// Allow access if user is logged in OR if developer mode is enabled
	if (!user && !isDeveloper) {
		return <Navigate to="/login" replace />;
	}

	// If developer mode is enabled, render a dev indicator
	if (isDeveloper && !user) {
		return (
			<div>
				<div
					style={{
						position: "fixed",
						top: "10px",
						right: "10px",
						background: "#ff9800",
						color: "white",
						padding: "8px 12px",
						borderRadius: "4px",
						fontSize: "12px",
						fontWeight: "bold",
						zIndex: 9999,
					}}
				>
					🔧 DEVELOPER MODE
				</div>
				{children}
			</div>
		);
	}

	return children;
}
