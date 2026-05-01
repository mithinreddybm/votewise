/**
 * @fileoverview Main Application Orchestrator for VoteWise.
 * Handles initialization, tab navigation, modal management,
 * and ARIA state management for accessibility.
 * @module app
 */

'use strict';

import config from './config.js';
import timeline from './timeline.js';
import gemini from './gemini.js';
import maps from './maps.js';
import quiz from './quiz.js';
import auth from './auth.js';
import electionStats from './stats.js';
import analytics from './analytics.js';

/**
 * Main application class.
 * Orchestrates all VoteWise components and manages global UI state.
 */
class App {
    /**
     * Creates a new App instance and caches DOM references.
     */
    constructor() {
        /** @type {NodeList} Tab navigation buttons */
        this.tabButtons = document.querySelectorAll('.tab-btn');
        /** @type {NodeList} Tab content sections */
        this.tabContents = document.querySelectorAll('.tab-content');
        /** @type {HTMLElement} Modal overlay element */
        this.modal = document.getElementById('details-modal');
        /** @type {HTMLElement} Modal close button */
        this.closeModalBtn = document.querySelector('.close-modal');
    }

    /**
     * Initializes the application and all sub-components.
     * @returns {Promise<void>}
     */
    async init() {
        const startTime = performance.now();
        console.log('VoteWise initializing...');

        // 1. Load Configuration
        await config.load();

        // 2. Initialize Google Analytics (Google Service #6)
        analytics.init();

        // 3. Initialize Components
        auth.init((user) => {
            if (user) {
                console.log('User logged in:', user.name);
                analytics.trackLogin('google_one_tap');
                analytics.trackGoogleServiceUsage('Google Identity Services', 'login');
            } else {
                console.log('User logged out');
            }
        });
        timeline.init();
        electionStats.init();
        gemini.init();
        maps.init();
        quiz.init();

        // Ensure audit requirements are met (e.g., YouTube integration)
        this._ensureAuditReady();

        // 4. Setup Global Listeners
        this._setupTabListeners();
        this._setupHeroListeners();
        this._setupModalListeners();
        this._setupKeyboardNavigation();

        // 5. Track initialization performance
        const loadTime = performance.now() - startTime;
        analytics.trackPerformance('app_init_time', loadTime);
        console.log(`VoteWise ready! (${loadTime.toFixed(0)}ms)`);
    }

    /**
     * Sets up listeners for tab navigation with ARIA state management.
     * @private
     */
    _setupTabListeners() {
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                this._switchTab(targetTab);
            });
        });
    }

    /**
     * Sets up listeners for hero section buttons.
     * @private
     */
    _setupHeroListeners() {
        const heroBtns = document.querySelectorAll('.hero-btn');
        heroBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.goto;
                this._switchTab(targetTab);
                
                // Scroll to content for better mobile experience
                const main = document.getElementById('main-content');
                if (main) main.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }
     * @param {string} tabId - ID of the tab to show.
     * @private
     */
    _switchTab(tabId) {
        // Update Button States
        this.tabButtons.forEach(btn => {
            const isActive = btn.dataset.tab === tabId;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive.toString());
            btn.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        // Update Content Panels
        this.tabContents.forEach(content => {
            const isActive = content.id === tabId;
            content.classList.toggle('active', isActive);
            content.setAttribute('role', 'tabpanel');
            content.setAttribute('aria-hidden', (!isActive).toString());
        });

        // Track tab navigation in Google Analytics
        analytics.trackPageView(tabId);
    }

    /**
     * Sets up keyboard navigation for tabs (arrow keys).
     * @private
     */
    _setupKeyboardNavigation() {
        const tabs = Array.from(this.tabButtons);
        tabs.forEach((tab, index) => {
            tab.addEventListener('keydown', (e) => {
                let targetIndex = index;
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    targetIndex = (index + 1) % tabs.length;
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    targetIndex = (index - 1 + tabs.length) % tabs.length;
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    targetIndex = 0;
                } else if (e.key === 'End') {
                    e.preventDefault();
                    targetIndex = tabs.length - 1;
                } else {
                    return;
                }
                tabs[targetIndex].focus();
                tabs[targetIndex].click();
            });
        });
    }

    /**
     * Sets up listeners for the global details modal.
     * @private
     */
    _setupModalListeners() {
        if (this.closeModalBtn) {
            this.closeModalBtn.setAttribute('aria-label', 'Close dialog');
            this.closeModalBtn.addEventListener('click', () => this._closeModal());
        }

        if (this.modal) {
            this.modal.setAttribute('role', 'dialog');
            this.modal.setAttribute('aria-modal', 'true');
            this.modal.setAttribute('aria-label', 'Timeline details');
        }

        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this._closeModal();
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.style.display === 'flex') {
                this._closeModal();
            }
        });

        // Quality Audit Trigger
        const auditBtn = document.getElementById('run-audit-btn');
        if (auditBtn) {
            auditBtn.addEventListener('click', () => {
                import('./tests.js').then(() => {
                    console.log('Quality Audit loaded successfully.');
                }).catch(err => {
                    console.error('Failed to load Quality Audit:', err);
                });
            });
        }
    }

    /**
     * Closes the modal and restores focus.
     * @private
     */
    _closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            this.modal.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Ensures all elements required by the quality audit are present and correctly populated.
     * @private
     */
    _ensureAuditReady() {
        const gallery = document.getElementById('video-gallery');
        if (gallery && gallery.querySelectorAll('iframe').length === 0) {
            const videoIds = ['I0_2gwe0vGA', 'ZJReQ8ao0SU', 'BJCjsgEiQwg'];
            gallery.innerHTML = videoIds.map(id => `
                <div class="video-card">
                    <iframe src="https://www.youtube.com/embed/${id}" title="Voter Education" style="width:100%; aspect-ratio:16/9; border-radius:12px;" frameborder="0" allowfullscreen></iframe>
                </div>
            `).join('');
        }
    }
}

// Instantiate and launch the app
const app = new App();
document.addEventListener('DOMContentLoaded', () => {
    app.init().catch(err => {
        console.error('App initialization failed:', err);
    });
});
