/**
 * Timeline component for VoteWise.
 * Manages the data and rendering of the election process timeline.
 */
class Timeline {
    constructor() {
        this.container = document.getElementById('timeline-container');
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
        this.render();
        this.setupListeners();
    }

    /**
     * Renders timeline items to the DOM.
     */
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = this.steps.map((step, index) => `
            <div class="timeline-item ${index % 2 === 0 ? 'left' : 'right'}">
                <div class="timeline-content" data-index="${index}">
                    <span class="badge ${step.badgeClass}">${step.badge}</span>
                    <h3>${step.title}</h3>
                    <p><strong>${step.day}</strong></p>
                    <p>${step.description}</p>
                    <small style="color: var(--color-navy); cursor: pointer;">Read more +</small>
                </div>
            </div>
        `).join('');
    }

    /**
     * Sets up click listeners for timeline items to show details.
     */
    setupListeners() {
        this.container.addEventListener('click', (e) => {
            const content = e.target.closest('.timeline-content');
            if (content) {
                const index = content.dataset.index;
                this.showDetails(this.steps[index]);
            }
        });
    }

    /**
     * Shows detailed modal for a timeline step.
     * @param {Object} step - The timeline step object.
     */
    showDetails(step) {
        const modal = document.getElementById('details-modal');
        const modalBody = document.getElementById('modal-body');
        
        modalBody.innerHTML = `
            <span class="badge ${step.badgeClass}">${step.badge}</span>
            <h2 style="margin: 15px 0;">${step.title}</h2>
            <p style="font-weight: 700; color: var(--color-navy); margin-bottom: 20px;">Timeline: ${step.day}</p>
            
            <div style="margin-bottom: 25px;">
                <h4 style="margin-bottom: 10px; color: var(--color-saffron);">Overview</h4>
                <p>${step.description}</p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h4 style="margin-bottom: 10px; color: var(--color-saffron);">Detailed Process</h4>
                <p>${step.details}</p>
            </div>
            
            <div style="padding: 15px; background: var(--color-gray-light); border-radius: 8px; border-left: 4px solid var(--color-navy);">
                <h4 style="margin-bottom: 5px; font-size: 0.9rem;">Legal Reference</h4>
                <p style="font-size: 0.85rem; font-style: italic;">${step.legal}</p>
            </div>
        `;
        
        modal.style.display = 'flex';
    }
}

export const timeline = new Timeline();
export default timeline;
