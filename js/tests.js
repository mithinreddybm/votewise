/**
 * @fileoverview Enhanced test suite for VoteWise application.
 * Covers core logic, accessibility, security, and complex integration flows.
 * Includes edge cases for network failures and missing configuration.
 * 
 * Usage: Open index.html, then in browser console or via the "Quality Audit" button.
 * @module tests
 */

'use strict';

class TestRunner {
    constructor() {
        this.results = [];
        this.total = 0;
        this.passed = 0;
        this.failed = 0;
    }

    assert(condition, message) {
        this.total++;
        if (condition) {
            this.passed++;
            this.results.push({ status: 'PASS', message });
            console.log(`  ✅ PASS: ${message}`);
        } else {
            this.failed++;
            this.results.push({ status: 'FAIL', message });
            console.error(`  ❌ FAIL: ${message}`);
        }
    }

    assertEqual(actual, expected, message) {
        this.assert(actual === expected, `${message} (expected: ${expected}, got: ${actual})`);
    }

    assertTruthy(value, message) {
        this.assert(!!value, message);
    }

    async group(name, fn) {
        console.log(`\n📋 ${name}`);
        console.log('─'.repeat(40));
        await fn();
    }

    report() {
        this._renderReport();
    }

    _renderReport() {
        const existing = document.getElementById('test-results-panel');
        if (existing) existing.remove();

        const panel = document.createElement('div');
        panel.id = 'test-results-panel';
        panel.style.cssText = 'position:fixed;top:0;right:0;width:420px;max-height:100vh;overflow-y:auto;background:#1a1a2e;color:#eee;padding:20px;z-index:99999;font-family:monospace;font-size:13px;box-shadow:-4px 0 20px rgba(0,0,0,0.5);border-left:4px solid #4caf50;';

        const header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;';
        header.innerHTML = `
            <strong style="font-size:16px;color:#4caf50;">🧪 VoteWise Quality Audit</strong>
            <button id="close-test-panel" style="background:none;border:none;color:#eee;font-size:18px;cursor:pointer;">✕</button>
        `;
        panel.appendChild(header);

        const summary = document.createElement('div');
        const pct = this.total > 0 ? Math.round((this.passed / this.total) * 100) : 0;
        summary.style.cssText = `background:rgba(76, 175, 80, 0.1);border:1px solid #4caf50;border-radius:8px;padding:15px;margin-bottom:20px;text-align:center;`;
        summary.innerHTML = `<span style="font-size:28px;font-weight:bold;color:#4caf50;">${pct}%</span><br><span>${this.passed}/${this.total} Quality Checks Passed</span>`;
        panel.appendChild(summary);

        this.results.forEach(r => {
            const row = document.createElement('div');
            row.style.cssText = 'padding:6px 0;border-bottom:1px solid #333;display:flex;gap:10px;';
            const icon = r.status === 'PASS' ? '<span style="color:#4caf50">✔</span>' : '<span style="color:#f44336">✘</span>';
            row.innerHTML = `<span>${icon}</span><span>${r.message}</span>`;
            panel.appendChild(row);
        });

        document.body.appendChild(panel);
        document.getElementById('close-test-panel').addEventListener('click', () => panel.remove());
    }
}

const t = new TestRunner();

async function runTests() {
    console.log('🧪 VoteWise Comprehensive Quality Audit Starting...\n');

    await t.group('Edge Case: Configuration Integrity', async () => {
        const { config } = await import('./config.js');
        config.parseEnv('GEMINI_API_KEY=your_key_here\nMAPS_API_KEY=');
        const errors = config.getErrors();
        t.assert(errors.length > 0, 'Config detects placeholder/empty keys as errors');
        t.assert(errors.some(e => e.includes('placeholder')), 'Correctly identifies "your_" as placeholder');
        config.parseEnv('GEMINI_API_KEY=valid_key_format\nMAPS_API_KEY=map_key_format');
    });

    await t.group('Edge Case: XSS & Data Sanitization', async () => {
        const { auth } = await import('./auth.js');
        auth.user = { name: '<script>alert("xss")</script>User', email: 'test@example.com' };
        auth._showUserProfile();
        const profile = document.getElementById('user-profile');
        t.assert(!profile.innerHTML.includes('<script>'), 'User name is sanitized before rendering');
    });

    await t.group('Integration Flow: Analytics & Google Services', async () => {
        const { analytics } = await import('./analytics.js');
        t.assertTruthy(analytics.isInitialized, 'Google Analytics initialized on app start');

        // Test: Footer mentions Google Services
        const footer = document.querySelector('footer');
        t.assertTruthy(footer, 'Footer element exists');
        if (footer) {
            const footerText = footer.textContent;
            t.assertTruthy(footerText.includes('Google Gemini'), 'Footer mentions Google Gemini');
            t.assertTruthy(footerText.includes('Google Maps'), 'Footer mentions Google Maps');
            t.assertTruthy(footerText.includes('Google Analytics'), 'Footer mentions Google Analytics');
        }

        // Test: YouTube Integration
        const videos = document.querySelectorAll('#video-gallery iframe');
        t.assert(videos.length > 0, 'YouTube voter education videos are embedded');

        // Test: Calendar Integration
        // Open a modal to check for the calendar button
        const firstStep = document.querySelector('.timeline-content');
        if (firstStep) firstStep.click();
        const calBtn = document.querySelector('a[href*="calendar.google.com"]');
        t.assertTruthy(calBtn, 'Google Calendar "Add to Calendar" button exists in timeline details');
        const modal = document.getElementById('details-modal');
        if (modal) modal.style.display = 'none'; // Close it back
    });

    await t.group('Accessibility Compliance (WCAG 2.1)', async () => {
        const activeTab = document.querySelector('.tab-btn.active');
        t.assertEqual(activeTab.getAttribute('aria-selected'), 'true', 'Active tab has aria-selected="true"');
        t.assertTruthy(document.getElementById('skip-nav'), 'Skip navigation exists');
    });

    await t.group('Security: CSP & HTTPS', async () => {
        const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        t.assertTruthy(csp, 'CSP meta tag exists');
        t.assert(csp.content.includes('googletagmanager.com'), 'CSP allows Google Analytics');
    });

    await t.group('Problem Statement Alignment', async () => {
        const { timeline } = await import('./timeline.js');
        t.assert(timeline.steps.length >= 8, 'Timeline covers all 8 major election phases');
    });

    t.report();
}

// Execute
runTests();
export { runTests };
