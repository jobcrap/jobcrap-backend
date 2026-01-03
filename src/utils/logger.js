const config = require('../config');

/**
 * Simple logger utility
 * In production, consider using Winston or similar
 */
const logger = {
    info: (message, ...args) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
    },

    error: (message, ...args) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
    },

    warn: (message, ...args) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
    },

    debug: (message, ...args) => {
        if (config.nodeEnv === 'development') {
            console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
        }
    }
};

module.exports = logger;
