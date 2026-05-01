/**
 * @fileoverview Election Stats component for VoteWise.
 * Displays key metrics and historical data for Indian General Elections.
 * @module stats
 */

'use strict';

/**
 * Election Stats class.
 */
class ElectionStats {
    constructor() {
        /** @type {Array<Object>} Key election metrics */
        this.metrics = [
            { label: "Total Lok Sabha Seats", value: "543", icon: "fa-chair", color: "var(--color-navy)" },
            { label: "Total Candidates (2024)", value: "8,360", icon: "fa-users", color: "var(--color-saffron)" },
            { label: "Total Eligible Voters", value: "968M", icon: "fa-id-card", color: "var(--color-green)" },
            { label: "Voter Turnout (2024)", value: "66.14%", icon: "fa-vote-yea", color: "var(--color-navy)" }
        ];

        /** @type {Array<Object>} Major party details */
        this.parties = [
            { name: "BJP", alliance: "NDA", seats: 240, symbol: "Lotus", color: "#FF9933" },
            { name: "INC", alliance: "INDIA", seats: 99, symbol: "Hand", color: "#0000FF" },
            { name: "SP", alliance: "INDIA", seats: 37, symbol: "Bicycle", color: "#FF0000" },
            { name: "AITC", alliance: "INDIA", seats: 29, symbol: "Flowers", color: "#2E8B57" },
            { name: "DMK", alliance: "INDIA", seats: 22, symbol: "Rising Sun", color: "#FF4500" },
            { name: "TDP", alliance: "NDA", seats: 16, symbol: "Bicycle", color: "#FFFF00" },
            { name: "JD(U)", alliance: "NDA", seats: 12, symbol: "Arrow", color: "#008000" }
        ];

        /** @type {Array<Object>} Historical election data */
        this.history = [
            { year: "2014", term: "16th Lok Sabha", winner: "NDA", pm: "Narendra Modi" },
            { year: "2019", term: "17th Lok Sabha", winner: "NDA", pm: "Narendra Modi" },
            { year: "2024", term: "18th Lok Sabha", winner: "NDA", pm: "Narendra Modi" },
            { year: "2029", term: "19th Lok Sabha", winner: "Future", pm: "TBD" }
        ];
    }

    /**
     * Initializes the stats sections.
     */
    init() {
        // Find containers when init is called, not in constructor
        this.statsContainer = document.getElementById('election-stats-grid');
        this.partiesContainer = document.getElementById('parties-grid');
        this.timelineContainer = document.getElementById('history-timeline');

        this._renderMetrics();
        this._renderParties();
        this._renderHistory();
    }

    /**
     * Renders key election metrics using safe DOM methods.
     * @private
     */
    _renderMetrics() {
        if (!this.statsContainer) return;
        this.statsContainer.innerHTML = '';
        
        this.metrics.forEach(m => {
            const card = document.createElement('div');
            card.className = 'stat-card';
            card.setAttribute('role', 'listitem');
            
            const icon = document.createElement('i');
            icon.className = `fas ${m.icon}`;
            icon.style.cssText = `color: ${m.color}; font-size: 2rem; margin-bottom: 15px;`;
            icon.setAttribute('aria-hidden', 'true');

            const val = document.createElement('div');
            val.className = 'stat-value';
            val.textContent = m.value;

            const label = document.createElement('div');
            label.className = 'stat-label';
            label.textContent = m.label;

            card.append(icon, val, label);
            this.statsContainer.appendChild(card);
        });
    }

    /**
     * Renders party details using safe DOM methods.
     * @private
     */
    _renderParties() {
        if (!this.partiesContainer) return;
        this.partiesContainer.innerHTML = '';

        this.parties.forEach(p => {
            const card = document.createElement('div');
            card.className = 'party-card';
            card.style.borderLeft = `5px solid ${p.color}`;
            card.setAttribute('role', 'listitem');

            const header = document.createElement('div');
            header.style.cssText = 'display: flex; justify-content: space-between; align-items: center;';
            
            const name = document.createElement('strong');
            name.textContent = p.name;
            
            const badge = document.createElement('span');
            badge.className = `badge ${p.alliance === 'NDA' ? 'badge-saffron' : 'badge-navy'}`;
            badge.textContent = p.alliance;
            
            header.append(name, badge);

            const seats = document.createElement('div');
            seats.style.cssText = 'font-size: 0.9rem; margin-top: 10px;';
            seats.innerHTML = `Seats: <span style="font-weight: 700;">${p.seats}</span>`;

            const symbol = document.createElement('div');
            symbol.style.cssText = 'font-size: 0.8rem; color: #666;';
            symbol.textContent = `Symbol: ${p.symbol}`;

            card.append(header, seats, symbol);
            this.partiesContainer.appendChild(card);
        });
    }

    /**
     * Renders election history using safe DOM methods.
     * @private
     */
    _renderHistory() {
        if (!this.timelineContainer) return;
        this.timelineContainer.innerHTML = '';

        this.history.forEach(h => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.setAttribute('role', 'listitem');

            const year = document.createElement('div');
            year.className = 'history-year';
            year.textContent = h.year;

            const details = document.createElement('div');
            details.className = 'history-details';
            
            const term = document.createElement('strong');
            term.textContent = h.term;
            
            const br = document.createElement('br');
            
            const summary = document.createElement('small');
            summary.textContent = `Result: ${h.winner} | PM: ${h.pm}`;

            details.append(term, br, summary);
            item.append(year, details);
            this.timelineContainer.appendChild(item);
        });
    }
}

export const electionStats = new ElectionStats();
export default electionStats;
