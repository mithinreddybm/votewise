# VoteWise 🗳️

VoteWise is an AI-powered interactive assistant designed to help Indian citizens navigate the complex election process. It provides a visual timeline of the election phases, an AI chatbot for instant answers, a polling booth locator, and a civic awareness quiz.

**Vertical:** Civic Education / Election Awareness

## ✨ Features

- **Election Timeline:** A visual, 8-phase journey of the Indian General Election process with legal references and detailed explanations.
- **AI Assistant (Gemini):** A conversational agent powered by Google Gemini 1.5 Flash, specialized in ECI rules, MCC, and voting procedures.
- **Booth Finder:** Integration with Google Maps to help users locate their nearby polling stations via address or pincode.
- **Civic Quiz:** A challenging 8-question MCQ test to evaluate and improve your knowledge of Indian democracy.
- **Multilingual Support:** Integrated Google Translate widget supporting Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, and Punjabi.

## 🛠️ Google Services Used

- **Google Gemini API (1.5 Flash):** Used to power the intelligent chatbot that answers user queries in real-time.
- **Google Maps JavaScript API:** Used for the interactive polling booth locator and geocoding services.
- **Google Fonts:** Utilizing 'DM Serif Display' and 'DM Sans' for a premium, accessible typography experience.
- **Google Translate:** Providing instant localization for diverse Indian linguistic groups.

## 🚀 Setup Instructions

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/votewise.git
    cd votewise
    ```

2.  **Configure API Keys:**
    - Copy the `.env.example` file and rename it to `.env`.
    - **IMPORTANT:** Never commit your `.env` file to version control.
    - Open `.env` and fill in your keys:
      ```
      GEMINI_API_KEY=your_actual_key_here
      MAPS_API_KEY=your_actual_key_here
      ```

3.  **Get Your API Keys:**
    - **Gemini Key:** Obtain from [Google AI Studio](https://aistudio.google.com/).
    - **Maps Key:** Obtain from the [Google Cloud Console](https://console.cloud.google.com/). Ensure the "Maps JavaScript API" and "Geocoding API" are enabled.

4.  **Run the App:**
    - Simply open `index.html` in any modern web browser.
    - Note: To fetch the `.env` file, some browsers may require you to run a local server (e.g., `python -m http.server` or VS Code Live Server) due to CORS policies on `file://` protocols.

## ⚠️ Important Security Note

**NEVER commit your `.env` file.** It contains sensitive API keys that should be kept private. The `.gitignore` file included in this project is already configured to exclude `.env`.

## 📝 Assumptions

- Users have a modern web browser with JavaScript enabled.
- The app assumes a 7-phase/8-step general election structure as typical in India.
- For the Booth Finder, mock data is used to demonstrate markers around the searched geocoordinates, as official real-time booth-to-voter mapping requires private voter ID data.

## ⚖️ License

This project is licensed under the MIT License.
"# votewise" 
