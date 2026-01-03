require('dotenv').config();

const config = {
    // Server
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/story-app',

    // CORS
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

    // Translation
    googleTranslateApiKey: process.env.GOOGLE_TRANSLATE_API_KEY,

    // Rate Limiting
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes,
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
};

// Validate required environment variables
const validateConfig = () => {
    const required = [];
    const missing = required.filter(key => !config[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};

// Only validate in production
if (config.nodeEnv === 'production') {
    validateConfig();
}

module.exports = config;
