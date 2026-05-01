import config from './config.js';

/**
 * Polling Booth Finder component for VoteWise.
 * Integrates Google Maps API.
 */
class Maps {
    constructor() {
        this.map = null;
        this.geocoder = null;
        this.searchBtn = document.getElementById('search-btn');
        this.searchInput = document.getElementById('booth-search');
        this.mapContainer = document.getElementById('map-container');
        this.isInitialized = false;
    }

    /**
     * Initializes the Maps API and UI.
     */
    async init() {
        const apiKey = config.get('MAPS_API_KEY');
        if (!apiKey || apiKey.includes('your_')) {
            this.mapContainer.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 40px; background: #f0f0f0; text-align: center; border-radius: 16px;">
                    <i class="fas fa-map-marked-alt" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                    <h3>Google Maps Key Missing</h3>
                    <p>Please provide a MAPS_API_KEY in your .env file to use the booth finder.</p>
                </div>
            `;
            return;
        }

        this.loadGoogleMapsScript(apiKey);
        
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => this.searchAddress());
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchAddress();
            });
        }
    }

    /**
     * Dynamically loads the Google Maps Script.
     * @param {string} apiKey - Google Maps API Key.
     */
    loadGoogleMapsScript(apiKey) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMapInstance`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        window.initMapInstance = () => this.onMapsReady();
    }

    /**
     * Callback when Maps API is ready.
     */
    onMapsReady() {
        this.geocoder = new google.maps.Geocoder();
        const defaultLocation = { lat: 20.5937, lng: 78.9629 }; // Center of India
        
        this.map = new google.maps.Map(this.mapContainer, {
            center: defaultLocation,
            zoom: 5,
            styles: [
                {
                    "featureType": "poi.business",
                    "stylers": [{ "visibility": "off" }]
                }
            ]
        });
        
        this.isInitialized = true;
    }

    /**
     * Geocodes the address and centers the map.
     */
    searchAddress() {
        if (!this.isInitialized || !this.geocoder) return;

        const address = this.searchInput.value.trim();
        if (!address) return;

        this.geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK') {
                const location = results[0].geometry.location;
                this.map.setCenter(location);
                this.map.setZoom(15);

                new google.maps.Marker({
                    map: this.map,
                    position: location,
                    title: "Your Location",
                    animation: google.maps.Animation.DROP
                });

                // Add dummy polling booth markers nearby
                this.addMockBooths(location);
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    /**
     * Adds mock polling booth locations near the searched point.
     * @param {google.maps.LatLng} location - The searched location.
     */
    addMockBooths(location) {
        // Generating some random nearby points for demonstration
        for (let i = 0; i < 3; i++) {
            const latOffset = (Math.random() - 0.5) * 0.01;
            const lngOffset = (Math.random() - 0.5) * 0.01;
            
            const boothPos = {
                lat: location.lat() + latOffset,
                lng: location.lng() + lngOffset
            };

            const marker = new google.maps.Marker({
                position: boothPos,
                map: this.map,
                icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                title: `Polling Booth #${i + 1}`
            });

            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div style="padding: 10px;">
                        <h4 style="margin-bottom: 5px; color: var(--color-navy);">Polling Station #${i + 1}</h4>
                        <p style="font-size: 0.9rem;">Government Primary School, Room ${i + 2}</p>
                        <p style="font-size: 0.8rem; color: #666;">Dist: 1.2km</p>
                    </div>
                `
            });

            marker.addListener('click', () => {
                infoWindow.open(this.map, marker);
            });
        }
    }
}

export const maps = new Maps();
export default maps;
