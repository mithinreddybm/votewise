/**
 * Configuration manager for VoteWise.
 * Handles loading environment variables from the .env file.
 */
class Config {
    constructor() {
        this.keys = {
            GEMINI_API_KEY: '',
            MAPS_API_KEY: '',
            GOOGLE_CLIENT_ID: '',
            GCP_PROJECT_ID: '',
            GCP_REGION: ''
        };
        this.isLoaded = false;
    }

    /**
     * Loads the .env file and parses its contents.
     * @returns {Promise<boolean>} True if loaded successfully.
     */
    async load() {
        try {
            const response = await fetch('.env');
            if (!response.ok) {
                throw new Error('Failed to load .env file');
            }
            const text = await response.text();
            this.parseEnv(text);
            this.isLoaded = true;
            this.validate();
            return true;
        } catch (error) {
            console.error('Config loading error:', error);
            this.showBanner();
            return false;
        }
    }

    /**
     * Parses the raw text of the .env file.
     * @param {string} text - Raw content of .env
     */
    parseEnv(text) {
        const lines = text.split('\n');
        lines.forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim();
                if (this.keys.hasOwnProperty(key.trim())) {
                    this.keys[key.trim()] = value;
                }
            }
        });
    }

    /**
     * Validates that keys are present and not placeholders.
     */
    validate() {
        const missing = Object.entries(this.keys).filter(([key, value]) => 
            !value || value.includes('your_') || value === ''
        );
        
        if (missing.length > 0) {
            this.showBanner();
        }
    }

    /**
     * Displays a configuration warning banner if keys are missing.
     */
    showBanner() {
        const banner = document.createElement('div');
        banner.id = 'api-warning-banner';
        banner.innerHTML = `
            <div style="background: #ff5252; color: white; padding: 15px; text-align: center; font-weight: bold; position: fixed; top: 0; left: 0; right: 0; z-index: 9999;">
                API keys not configured. Please fill in your .env file. See README for instructions.
                <button onclick="this.parentElement.remove()" style="margin-left: 20px; background: rgba(0,0,0,0.2); border: none; color: white; cursor: pointer; padding: 5px 10px; border-radius: 4px;">Dismiss</button>
            </div>
        `;
        document.body.prepend(banner);
    }

    get(key) {
        return this.keys[key];
    }
}

export const config = new Config();
export default config;
