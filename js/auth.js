/**
 * @fileoverview Authentication manager for VoteWise.
 * Handles Google Identity Services (GIS) One Tap and Sign-In.
 * Includes secure JWT handling and XSS-safe profile rendering.
 * @module auth
 */

'use strict';

import config from './config.js';

/**
 * Sanitizes a string to prevent XSS when rendering user data.
 * @param {string} str - The string to sanitize.
 * @returns {string} Sanitized string safe for text content.
 */
function sanitizeText(str) {
    if (!str || typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Validates a URL string to ensure it is a safe HTTPS URL.
 * @param {string} url - The URL to validate.
 * @returns {string} The validated URL or empty string.
 */
function sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return '';
    try {
        const parsed = new URL(url);
        if (parsed.protocol === 'https:') return url;
        return '';
    } catch {
        return '';
    }
}

/**
 * Authentication manager class.
 * Manages Google Sign-In lifecycle, JWT processing, and UI state.
 */
class Auth {
    /**
     * Creates a new Auth instance.
     */
    constructor() {
        /** @type {Object|null} Current authenticated user */
        this.user = null;
        /** @type {Function|null} Callback for user state changes */
        this.onUserChange = null;
    }

    /**
     * Initializes Google Identity Services.
     * @param {Function} onUserChange - Callback invoked when user state changes.
     */
    init(onUserChange) {
        this.onUserChange = onUserChange;
        const clientId = config.get('GOOGLE_CLIENT_ID');

        if (!clientId || clientId.includes('your_')) {
            console.warn('Auth: Google Client ID not configured.');
            return;
        }

        // Load the GIS script dynamically
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => this._initializeGis(clientId);
        script.onerror = () => console.error('Auth: Failed to load Google Identity Services script.');
        document.head.appendChild(script);
    }

    /**
     * Initializes the GIS library with client configuration.
     * @param {string} clientId - Google OAuth Client ID.
     * @private
     */
    _initializeGis(clientId) {
        try {
            google.accounts.id.initialize({
                client_id: clientId,
                callback: (response) => this._handleCredentialResponse(response),
                auto_select: true
            });

            this._renderButton();
            google.accounts.id.prompt();
        } catch (error) {
            console.error('Auth: GIS initialization failed:', error.message);
        }
    }

    /**
     * Renders the Google Sign-In button in the login container.
     * @private
     */
    _renderButton() {
        const parent = document.getElementById('login-button-container');
        if (parent) {
            google.accounts.id.renderButton(
                parent,
                { theme: 'filled_blue', size: 'large', text: 'signin_with', shape: 'pill' }
            );
        }
    }

    /**
     * Handles the JWT credential response from Google.
     * Decodes payload and updates application state.
     * @param {Object} response - Google credential response containing JWT.
     * @private
     */
    _handleCredentialResponse(response) {
        try {
            if (!response || !response.credential) {
                throw new Error('Invalid credential response');
            }

            // Decode the JWT payload (base64url)
            const parts = response.credential.split('.');
            if (parts.length !== 3) {
                throw new Error('Malformed JWT token');
            }

            const payload = JSON.parse(atob(parts[1]));

            // Validate required fields
            if (!payload.name || !payload.email) {
                throw new Error('Missing required user fields in JWT');
            }

            this.user = {
                name: sanitizeText(payload.name),
                email: sanitizeText(payload.email),
                picture: sanitizeUrl(payload.picture)
            };

            if (this.onUserChange) {
                this.onUserChange(this.user);
            }

            // Toggle UI visibility
            const loginScreen = document.getElementById('login-screen');
            const appShell = document.getElementById('app-shell');
            if (loginScreen) loginScreen.classList.add('hidden');
            if (appShell) appShell.classList.remove('hidden');

            this._showUserProfile();
        } catch (error) {
            console.error('Auth: Credential processing failed:', error.message);
        }
    }

    /**
     * Shows the authenticated user profile in the header.
     * Uses safe DOM methods to prevent XSS.
     * @private
     */
    _showUserProfile() {
        const profileDiv = document.getElementById('user-profile');
        if (!profileDiv || !this.user) return;

        // Clear previous content
        profileDiv.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;align-items:center;gap:10px;';

        // Avatar
        if (this.user.picture) {
            const img = document.createElement('img');
            img.src = this.user.picture;
            img.alt = `${this.user.name}'s profile picture`;
            img.style.cssText = 'width:32px;height:32px;border-radius:50%;border:2px solid white;';
            img.referrerPolicy = 'no-referrer';
            wrapper.appendChild(img);
        }

        // Name
        const nameSpan = document.createElement('span');
        nameSpan.textContent = this.user.name;
        nameSpan.style.cssText = 'color:white;font-weight:500;';
        wrapper.appendChild(nameSpan);

        // Logout button
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logout-btn';
        logoutBtn.textContent = 'Logout';
        logoutBtn.setAttribute('aria-label', 'Sign out of VoteWise');
        logoutBtn.style.cssText = 'background:none;border:1px solid white;color:white;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:0.8rem;';
        logoutBtn.addEventListener('click', () => this.logout());
        wrapper.appendChild(logoutBtn);

        profileDiv.appendChild(wrapper);
    }

    /**
     * Handles user logout.
     * Clears user state and resets UI to login screen.
     */
    logout() {
        this.user = null;
        if (this.onUserChange) this.onUserChange(null);

        const loginScreen = document.getElementById('login-screen');
        const appShell = document.getElementById('app-shell');
        if (loginScreen) loginScreen.classList.remove('hidden');
        if (appShell) appShell.classList.add('hidden');

        // Disable auto-select for next visit
        try {
            google.accounts.id.disableAutoSelect();
        } catch (e) {
            console.warn('Auth: Could not disable auto-select:', e.message);
        }
    }

    /**
     * Returns the current authenticated user.
     * @returns {Object|null} Current user object or null.
     */
    getUser() {
        return this.user;
    }

    /**
     * Checks if a user is currently authenticated.
     * @returns {boolean} True if a user is logged in.
     */
    isAuthenticated() {
        return this.user !== null;
    }
}

export const auth = new Auth();
export default auth;
