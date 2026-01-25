const { Translate } = require('@google-cloud/translate').v2;
const config = require('../config');

let translateClient = null;

// Initialize client if API key is present
if (config.googleTranslateApiKey) {
    translateClient = new Translate({
        key: config.googleTranslateApiKey
    });
}

/**
 * Detect language of text
 * @param {String} text - Text to detect language for
 * @returns {String} Language code (e.g., 'en', 'es')
 */
exports.detectLanguage = async (text) => {
    if (!translateClient) {
        console.log('Google Translate API key not configured. Returning original text with prefix.');
        // Fallback: If no client, assume English or do simple check
        return 'en';
    }

    try {
        const [detections] = await translateClient.detect(text);
        const detection = Array.isArray(detections) ? detections[0] : detections;
        return detection.language;
    } catch (error) {
        console.error('Detection error:', error);
        return 'en'; // Default to English on error
    }
};

/**
 * Translate text to target language
 * @param {String} text - Text to translate
 * @param {String} targetLang - Target language code (e.g., 'es', 'fr', 'de')
 */
exports.translateText = async (text, targetLang) => {
    if (!translateClient) {
        // Fallback/Mock for when API key is not set
        console.warn('Google Translate API key not configured. Returning original text with prefix.');
        return {
            translation: `[${targetLang}] ${text}`,
            detectedSourceLanguage: 'en'
        };
    }

    try {
        const [translation, metadata] = await translateClient.translate(text, targetLang);

        let detectedSourceLanguage = 'en'; // Default fallback

        if (metadata && metadata.data && metadata.data.translations && metadata.data.translations[0]) {
            detectedSourceLanguage = metadata.data.translations[0].detectedSourceLanguage;
        } else if (metadata && metadata.detectedSourceLanguage) {
            detectedSourceLanguage = metadata.detectedSourceLanguage;
        }

        return {
            translation,
            detectedSourceLanguage
        };
    } catch (error) {
        console.error('Translation error:', error);
        // If translation fails, we still want to return something or throw handled error
        throw new Error('Failed to translate text');
    }
};
