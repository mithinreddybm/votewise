import config from './config.js';

/**
 * Authentication manager for VoteWise.
 * Handles Google One Tap and Sign-In button.
 */
class Auth {
    constructor() {
        this.user = null;
        this.onUserChange = null;
    }

    /**
     * Initializes Google Identity Services.
     */
    init(onUserChange) {
        this.onUserChange = onUserChange;
        const clientId = config.get('GOOGLE_CLIENT_ID');
        
        if (!clientId || clientId.includes('your_')) {
            console.warn('Google Client ID not configured for Auth.');
            return;
        }

        // Load the GIS script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => this.initializeGis(clientId);
        document.head.appendChild(script);
    }

    /**
     * Initializes the GIS library.
     */
    initializeGis(clientId) {
        google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => this.handleCredentialResponse(response),
            auto_select: true // Try to auto-login if possible
        });

        this.renderButton();
        
        // Show One Tap prompt
        google.accounts.id.prompt();
    }

    /**
     * Renders the Google Sign-In button.
     */
    renderButton() {
        const parent = document.getElementById('login-button-container');
        if (parent) {
            google.accounts.id.renderButton(
                parent,
                { theme: "filled_blue", size: "large", text: "signin_with", shape: "pill" }
            );
        }
    }

    /**
     * Handles the JWT response from Google.
     */
    handleCredentialResponse(response) {
        // Decode the JWT (base64)
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        this.user = {
            name: payload.name,
            email: payload.email,
            picture: payload.picture
        };

        if (this.onUserChange) {
            this.onUserChange(this.user);
        }
        
        // Toggle UI
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-shell').classList.remove('hidden');
        
        this.showUserProfile();
    }

    /**
     * Shows user profile in the UI.
     */
    showUserProfile() {
        const profileDiv = document.getElementById('user-profile');
        if (!profileDiv) return;

        profileDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${this.user.picture}" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid white;">
                <span style="color: white; font-weight: 500;">${this.user.name}</span>
                <button id="logout-btn" style="background: none; border: 1px solid white; color: white; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Logout</button>
            </div>
        `;

        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
    }

    /**
     * Handles logout.
     */
    logout() {
        this.user = null;
        if (this.onUserChange) this.onUserChange(null);
        
        // Toggle UI back to login
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('app-shell').classList.add('hidden');
        
        // Sign out from Google Session
        google.accounts.id.disableAutoSelect();
    }
}

export const auth = new Auth();
export default auth;
