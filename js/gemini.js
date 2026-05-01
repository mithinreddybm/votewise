/**
 * @fileoverview Gemini AI Assistant for VoteWise.
 * Features: Deep Reasoning (Thinking), Google Search Grounding,
 * input sanitization, rate limiting, and chat history persistence.
 * @module gemini
 */

'use strict';

import config from './config.js';
import analytics from './analytics.js';

/** @constant {number} Minimum interval between API calls in ms */
const RATE_LIMIT_MS = 1000;

/** @constant {number} Maximum length of user input */
const MAX_INPUT_LENGTH = 500;

/** @constant {number} Maximum history entries to persist */
const MAX_HISTORY_SIZE = 50;

/** @constant {string} localStorage key for chat history */
const HISTORY_STORAGE_KEY = 'votewise_chat_history';

/**
 * Sanitizes a string by escaping HTML special characters to prevent XSS.
 * @param {string} str - The string to sanitize.
 * @returns {string} The sanitized string.
 */
function sanitizeHTML(str) {
    if (!str || typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Formats markdown-like text to safe HTML.
 * Only allows bold (**text**) and line breaks.
 * @param {string} text - Text with basic markdown.
 * @returns {string} Safely formatted HTML string.
 */
function formatMarkdown(text) {
    if (!text) return '';
    // First sanitize to prevent XSS
    let safe = sanitizeHTML(text);
    // Then apply safe formatting
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    safe = safe.replace(/\n/g, '<br>');
    return safe;
}

/**
 * Gemini AI Assistant class.
 * Manages chat interactions with Google Gemini API.
 */
class Gemini {
    /**
     * Creates a new Gemini assistant instance.
     */
    constructor() {
        /** @type {HTMLElement} Chat messages container */
        this.chatMessages = document.getElementById('chat-messages');
        /** @type {HTMLInputElement} Chat input field */
        this.chatInput = document.getElementById('chat-input');
        /** @type {HTMLButtonElement} Send button */
        this.sendBtn = document.getElementById('send-btn');
        /** @type {HTMLElement} Typing indicator dots */
        this.dots = document.getElementById('typing-dots');
        /** @type {HTMLElement} Speak button */
        this.speakBtn = document.getElementById('speak-btn');
        /** @type {NodeList} Quick reply buttons */
        this.quickBtns = document.querySelectorAll('.quick-btn');

        /** @type {string} Gemini API endpoint */
        this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        /** @type {Array<Object>} Chat history */
        this.history = this._loadHistory();
        /** @type {number} Last API call timestamp for rate limiting */
        this._lastCallTimestamp = 0;
        /** @type {boolean} Whether a request is currently in progress */
        this._isProcessing = false;

        /** @type {string} System prompt for the AI */
        this.systemPrompt = `You are a VoteWise AI Assistant, an expert in Indian elections. 
        Your goal is to help citizens understand the voting process, ECI rules, EVM/VVPAT, voter registration, Model Code of Conduct, and Lok Sabha/Vidhan Sabha processes.
        Use your Google Search tool to verify real-time facts about current candidate lists, polling dates, and results.
        Provide accurate information based on the Constitution of India and Representation of the People Act.
        Keep your tone helpful, patriotic, and non-partisan.
        If you are asked about political party preferences or who to vote for, politely decline and state that you are here to provide neutral process information only.
        Always suggest visiting voters.eci.gov.in for official registration and data.`;
    }

    /**
     * Initializes the chat assistant by binding event listeners.
     */
    init() {
        if (!this.sendBtn || !this.chatInput) return;

        if (this.sendBtn) this.sendBtn.addEventListener('click', () => this.handleUserMessage());
        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleUserMessage();
            });
        }
        if (this.speakBtn) {
            this.speakBtn.addEventListener('click', () => this._speakLastResponse());
        }

        this.quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.dataset.query;
                this.chatInput.value = query;
                this.handleUserMessage();
            });
        });

        // Render persisted history
        if (this.history.length > 0) {
            this._renderHistory();
        }
    }

    /**
     * Loads chat history from localStorage with error handling.
     * @returns {Array<Object>} Array of chat message objects.
     * @private
     */
    _loadHistory() {
        try {
            const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
            if (!saved) return [];
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed.slice(-MAX_HISTORY_SIZE) : [];
        } catch (e) {
            console.error('Failed to load chat history:', e.message);
            return [];
        }
    }

    /**
     * Saves chat history to localStorage with size limit.
     * @private
     */
    _saveHistory() {
        try {
            const trimmed = this.history.slice(-MAX_HISTORY_SIZE);
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
        } catch (e) {
            console.error('Failed to save chat history:', e.message);
        }
    }

    /**
     * Renders saved history messages to the chat UI.
     * @private
     */
    _renderHistory() {
        this.history.forEach(msg => {
            this._addMessage(msg.text, msg.sender, msg.thought);
        });
    }

    /**
     * Validates user input for length and content.
     * @param {string} text - User input text.
     * @returns {boolean} True if input is valid.
     * @private
     */
    _validateInput(text) {
        if (!text || typeof text !== 'string') return false;
        if (text.length > MAX_INPUT_LENGTH) {
            this._addMessage(`Please keep your question under ${MAX_INPUT_LENGTH} characters.`, 'ai');
            return false;
        }
        return true;
    }

    /**
     * Checks if enough time has passed since the last API call.
     * @returns {boolean} True if rate limit has not been exceeded.
     * @private
     */
    _checkRateLimit() {
        const now = Date.now();
        if (now - this._lastCallTimestamp < RATE_LIMIT_MS) {
            this._addMessage('Please wait a moment before sending another message.', 'ai');
            return false;
        }
        this._lastCallTimestamp = now;
        return true;
    }

    /**
     * Handles processing the user's message with validation and rate limiting.
     * @returns {Promise<void>}
     */
    async handleUserMessage() {
        const text = this.chatInput.value.trim();
        if (!text || this._isProcessing) return;

        if (!this._validateInput(text)) return;
        if (!this._checkRateLimit()) return;

        this._isProcessing = true;
        this.chatInput.value = '';
        this.sendBtn.disabled = true;

        this._addMessage(text, 'user');
        this.history.push({ text, sender: 'user', timestamp: Date.now() });
        this._saveHistory();

        const typingId = this._showTyping();

        try {
            const responseData = await this._callGemini(text);
            this._removeTyping(typingId);

            analytics.trackChatMessage(text, true);
            this._addMessage(responseData.text, 'ai', responseData.thought);

            this.history.push({
                text: responseData.text,
                sender: 'ai',
                thought: responseData.thought,
                timestamp: Date.now()
            });
            this._saveHistory();

        } catch (error) {
            console.error('Gemini API error:', error.message);
            analytics.trackChatMessage(text, false);
            analytics.trackEvent('ai_error', { message: error.message });
            this._removeTyping(typingId);

            const apiKey = config.get('GEMINI_API_KEY');
            if (!apiKey || apiKey.includes('your_')) {
                this._addMessage('API Key missing. Please configure your .env file to use the AI Assistant.', 'ai');
            } else {
                this._addMessage('I am having trouble connecting right now. Please try again later.', 'ai');
            }
        } finally {
            this._isProcessing = false;
            this.sendBtn.disabled = false;
            this.chatInput.focus();
        }
    }

    /**
     * Calls the Gemini API with support for both AI Studio and Vertex AI.
     * @param {string} prompt - User's prompt text.
     * @returns {Promise<{text: string, thought: string}>} AI response object.
     * @throws {Error} If API call fails.
     * @private
     */
    async _callGemini(prompt) {
        const apiKey = config.get('GEMINI_API_KEY');
        const projectId = config.get('GCP_PROJECT_ID');
        const region = config.get('GCP_REGION') || 'us-central1';

        if (!apiKey) throw new Error('No API key configured');

        const isVertex = apiKey.startsWith('AQ.');
        let url = '';
        const headers = { 'Content-Type': 'application/json' };

        if (isVertex) {
            if (!projectId) throw new Error('GCP_PROJECT_ID is required for Vertex AI');
            url = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/gemini-2.0-flash:streamGenerateContent`;
            headers['Authorization'] = `Bearer ${apiKey}`;
        } else {
            url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        }

        const payload = {
            contents: [{
                role: 'user',
                parts: [{ text: this.systemPrompt + '\n\nUser Question: ' + prompt }]
            }],
            tools: [{
                google_search: {}
            }],
            generationConfig: {
                temperature: 1,
                topP: 1,
                maxOutputTokens: 65535,
                thinkingConfig: {
                    includeThoughts: true
                }
            }
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'API Call Failed');
            }

            const data = await response.json();
            const candidates = isVertex ? data[0]?.candidates : data?.candidates;

            if (!candidates || !candidates[0]?.content?.parts) {
                throw new Error('Invalid API response format');
            }

            const parts = candidates[0].content.parts;
            let aiText = '';
            let thoughtProcess = '';

            parts.forEach(part => {
                if (part.thought) thoughtProcess += part.thought;
                if (part.text) aiText += part.text;
            });

            return {
                text: aiText || "I processed your request but couldn't generate a text response.",
                thought: thoughtProcess
            };
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please try again.');
            }
            throw error;
        }
    }

    /**
     * Adds a message to the chat UI using safe DOM methods.
     * @param {string} text - Message text content.
     * @param {string} sender - Message sender ('user' or 'ai').
     * @param {string} [thought=''] - Optional AI reasoning/thought process.
     * @private
     */
    _addMessage(text, sender, thought = '') {
        const msgWrapper = document.createElement('div');
        msgWrapper.className = `message-wrapper ${sender}`;
        msgWrapper.setAttribute('role', 'log');

        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.innerHTML = formatMarkdown(text);

        // Add Thought/Reasoning Path for AI messages
        if (sender === 'ai' && thought) {
            const thoughtDetails = document.createElement('details');
            thoughtDetails.className = 'thought-process';

            const summary = document.createElement('summary');
            summary.innerHTML = '<i class="fas fa-brain" aria-hidden="true"></i> View AI Reasoning';
            thoughtDetails.appendChild(summary);

            const content = document.createElement('div');
            content.className = 'thought-content';
            content.innerHTML = formatMarkdown(thought);
            thoughtDetails.appendChild(content);

            msgDiv.prepend(thoughtDetails);
        }

        msgWrapper.appendChild(msgDiv);
        this.chatMessages.appendChild(msgWrapper);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    /**
     * Shows the typing/loading indicator in the chat.
     * @returns {string} Unique ID of the typing indicator element.
     * @private
     */
    _showTyping() {
        const id = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = id;
        typingDiv.className = 'message ai typing';
        typingDiv.setAttribute('aria-label', 'AI is thinking');
        typingDiv.innerHTML = `
            <div class="dot" aria-hidden="true"></div>
            <div class="dot" aria-hidden="true"></div>
            <div class="dot" aria-hidden="true"></div>
            <span style="font-size: 0.7rem; color: #999; margin-left: 10px;">Thinking & Searching...</span>
        `;
        this.chatMessages.appendChild(typingDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        return id;
    }

    /**
     * Removes the typing indicator from the chat.
     * @param {string} id - ID of the typing indicator element.
     * @private
     */
    _removeTyping(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    /**
     * Clears all chat history from localStorage and UI.
     */
    clearHistory() {
        this.history = [];
        localStorage.removeItem(HISTORY_STORAGE_KEY);
        if (this.chatMessages) {
            this.chatMessages.innerHTML = '<div class="message ai">Namaste! I am your VoteWise AI assistant. How can I help you today?</div>';
        }
    }
    /**
     * Speaks the last AI response using Web Speech API (Google TTS).
     * @private
     */
    _speakLastResponse() {
        if (!('speechSynthesis' in window)) {
            console.warn('Speech synthesis not supported');
            return;
        }

        // Find last AI message
        const aiMessages = this.history.filter(m => m.sender === 'ai');
        if (aiMessages.length === 0) return;
        
        const lastMsg = aiMessages[aiMessages.length - 1].text;
        
        // Stop any current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(lastMsg);
        
        // Try to find a Google Indian English or Hindi voice
        const voices = window.speechSynthesis.getVoices();
        const googleVoice = voices.find(v => v.name.includes('Google') && (v.lang.includes('en-IN') || v.lang.includes('hi-IN')));
        if (googleVoice) utterance.voice = googleVoice;
        
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1.0;
        
        window.speechSynthesis.speak(utterance);
        analytics.trackGoogleServiceUsage('Web Speech API', 'text_to_speech');
    }
}

export const gemini = new Gemini();
export default gemini;
