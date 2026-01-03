const { customAlphabet } = require('nanoid');

// Use URL-safe characters without ambiguous characters
const alphabet = '0123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 10);

/**
 * Generate a unique short ID for story sharing
 * @returns {String} Unique 10-character ID
 */
const generateShareId = () => {
    return nanoid();
};

module.exports = generateShareId;
