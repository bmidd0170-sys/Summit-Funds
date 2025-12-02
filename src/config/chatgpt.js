/**
 * ChatGPT Configuration
 * Centralized configuration for OpenAI API integration
 * 
 * Required Environment Variable:
 * VITE_OPENAI_API_KEY - Your OpenAI API key from https://platform.openai.com/api-keys
 */

export const chatGPTConfig = {
  // API Configuration
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  apiUrl: "https://api.openai.com/v1/chat/completions",
  
  // Model Configuration
  model: "gpt-3.5-turbo", // Can be upgraded to "gpt-4" for better responses
  
  // Generation Parameters
  temperature: 0.7, // Creativity level (0-1, lower = more consistent, higher = more creative)
  maxTokens: 1000, // Maximum tokens per request
  topP: 0.9, // Nucleus sampling
  
  // Retry Configuration
  maxRetries: 3,
  retryDelay: 1000, // milliseconds
  
  // Feature Flags
  features: {
    dailySpendingBreakdown: true,
    rangeSpendingAnalysis: true,
    personalizedRecommendations: true,
    fallbackToLocal: true, // Use local generation if API fails
  },
  
  // System Prompt for Financial Advisor
  systemPrompt: "You are a financial advisor AI that provides detailed daily spending schedules based on CURRENT US economic conditions. Always consider: (1) Current inflation rates and cost of living, (2) Seasonal economic factors, (3) Commodity price trends, (4) Job market conditions. Always respond with valid JSON only, no additional text. Focus on practical, actionable advice following the 50/30/20 budgeting rule (50% essentials, 30% discretionary, 20% savings), adjusted for current economic reality.",
  
  // Timeouts
  requestTimeout: 30000, // 30 seconds
  
  // User Agent
  userAgent: "Summit-Funds/1.0",
};

/**
 * Get ChatGPT configuration
 * @returns {Object} Configuration object
 */
export const getConfig = () => {
  return { ...chatGPTConfig };
};

/**
 * Validate ChatGPT configuration
 * @returns {Object} Validation result
 */
export const validateConfig = () => {
  const errors = [];
  
  if (!chatGPTConfig.apiKey) {
    errors.push("VITE_OPENAI_API_KEY environment variable is not set");
  }
  
  if (!chatGPTConfig.apiUrl) {
    errors.push("API URL is not configured");
  }
  
  if (!chatGPTConfig.model) {
    errors.push("Model is not specified");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings: !chatGPTConfig.apiKey ? ["API key missing - falling back to local generation"] : [],
  };
};

/**
 * Check if API is properly configured
 * @returns {boolean} True if configured
 */
export const isConfigured = () => {
  return !!chatGPTConfig.apiKey;
};

/**
 * Get available models
 * @returns {Array} List of available models
 */
export const getAvailableModels = () => {
  return [
    {
      name: "gpt-3.5-turbo",
      description: "Fast and cost-effective",
      costPer1kTokens: 0.0005,
    },
    {
      name: "gpt-4",
      description: "More intelligent but slower and more expensive",
      costPer1kTokens: 0.03,
    },
  ];
};

/**
 * Get current model info
 * @returns {Object} Current model information
 */
export const getCurrentModelInfo = () => {
  const models = getAvailableModels();
  return models.find((m) => m.name === chatGPTConfig.model) || models[0];
};

export default chatGPTConfig;
