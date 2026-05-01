/**
 * Election Stats component for VoteWise.
 * Displays key metrics and historical data for Indian General Elections.
 */
class ElectionStats {
    constructor() {
        this.statsContainer = document.getElementById('election-stats-grid');
        this.partiesContainer = document.getElementById('parties-grid');
        this.timelineContainer = document.getElementById('history-timeline');

        this.metrics = [
            { label: "Total Lok Sabha Seats", value: "543", icon: "fa-chair", color: "var(--color-navy)" },
            { label: "Total Candidates (2024)", value: "8,360", icon: "fa-users", color: "var(--color-saffron)" },
            { label: "Total Eligible Voters", value: "968M", icon: "fa-id-card", color: "var(--color-green)" },
            { label: "Voter Turnout (2024)", value: "66.14%", icon: "fa-vote-yea", color: "var(--color-navy)" }
        ];

        this.parties = [
            { name: "BJP", alliance: "NDA", seats: 240, symbol: "Lotus", color: "#FF9933" },
            { name: "INC", alliance: "INDIA", seats: 99, symbol: "Hand", color: "#0000FF" },
            { name: "SP", alliance: "INDIA", seats: 37, symbol: "Bicycle", color: "#FF0000" },
            { name: "AITC", alliance: "INDIA", seats: 29, symbol: "Flowers", color: "#2E8B57" },
            { name: "DMK", alliance: "INDIA", seats: 22, symbol: "Rising Sun", color: "#FF4500" },
            { name: "TDP", alliance: "NDA", seats: 16, symbol: "Bicycle", color: "#FFFF00" },
            { name: "JD(U)", alliance: "NDA", seats: 12, symbol: "Arrow", color: "#008000" }
        ];

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
        this.renderMetrics();
        this.renderParties();
        this.renderHistory();
    }

    /**
     * Renders key election metrics.
     */
    renderMetrics() {
        if (!this.statsContainer) return;
        this.statsContainer.innerHTML = this.metrics.map(m => `
            <div class="stat-card">
                <i class="fas ${m.icon}" style="color: ${m.color}; font-size: 2rem; margin-bottom: 15px;"></i>
                <div class="stat-value">${m.value}</div>
                <div class="stat-label">${m.label}</div>
            </div>
        `).join('');
    }

    /**
     * Renders party details.
     */
    renderParties() {
        if (!this.partiesContainer) return;
        this.partiesContainer.innerHTML = this.parties.map(p => `
            <div class="party-card" style="border-left: 5px solid ${p.color}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong>${p.name}</strong>
                    <span class="badge ${p.alliance === 'NDA' ? 'badge-saffron' : 'badge-navy'}">${p.alliance}</span>
                </div>
                <div style="font-size: 0.9rem; margin-top: 10px;">
                    Seats: <span style="font-weight: 700;">${p.seats}</span>
                </div>
                <div style="font-size: 0.8rem; color: #666;">Symbol: ${p.symbol}</div>
            </div>
        `).join('');
    }

    /**
     * Renders election history.
     */
    renderHistory() {
        if (!this.timelineContainer) return;
        this.timelineContainer.innerHTML = this.history.map(h => `
            <div class="history-item">
                <div class="history-year">${h.year}</div>
                <div class="history-details">
                    <strong>${h.term}</strong><br>
                    <small>Result: ${h.winner} | PM: ${h.pm}</small>
                </div>
            </div>
        `).join('');
    }
}

export const electionStats = new ElectionStats();
export default electionStats;
