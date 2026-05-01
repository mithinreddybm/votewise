/**
 * @fileoverview Configuration manager for VoteWise.
 * Handles loading environment variables from the .env file
 * with validation, error handling, and security checks.
 * @module config
 */

'use strict';

/** @constant {Object} Default configuration keys */
const DEFAULT_KEYS = Object.freeze({
    GEMINI_API_KEY: '',
    MAPS_API_KEY: '',
    GOOGLE_CLIENT_ID: '',
    GCP_PROJECT_ID: '',
    GCP_REGION: ''
});

/** @constant {string} Error messages */
const ERROR_MESSAGES = Object.freeze({
    LOAD_FAILED: 'Failed to load .env file. Ensure it exists in the project root.',
    KEYS_MISSING: 'API keys not configured. Please fill in your .env file. See README for instructions.',
    INVALID_KEY_FORMAT: 'One or more API keys appear to be placeholder values.'
});

/**
 * Configuration manager class.
 * Loads, parses, and validates environment configuration.
 */
class Config {
    /**
     * Creates a new Config instance with default empty keys.
     */
    constructor() {
        /** @type {Object<string, string>} Loaded configuration keys */
        this.keys = { ...DEFAULT_KEYS };
        /** @type {boolean} Whether configuration has been loaded */
        this.isLoaded = false;
        /** @type {string[]} List of validation errors */
        this.errors = [];
    }

    /**
     * Loads the .env file and parses its contents.
     * @returns {Promise<boolean>} True if loaded and validated successfully.
     */
    async load() {
        try {
            const response = await fetch('.env');
            if (!response.ok) {
                throw new Error(ERROR_MESSAGES.LOAD_FAILED);
            }
            const text = await response.text();
            this.parseEnv(text);
            this.isLoaded = true;
            const isValid = this.validate();
            if (!isValid) {
                this.showBanner();
            }
            return isValid;
        } catch (error) {
            console.error('Config loading error:', error.message);
            this.errors.push(error.message);
            this.showBanner();
            return false;
        }
    }

    /**
     * Parses the raw text of the .env file into key-value pairs.
     * Ignores comments (lines starting with #) and empty lines.
     * @param {string} text - Raw content of .env file.
     */
    parseEnv(text) {
        if (!text || typeof text !== 'string') {
            this.errors.push('Empty or invalid .env content.');
            return;
        }

        const lines = text.split('\n');
        lines.forEach((line, lineNumber) => {
            // Skip empty lines and comments
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;

            const equalsIndex = trimmed.indexOf('=');
            if (equalsIndex === -1) return;

            const key = trimmed.substring(0, equalsIndex).trim();
            const value = trimmed.substring(equalsIndex + 1).trim();

            if (Object.prototype.hasOwnProperty.call(DEFAULT_KEYS, key)) {
                this.keys[key] = value;
            }
        });
    }

    /**
     * Validates that all required keys are present and not placeholders.
     * @returns {boolean} True if all keys are valid.
     */
    validate() {
        this.errors = [];

        const requiredKeys = ['GEMINI_API_KEY', 'MAPS_API_KEY'];
        const placeholderPatterns = ['your_', 'YOUR_', 'xxx', 'placeholder'];

        for (const key of requiredKeys) {
            const value = this.keys[key];
            if (!value) {
                this.errors.push(`Missing required key: ${key}`);
                continue;
            }

            const isPlaceholder = placeholderPatterns.some(pattern =>
                value.toLowerCase().includes(pattern)
            );

            if (isPlaceholder) {
                this.errors.push(`${key} appears to be a placeholder value.`);
            }
        }

        return this.errors.length === 0;
    }

    /**
     * Displays a configuration warning banner if keys are missing.
     * Uses safe DOM methods to prevent XSS.
     */
    showBanner() {
        // Remove existing banner if present
        const existing = document.getElementById('api-warning-banner');
        if (existing) existing.remove();

        const banner = document.createElement('div');
        banner.id = 'api-warning-banner';
        banner.setAttribute('role', 'alert');
        banner.setAttribute('aria-live', 'assertive');

        const inner = document.createElement('div');
        inner.style.cssText = 'background:#ff5252;color:white;padding:15px;text-align:center;font-weight:bold;position:fixed;top:0;left:0;right:0;z-index:9999;display:flex;justify-content:center;align-items:center;gap:15px;';

        const msg = document.createElement('span');
        msg.textContent = ERROR_MESSAGES.KEYS_MISSING;

        const dismissBtn = document.createElement('button');
        dismissBtn.textContent = 'Dismiss';
        dismissBtn.setAttribute('aria-label', 'Dismiss warning');
        dismissBtn.style.cssText = 'background:rgba(0,0,0,0.2);border:none;color:white;cursor:pointer;padding:5px 10px;border-radius:4px;';
        dismissBtn.addEventListener('click', () => banner.remove());

        inner.appendChild(msg);
        inner.appendChild(dismissBtn);
        banner.appendChild(inner);
        document.body.prepend(banner);
    }

    /**
     * Gets a configuration value by key.
     * @param {string} key - The configuration key to retrieve.
     * @returns {string} The configuration value, or empty string if not found.
     */
    get(key) {
        if (!Object.prototype.hasOwnProperty.call(this.keys, key)) {
            console.warn(`Config: Unknown key "${key}" requested.`);
            return '';
        }
        return this.keys[key];
    }

    /**
     * Returns all validation errors.
     * @returns {string[]} Array of error messages.
     */
    getErrors() {
        return [...this.errors];
    }
}

export const config = new Config();
export default config;
