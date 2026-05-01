/**
 * @fileoverview Timeline component for VoteWise.
 * Manages the data and rendering of the election process timeline.
 * @module timeline
 */

'use strict';

/**
 * Timeline class.
 */
class Timeline {
    /**
     * Creates a new Timeline instance with election steps.
     */
    constructor() {
        /** @type {HTMLElement} Timeline container element */
        this.container = document.getElementById('timeline-container');
        /** @type {Array<Object>} Timeline steps dataset */
        this.steps = [
            {
                title: "Election Announcement + MCC",
                day: "Day 0",
                badge: "Activation",
                badgeClass: "badge-saffron",
                description: "The Election Commission of India (ECI) announces the election schedule. The Model Code of Conduct (MCC) comes into force immediately.",
                details: "The MCC ensures fair play and prevents the ruling party from using government resources for campaigning. It applies to candidates, political parties, and governments.",
                legal: "Article 324 of the Constitution, MCC Guidelines by ECI."
            },
            {
                title: "Voter Roll Revision",
                day: "Ongoing",
                badge: "Preparation",
                badgeClass: "badge-navy",
                description: "Continuous update of electoral rolls where citizens can register or update their details.",
                details: "Eligible citizens (18+) can apply for inclusion in the electoral roll via Form 6. This process continues until the last date of nominations.",
                legal: "Representation of the People Act, 1950."
            },
            {
                title: "Nomination Filing",
                day: "Day 1-7",
                badge: "Candidacy",
                badgeClass: "badge-green",
                description: "Candidates file their nomination papers and security deposits with the Returning Officer.",
                details: "Candidates must disclose their assets, liabilities, educational qualifications, and criminal antecedents in an affidavit (Form 26).",
                legal: "Section 33 of the Representation of the People Act, 1951."
            },
            {
                title: "Scrutiny and Withdrawal",
                day: "Day 7-14",
                badge: "Verification",
                badgeClass: "badge-navy",
                description: "Returning Officers scrutinize nominations and candidates can withdraw their names.",
                details: "Invalid nominations are rejected. Candidates have a window of two days after scrutiny to withdraw their candidacy if they choose.",
                legal: "Sections 36 and 37 of the RP Act, 1951."
            },
            {
                title: "Campaign Period",
                day: "Day 14-33",
                badge: "Publicity",
                badgeClass: "badge-saffron",
                description: "Active campaigning by political parties and candidates to reach out to voters.",
                details: "Parties release manifestos and hold rallies. ECI monitors campaign spending and adherence to MCC.",
                legal: "ECI Expenditure Monitoring Guidelines."
            },
            {
                title: "Campaign Silence",
                day: "Day 33-35",
                badge: "Quiet Period",
                badgeClass: "badge-navy",
                description: "All forms of public campaigning must stop 48 hours before the conclusion of polling.",
                details: "This period allows voters to reflect and decide without external influence or noise. Media coverage of rallies is also restricted.",
                legal: "Section 126 of the Representation of the People Act, 1951."
            },
            {
                title: "Polling Day (EVM + VVPAT)",
                day: "Day 35",
                badge: "Voting",
                badgeClass: "badge-green",
                description: "Citizens cast their votes at designated polling booths using EVMs and VVPATs.",
                details: "Electronic Voting Machines (EVM) are used for casting votes. Voter Verifiable Paper Audit Trail (VVPAT) prints a slip for 7 seconds to confirm the vote.",
                legal: "Conduct of Elections Rules, 1961."
            },
            {
                title: "Counting and Results",
                day: "Post-Polling",
                badge: "Declaration",
                badgeClass: "badge-navy",
                description: "Votes from all EVMs are counted under strict supervision, and results are declared.",
                details: "VVPAT slips from 5 randomly selected polling stations per assembly segment are also counted to verify EVM results.",
                legal: "Section 64 of the RP Act, 1951."
            }
        ];
    }

    /**
     * Initializes and renders the timeline.
     */
    init() {
        this._render();
        this._setupListeners();
    }

