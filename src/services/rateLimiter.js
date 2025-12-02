/**
 * Shared Rate Limiter for OpenAI API
 * Ensures all API calls across all services respect rate limits
 * Uses a queue to serialize API calls and prevent race conditions
 */

let lastApiCall = 0;
const MIN_API_DELAY = 5000; // 5 seconds between API calls - higher buffer
let apiCallInProgress = false;
let apiQueue = [];
let queueTimeout = null;

/**
 * Process the API call queue sequentially
 */
const processQueue = async () => {
	if (apiCallInProgress || apiQueue.length === 0) return;

	apiCallInProgress = true;
	const resolver = apiQueue.shift();

	const now = Date.now();
	const timeSinceLastCall = now - lastApiCall;
	
	if (timeSinceLastCall < MIN_API_DELAY) {
		const delayNeeded = MIN_API_DELAY - timeSinceLastCall;
		console.log(`Rate limit: Waiting ${(delayNeeded / 1000).toFixed(1)}s before API call (Queue: ${apiQueue.length} pending)`);
		await new Promise(resolve => setTimeout(resolve, delayNeeded));
	}

	lastApiCall = Date.now();
	console.log(`Rate limit: Executing API call (Queue: ${apiQueue.length} remaining)`);
	resolver();

	apiCallInProgress = false;
	
	// Schedule next queue processing
	if (apiQueue.length > 0) {
		// Clear any existing timeout
		if (queueTimeout) clearTimeout(queueTimeout);
		// Process next immediately after this one completes
		queueTimeout = setTimeout(() => processQueue(), 100);
	}
};

/**
 * Enforce rate limiting delay before API calls
 * Queues calls to ensure they're processed sequentially
 */
export const delayApiCall = async () => {
	return new Promise((resolve) => {
		apiQueue.push(resolve);
		console.log(`Rate limit: Call queued (Queue size: ${apiQueue.length})`);
		processQueue();
	});
};

/**
 * Get time until next API call is allowed
 */
export const getTimeUntilNextCall = () => {
	const now = Date.now();
	const timeSinceLastCall = now - lastApiCall;
	return Math.max(0, MIN_API_DELAY - timeSinceLastCall);
};
