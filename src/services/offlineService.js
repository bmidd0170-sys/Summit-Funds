/**
 * Offline Mode Service
 * Manages offline/fallback mode when OpenAI API is unavailable
 * Allows users to work with the app using local budget generation
 */

/**
 * Enable offline mode (use local generation only)
 */
export const enableOfflineMode = () => {
	localStorage.setItem("offlineMode", "true");
	console.log("📴 Offline mode ENABLED - Using local budget generation");
	return true;
};

/**
 * Disable offline mode (try to use API if key is configured)
 */
export const disableOfflineMode = () => {
	localStorage.setItem("offlineMode", "false");
	localStorage.removeItem("apiUnavailable");
	localStorage.removeItem("apiUnavailableReason");
	console.log("🌐 Offline mode DISABLED - Will attempt to use OpenAI API");
	return false;
};

/**
 * Check if offline mode is enabled
 */
export const isOfflineModeEnabled = () => {
	return localStorage.getItem("offlineMode") === "true";
};

/**
 * Get the current API status
 */
export const getAPIStatus = () => {
	const offlineMode = isOfflineModeEnabled();
	const apiUnavailable = localStorage.getItem("apiUnavailable") === "true";
	const apiReason = localStorage.getItem("apiUnavailableReason");

	return {
		offlineModeEnabled: offlineMode,
		apiUnavailable: apiUnavailable || offlineMode,
		reason: apiReason || (offlineMode ? "Offline mode enabled" : "API available"),
		status: offlineMode ? "📴 OFFLINE" : apiUnavailable ? "❌ API UNAVAILABLE" : "✅ ONLINE",
	};
};

/**
 * Mark API as unavailable (auto-called by services on error)
 */
export const markAPIUnavailable = (reason = "Unknown error") => {
	localStorage.setItem("apiUnavailable", "true");
	localStorage.setItem("apiUnavailableReason", reason);
	console.warn("⚠️ API marked as unavailable:", reason);
};

/**
 * Mark API as available again
 */
export const markAPIAvailable = () => {
	localStorage.removeItem("apiUnavailable");
	localStorage.removeItem("apiUnavailableReason");
	console.log("✅ API marked as available");
};

/**
 * Reset offline mode (clear all settings)
 */
export const resetOfflineMode = () => {
	localStorage.removeItem("offlineMode");
	localStorage.removeItem("apiUnavailable");
	localStorage.removeItem("apiUnavailableReason");
	console.log("🔄 Offline mode settings reset");
};

/**
 * Check if API key is configured
 */
export const isAPIKeyConfigured = () => {
	return !!import.meta.env.VITE_OPENAI_API_KEY;
};

/**
 * Get detailed status message for UI
 */
export const getStatusMessage = () => {
	const status = getAPIStatus();

	if (status.offlineModeEnabled) {
		return {
			icon: "📴",
			title: "Offline Mode",
			message: "You're using local budget generation. No API calls are being made.",
			color: "warning",
		};
	}

	if (status.apiUnavailable) {
		return {
			icon: "⚠️",
			title: "API Temporarily Unavailable",
			message: `The OpenAI API is currently unavailable. ${status.reason}. Local budget generation is active.`,
			color: "error",
			actionText: "Enable Offline Mode",
		};
	}

	return {
		icon: "✅",
		title: "AI Features Active",
		message: "All AI features are working. You have access to advanced budget analysis and recommendations.",
		color: "success",
	};
};

export default {
	enableOfflineMode,
	disableOfflineMode,
	isOfflineModeEnabled,
	getAPIStatus,
	markAPIUnavailable,
	markAPIAvailable,
	resetOfflineMode,
	isAPIKeyConfigured,
	getStatusMessage,
};