    /**
     * Renders timeline items to the DOM using safe methods.
     * @private
     */
    _render() {
        if (!this.container) return;
        this.container.innerHTML = '';
        
        this.steps.forEach((step, index) => {
            const item = document.createElement('div');
            item.className = `timeline-item ${index % 2 === 0 ? 'left' : 'right'}`;
            item.setAttribute('role', 'listitem');

            const content = document.createElement('div');
            content.className = 'timeline-content';
            content.dataset.index = index;
            content.setAttribute('tabindex', '0');
            content.setAttribute('aria-label', `Step ${index + 1}: ${step.title}`);

            const badge = document.createElement('span');
            badge.className = `badge ${step.badgeClass}`;
            badge.textContent = step.badge;

            const title = document.createElement('h3');
            title.textContent = step.title;

            const day = document.createElement('p');
            day.innerHTML = `<strong>${step.day}</strong>`;

            const desc = document.createElement('p');
            desc.textContent = step.description;

            const more = document.createElement('small');
            more.style.cssText = 'color: var(--color-navy); cursor: pointer; display: block; margin-top: 10px;';
            more.textContent = 'Read more +';

            content.append(badge, title, day, desc, more);
            item.appendChild(content);
            this.container.appendChild(item);
        });
    }

    /**
     * Sets up click listeners for timeline items to show details.
     * @private
     */
    _setupListeners() {
        this.container.addEventListener('click', (e) => {
            const content = e.target.closest('.timeline-content');
            if (content) {
                const index = content.dataset.index;
                this._showDetails(this.steps[index]);
            }
        });

        // Keyboard support for timeline items
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const content = e.target.closest('.timeline-content');
                if (content) {
                    e.preventDefault();
                    const index = content.dataset.index;
                    this._showDetails(this.steps[index]);
                }
            }
        });
    }

    /**
     * Shows detailed modal for a timeline step.
     * @param {Object} step - The timeline step object.
     * @private
     */
    _showDetails(step) {
        const modal = document.getElementById('details-modal');
        const modalBody = document.getElementById('modal-body');
        if (!modal || !modalBody) return;
        
        modalBody.innerHTML = ''; // Clear previous

        const badge = document.createElement('span');
        badge.className = `badge ${step.badgeClass}`;
        badge.textContent = step.badge;

        const title = document.createElement('h2');
        title.style.margin = '15px 0';
        title.textContent = step.title;

        const day = document.createElement('p');
        day.style.cssText = 'font-weight: 700; color: var(--color-navy); margin-bottom: 20px;';
        day.textContent = `Timeline: ${step.day}`;

        const overviewHeader = document.createElement('h4');
        overviewHeader.style.cssText = 'margin-bottom: 10px; color: var(--color-saffron);';
        overviewHeader.textContent = 'Overview';

        const desc = document.createElement('p');
        desc.style.marginBottom = '25px';
        desc.textContent = step.description;

        const processHeader = document.createElement('h4');
        processHeader.style.cssText = 'margin-bottom: 10px; color: var(--color-saffron);';
        processHeader.textContent = 'Detailed Process';

        const details = document.createElement('p');
        details.style.marginBottom = '25px';
        details.textContent = step.details;

        const legalBox = document.createElement('div');
        legalBox.style.cssText = 'padding: 15px; background: var(--color-gray-light); border-radius: 8px; border-left: 4px solid var(--color-navy);';
        
        const legalHeader = document.createElement('h4');
        legalHeader.style.cssText = 'margin-bottom: 5px; font-size: 0.9rem;';
        legalHeader.textContent = 'Legal Reference';

        const legalText = document.createElement('p');
        legalText.style.cssText = 'font-size: 0.85rem; font-style: italic;';
        legalText.textContent = step.legal;

        legalBox.append(legalHeader, legalText);
        modalBody.append(badge, title, day, overviewHeader, desc, processHeader, details, legalBox);
        
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus management: move focus to close button
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) closeBtn.focus();
    }
}

export const timeline = new Timeline();
export default timeline;
