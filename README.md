# VoteWise 🗳️

VoteWise is an AI-powered interactive assistant designed to help Indian citizens navigate the complex election process. It provides a visual timeline of the election phases, an AI chatbot for instant answers, a polling booth locator, and a civic awareness quiz.

**Vertical:** Civic Education / Election Awareness

## ✨ Features

- **Election Timeline:** A visual, 8-phase journey of the Indian General Election process with legal references and detailed explanations.
- **AI Assistant (Gemini):** A conversational agent powered by Google Gemini 2.0 Flash with **Deep Reasoning (Thinking)** and **Google Search Grounding** for verified, real-time answers.
- **Booth Finder:** Integration with Google Maps with **Geolocation** to help users locate nearby polling stations via address, pincode, or GPS.
- **Civic Quiz:** A challenging 8-question MCQ test to evaluate and improve your knowledge of Indian democracy.
- **Multilingual Support:** Integrated Google Translate widget supporting Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, and Punjabi.
- **Google Sign-In:** Secure authentication via Google Identity Services (One Tap).

## 🛠️ Google Services Used (6 Services)

| # | Service | Usage |
|---|---------|-------|
| 1 | **Google Gemini API (2.0 Flash)** | AI chatbot with Thinking & Search Grounding |
| 2 | **Google Maps JavaScript API** | Interactive polling booth locator + Geocoding + Geolocation |
| 3 | **Google Identity Services** | Secure user authentication with One Tap sign-in |
| 4 | **Google Fonts** | Premium typography (DM Serif Display & DM Sans) |
| 5 | **Google Translate** | Real-time localization for 9 Indian languages |
| 6 | **Google Analytics (GA4)** | Advanced user behavior tracking and performance monitoring |

## 📊 Analytics & Monitoring

VoteWise utilizes **Google Analytics 4** to monitor user engagement and application performance. We track:
- AI assistant success rates and common voter queries.
- Polling booth search hotspots (Address vs. Geolocation).
- Quiz completion rates and civic awareness levels.
- Real-time performance metrics for application initialization.

## 🔐 Security Features

- **Content Security Policy (CSP):** Restricts script/style/image sources to trusted origins.
- **XSS Prevention:** All user inputs are sanitized before DOM insertion. No `innerHTML` with user data.
- **Input Validation:** Rate limiting, max length enforcement, and content validation on all inputs.
- **HTTPS-only URLs:** Profile picture URLs are validated to ensure HTTPS protocol.
- **Safe External Links:** All `target="_blank"` links include `rel="noopener noreferrer"`.

## ♿ Accessibility (WCAG 2.1 AA)

- **Skip Navigation:** Keyboard users can skip to main content.
- **ARIA Roles:** Full tablist/tab/tabpanel pattern with `aria-selected`, `aria-controls`, `aria-hidden`.
- **Keyboard Navigation:** Arrow key navigation between tabs, Escape to close modals.
- **Screen Reader Support:** `sr-only` labels, `aria-live` regions for chat, `role="log"` for messages.
- **Focus Management:** Visible focus indicators with `focus-visible` styling.

## 🧪 Testing

Run tests by loading `js/tests.js` as a module. Tests cover:
- **Config Module:** Parsing, validation, error handling.
- **Gemini Module:** History, rate limiting, system prompt integrity.
- **Auth Module:** Authentication state, logout flow.
- **Maps Module:** Initialization state, marker management.
- **Quiz Module:** Question structure, answer validation.
- **Timeline Module:** Step data integrity, legal references.
- **Stats Module:** Metrics, parties, and history data.
- **Accessibility:** ARIA attributes, skip nav, semantic HTML.
- **Security:** CSP, input validation, XSS protection.
- **Google Services:** Integration verification for all 5 services.

To run: Add `<script type="module" src="js/tests.js"></script>` to `index.html` or run `import('./js/tests.js')` in the browser console.

## 🚀 Setup Instructions

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/votewise.git
    cd votewise
    ```

2.  **Configure API Keys:**
    - Create a `.env` file in the project root.
    - **IMPORTANT:** Never commit your `.env` file to version control.
    - Add your keys:
      ```
      GEMINI_API_KEY=your_actual_key_here
      MAPS_API_KEY=your_actual_key_here
      GOOGLE_CLIENT_ID=your_client_id_here
      GCP_PROJECT_ID=your_project_id
      GCP_REGION=us-central1
      ```

3.  **Get Your API Keys:**
    - **Gemini Key:** Obtain from [Google AI Studio](https://aistudio.google.com/).
    - **Maps Key:** Obtain from [Google Cloud Console](https://console.cloud.google.com/). Enable "Maps JavaScript API" and "Geocoding API".
    - **Client ID:** Create OAuth 2.0 credentials in [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials).

4.  **Run the App:**
    - Start a local server: `python -m http.server 8000`
    - Open `http://localhost:8000` in your browser.

## 🐳 Deployment (Cloud Run)

```bash
gcloud run deploy votewise --source . --platform managed --region us-central1 --allow-unauthenticated --set-env-vars="GEMINI_API_KEY=...,MAPS_API_KEY=...,GOOGLE_CLIENT_ID=...,GCP_PROJECT_ID=...,GCP_REGION=us-central1"
```

## ⚠️ Important Security Note

**NEVER commit your `.env` file.** It contains sensitive API keys that should be kept private. The `.gitignore` file is configured to exclude `.env`.

## 📝 Assumptions

- Users have a modern web browser with JavaScript enabled.
- The app assumes a 7-phase/8-step general election structure as typical in India.
- For the Booth Finder, mock data is used to demonstrate markers around the searched geocoordinates, as official real-time booth-to-voter mapping requires private voter ID data.

## 📂 Project Structure

```
votewise/
├── index.html          # Main application HTML with CSP and ARIA
├── css/
│   └── style.css       # Design system with accessibility utilities
├── js/
│   ├── app.js          # Application orchestrator
│   ├── config.js       # Environment configuration manager
│   ├── gemini.js       # Google Gemini AI integration
│   ├── auth.js         # Google Identity Services authentication
│   ├── maps.js         # Google Maps booth finder
│   ├── quiz.js         # Civic awareness quiz engine
│   ├── stats.js        # Election statistics renderer
│   ├── timeline.js     # Election process timeline
│   └── tests.js        # Comprehensive test suite
├── Dockerfile          # Container configuration for Cloud Run
├── entrypoint.sh       # Container startup script
├── .env                # API keys (not committed)
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## ⚖️ License

This project is licensed under the MIT License.
