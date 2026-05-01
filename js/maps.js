/**
 * @fileoverview Polling Booth Finder component for VoteWise.
 * Integrates Google Maps JavaScript API with Geocoding and Geolocation.
 * Includes input validation and safe DOM construction.
 * @module maps
 */

'use strict';

import config from './config.js';
import analytics from './analytics.js';

/** @constant {Object} Default map center (geographic center of India) */
const DEFAULT_CENTER = Object.freeze({ lat: 20.5937, lng: 78.9629 });

/** @constant {number} Default zoom level for India overview */
const DEFAULT_ZOOM = 5;

/** @constant {number} Zoom level when showing booth results */
const SEARCH_ZOOM = 15;

/** @constant {number} Number of mock booths to display */
const MOCK_BOOTH_COUNT = 3;

/** @constant {string[]} Mock booth names for demonstration */
const BOOTH_NAMES = Object.freeze([
    'Government Primary School',
    'Community Health Center',
    'Municipal Ward Office',
    'Government High School',
    'Panchayat Bhawan'
]);

/**
 * Polling Booth Finder class.
 * Manages Google Maps, geocoding, and geolocation features.
 */
class Maps {
    /**
     * Creates a new Maps instance.
     */
    constructor() {
        /** @type {google.maps.Map|null} Google Map instance */
        this.map = null;
        /** @type {google.maps.Geocoder|null} Geocoder instance */
        this.geocoder = null;
        /** @type {HTMLButtonElement} Search button */
        this.searchBtn = document.getElementById('search-btn');
        /** @type {HTMLInputElement} Search input */
        this.searchInput = document.getElementById('booth-search');
        /** @type {HTMLElement} Map container */
        this.mapContainer = document.getElementById('map-container');
        /** @type {boolean} Whether the Maps API has loaded */
        this.isInitialized = false;
        /** @type {google.maps.Marker[]} Active markers for cleanup */
        this._markers = [];
    }

    /**
     * Initializes the Maps API and UI event listeners.
     * @returns {Promise<void>}
     */
    async init() {
        const apiKey = config.get('MAPS_API_KEY');
        if (!apiKey || apiKey.includes('your_')) {
            this._showFallback();
            return;
        }

        this._loadGoogleMapsScript(apiKey);
        this._setupEventListeners();
    }

    /**
     * Shows a fallback message when the Maps API key is missing.
     * @private
     */
    _showFallback() {
        if (!this.mapContainer) return;

        const fallback = document.createElement('div');
        fallback.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:40px;background:#f0f0f0;text-align:center;border-radius:16px;';
        fallback.setAttribute('role', 'alert');

        const icon = document.createElement('i');
        icon.className = 'fas fa-map-marked-alt';
        icon.style.cssText = 'font-size:3rem;color:#ccc;margin-bottom:20px;';
        icon.setAttribute('aria-hidden', 'true');

        const heading = document.createElement('h3');
        heading.textContent = 'Google Maps Key Missing';

        const desc = document.createElement('p');
        desc.textContent = 'Please provide a MAPS_API_KEY in your .env file to use the booth finder.';

        fallback.append(icon, heading, desc);
        this.mapContainer.appendChild(fallback);
    }

