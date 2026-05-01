import config from './config.js';
import timeline from './timeline.js';
import gemini from './gemini.js';
import maps from './maps.js';
import quiz from './quiz.js';
import auth from './auth.js';
import electionStats from './stats.js';

/**
 * Main Application Orchestrator for VoteWise.
 */
class App {
    constructor() {
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.modal = document.getElementById('details-modal');
        this.closeModal = document.querySelector('.close-modal');
    }

    /**
     * Initializes the application.
     */
    async init() {
        console.log('VoteWise initializing...');
        
        // 1. Load Configuration
        await config.load();

        // 2. Initialize Components
        auth.init((user) => {
            console.log('User logged in:', user);
        });
        timeline.init();
        electionStats.init();
        gemini.init();
        maps.init();
        quiz.init();

        // 3. Setup Global Listeners
        this.setupTabListeners();
        this.setupModalListeners();
        
        console.log('VoteWise ready!');
    }

    /**
     * Sets up listeners for tab navigation.
     */
    setupTabListeners() {
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                this.switchTab(targetTab);
            });
        });
    }

    /**
     * Switches between application tabs.
     * @param {string} tabId - ID of the tab to show.
     */
    switchTab(tabId) {
        // Update Buttons
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        // Update Content
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });
    }

    /**
     * Sets up listeners for the global modal.
     */
    setupModalListeners() {
        if (this.closeModal) {
            this.closeModal.addEventListener('click', () => {
                this.modal.style.display = 'none';
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.modal.style.display = 'none';
            }
        });

        // Escape key to close modal
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                this.modal.style.display = 'none';
            }
        });
    }
}

// Instantiate and launch the app
const app = new App();
document.addEventListener('DOMContentLoaded', () => {
    app.init().catch(err => {
        console.error('App initialization failed:', err);
    });
});
