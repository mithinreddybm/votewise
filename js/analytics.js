/**
 * @fileoverview Google Analytics integration for VoteWise.
 * Tracks user interactions, page views, and feature usage
 * using Google Analytics 4 (gtag.js) measurement protocol.
 * 
 * Google Service #6: Google Analytics
 * @module analytics
 */

'use strict';

import config from './config.js';

/** @constant {string} Default GA4 Measurement ID */
const GA_MEASUREMENT_ID = 'G-VOTEWISE';

/**
 * Google Analytics tracking wrapper.
 * Provides structured event tracking for all VoteWise features.
 */
class Analytics {
    /**
     * Creates a new Analytics instance.
     */
    constructor() {
        /** @type {boolean} Whether analytics is initialized */
        this.isInitialized = false;
        /** @type {string} GA4 Measurement ID */
        this.measurementId = GA_MEASUREMENT_ID;
    }

    /**
     * Initializes Google Analytics 4 by loading the gtag.js script.
     * Safe to call multiple times; will only initialize once.
     */
    init() {
        if (this.isInitialized) return;

        try {
            // Create gtag dataLayer
            window.dataLayer = window.dataLayer || [];
            window.gtag = function () {
                window.dataLayer.push(arguments);
            };
            window.gtag('js', new Date());
            window.gtag('config', this.measurementId, {
                'anonymize_ip': true,
                'cookie_flags': 'SameSite=None;Secure',
                'send_page_view': true
            });

            // Load gtag.js script asynchronously
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
            script.onerror = () => console.warn('Analytics: Failed to load gtag.js');
            document.head.appendChild(script);

            this.isInitialized = true;
            console.log('Analytics: Google Analytics initialized');
        } catch (error) {
            console.warn('Analytics: Initialization failed:', error.message);
        }
    }

    /**
     * Tracks a custom event.
     * @param {string} eventName - Event name (e.g., 'chat_message_sent').
     * @param {Object} [params={}] - Additional event parameters.
     */
    trackEvent(eventName, params = {}) {
        if (!this.isInitialized || typeof window.gtag !== 'function') return;

        try {
            window.gtag('event', eventName, {
                ...params,
                event_category: params.category || 'engagement',
                event_label: params.label || '',
                value: params.value || 0
            });
        } catch (error) {
            console.warn('Analytics: Event tracking failed:', error.message);
        }
    }

    /**
     * Tracks a page view or tab switch.
     * @param {string} pageName - Name of the page or tab.
     */
    trackPageView(pageName) {
        this.trackEvent('page_view', {
            page_title: pageName,
            page_location: window.location.href,
            category: 'navigation'
        });
    }

    /**
     * Tracks an AI chat interaction.
     * @param {string} query - The user's query text.
     * @param {boolean} success - Whether the API call succeeded.
     */
    trackChatMessage(query, success) {
        this.trackEvent('ai_chat_message', {
            category: 'ai_interaction',
            label: query.substring(0, 50), // Truncate for privacy
            value: success ? 1 : 0
        });
    }

    /**
     * Tracks a booth search action.
     * @param {string} method - Search method ('address' or 'geolocation').
     */
    trackBoothSearch(method) {
        this.trackEvent('booth_search', {
            category: 'maps_interaction',
            label: method
        });
    }

    /**
     * Tracks quiz completion.
     * @param {number} score - Final quiz score.
     * @param {number} total - Total questions.
     */
    trackQuizComplete(score, total) {
        this.trackEvent('quiz_complete', {
            category: 'quiz_interaction',
            label: `${score}/${total}`,
            value: Math.round((score / total) * 100)
        });
    }

    /**
     * Tracks a Google service usage event.
     * @param {string} serviceName - Name of the Google service.
     * @param {string} action - The action performed.
     */
    trackGoogleServiceUsage(serviceName, action) {
        this.trackEvent('google_service_used', {
            category: 'google_services',
            label: `${serviceName}: ${action}`
        });
    }

    /**
     * Tracks user login.
     * @param {string} method - Login method (e.g., 'google_one_tap').
     */
    trackLogin(method) {
        this.trackEvent('login', {
            method: method,
            category: 'authentication'
        });
    }

    /**
     * Tracks performance metrics.
     * @param {string} metric - Metric name.
     * @param {number} value - Metric value in ms.
     */
    trackPerformance(metric, value) {
        this.trackEvent('performance', {
            category: 'performance',
            label: metric,
            value: Math.round(value)
        });
    }
}

export const analytics = new Analytics();
export default analytics;