    /**
     * Sets up UI event listeners for search and geolocation.
     * @private
     */
    _setupEventListeners() {
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => this._searchAddress());
            if (this.searchInput) {
                this.searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this._searchAddress();
                });
            }
        }

        // Add Locate Me button dynamically
        const searchBox = document.querySelector('.search-box');
        if (searchBox && !document.getElementById('locate-me-btn')) {
            const locateBtn = document.createElement('button');
            locateBtn.id = 'locate-me-btn';
            locateBtn.className = 'locate-btn';
            locateBtn.setAttribute('aria-label', 'Use my current location');
            locateBtn.title = 'Use My Location';

            const icon = document.createElement('i');
            icon.className = 'fas fa-location-crosshairs';
            icon.setAttribute('aria-hidden', 'true');
            locateBtn.appendChild(icon);

            locateBtn.addEventListener('click', () => this._useCurrentLocation());
            searchBox.appendChild(locateBtn);
        }
    }

    /**
     * Uses browser Geolocation API to find the user's position.
     * @private
     */
    _useCurrentLocation() {
        if (!navigator.geolocation) {
            this._showNotification('Geolocation is not supported by your browser.');
            return;
        }

        const locateBtn = document.getElementById('locate-me-btn');
        if (locateBtn) locateBtn.classList.add('loading');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                this.map.setCenter(pos);
                this.map.setZoom(SEARCH_ZOOM);

                this._clearMarkers();
                this._addMarker(pos, 'You are here', google.maps.Animation.BOUNCE);
                this._addMockBooths(new google.maps.LatLng(pos.lat, pos.lng));
                analytics.trackBoothSearch('geolocation');
                analytics.trackGoogleServiceUsage('Google Maps', 'geolocation_success');
                if (locateBtn) locateBtn.classList.remove('loading');
            },
            (error) => {
                console.error('Geolocation error:', error.message);
                analytics.trackEvent('geolocation_error', { message: error.message });
                this._showNotification('Could not get your location. Please check your browser permissions.');
                if (locateBtn) locateBtn.classList.remove('loading');
            }
        );
    }

    /**
     * Shows a non-intrusive notification message.
     * @param {string} message - Message text.
     * @private
     */
    _showNotification(message) {
        // Use a non-blocking notification instead of alert()
        const notification = document.createElement('div');
        notification.setAttribute('role', 'alert');
        notification.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#333;color:white;padding:12px 24px;border-radius:8px;z-index:9999;font-size:0.9rem;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
    }

    /**
     * Dynamically loads the Google Maps JavaScript API.
     * @param {string} apiKey - Google Maps API Key.
     * @private
     */
    _loadGoogleMapsScript(apiKey) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=initMapInstance`;
        script.async = true;
        script.defer = true;
        script.onerror = () => console.error('Maps: Failed to load Google Maps script.');
        document.head.appendChild(script);

        window.initMapInstance = () => this._onMapsReady();
    }

    /**
     * Callback when Google Maps API is ready.
     * Initializes the map and geocoder.
     * @private
     */
    _onMapsReady() {
        this.geocoder = new google.maps.Geocoder();

        this.map = new google.maps.Map(this.mapContainer, {
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            mapId: 'VOTEWISE_MAP_ID',
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            styles: [
                {
                    featureType: 'poi.business',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        });

        this.isInitialized = true;
    }

    /**
     * Geocodes the entered address and centers the map on results.
     * @private
     */
    _searchAddress() {
        if (!this.isInitialized || !this.geocoder) return;

        const address = this.searchInput?.value?.trim();
        if (!address) return;

        // Basic input validation
        if (address.length > 200) {
            this._showNotification('Please enter a shorter address.');
            return;
        }

        this.geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                const location = results[0].geometry.location;
                this.map.setCenter(location);
                this.map.setZoom(SEARCH_ZOOM);

                this._clearMarkers();
                this._addMarker(
                    { lat: location.lat(), lng: location.lng() },
                    'Your Location',
                    google.maps.Animation.DROP
                );
                this._addMockBooths(location);
                analytics.trackBoothSearch('address');
                analytics.trackGoogleServiceUsage('Google Maps', 'address_search_success');
            } else {
                analytics.trackEvent('maps_error', { status: status });
                this._showNotification('Could not find that address. Please try a different search.');
            }
        });
    }

    /**
     * Adds a marker to the map and tracks it for cleanup.
     * @param {Object} position - {lat, lng} position object.
     * @param {string} title - Marker title text.
     * @param {google.maps.Animation} [animation] - Optional marker animation.
     * @returns {google.maps.Marker} The created marker.
     * @private
     */
    _addMarker(position, title, animation) {
        const marker = new google.maps.Marker({
            position: position,
            map: this.map,
            title: title,
            animation: animation
        });
        this._markers.push(marker);
        return marker;
    }

    /**
     * Removes all markers from the map.
     * @private
     */
    _clearMarkers() {
        this._markers.forEach(marker => marker.setMap(null));
        this._markers = [];
    }

    /**
     * Adds mock polling booth locations near the searched point.
     * @param {google.maps.LatLng} location - The searched location.
     * @private
     */
    _addMockBooths(location) {
        for (let i = 0; i < MOCK_BOOTH_COUNT; i++) {
            const latOffset = (Math.random() - 0.5) * 0.01;
            const lngOffset = (Math.random() - 0.5) * 0.01;

            const boothPos = {
                lat: location.lat() + latOffset,
                lng: location.lng() + lngOffset
            };

            const boothName = BOOTH_NAMES[i % BOOTH_NAMES.length];
            const marker = this._addMarker(boothPos, `Polling Booth #${i + 1}`);
            marker.setIcon('https://maps.google.com/mapfiles/ms/icons/blue-dot.png');

            const contentDiv = document.createElement('div');
            contentDiv.style.padding = '10px';

            const title = document.createElement('h4');
            title.textContent = `Polling Station #${i + 1}`;
            title.style.cssText = 'margin-bottom:5px;color:#1a237e;';

            const name = document.createElement('p');
            name.textContent = `${boothName}, Room ${i + 2}`;
            name.style.fontSize = '0.9rem';

            const dist = document.createElement('p');
            dist.textContent = `Dist: ${(Math.random() * 2 + 0.5).toFixed(1)}km`;
            dist.style.cssText = 'font-size:0.8rem;color:#666;';

            contentDiv.append(title, name, dist);

            const infoWindow = new google.maps.InfoWindow({ content: contentDiv });
            marker.addListener('click', () => {
                infoWindow.open(this.map, marker);
            });
        }
    }
}

export const maps = new Maps();
export default maps;
