import config from './config.js';

/**
 * Gemini AI Assistant for VoteWise (Advanced 2.0 Version).
 * Features: Deep Reasoning (Thinking) & Google Search Grounding.
 */
class Gemini {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendBtn = document.getElementById('send-btn');
        this.quickBtns = document.querySelectorAll('.quick-btn');
        
        this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        this.history = this.loadHistory();
        this.systemPrompt = `You are a VoteWise AI Assistant, an expert in Indian elections. 
        Your goal is to help citizens understand the voting process, ECI rules, EVM/VVPAT, voter registration, Model Code of Conduct, and Lok Sabha/Vidhan Sabha processes.
        Use your Google Search tool to verify real-time facts about current candidate lists, polling dates, and results.
        Provide accurate information based on the Constitution of India and Representation of the People Act.
        Keep your tone helpful, patriotic, and non-partisan.
        If you are asked about political party preferences or who to vote for, politely decline and state that you are here to provide neutral process information only.
        Always suggest visiting voters.eci.gov.in for official registration and data.`;
    }

    /**
     * Initializes the chat assistant.
     */
    init() {
        if (!this.sendBtn) return;

        this.sendBtn.addEventListener('click', () => this.handleUserMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserMessage();
        });

        this.quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.dataset.query;
                this.chatInput.value = query;
                this.handleUserMessage();
            });
        });

        // Render history if exists
        if (this.history.length > 0) {
            this.renderHistory();
        }
    }

    /**
     * Loads chat history from localStorage.
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('votewise_chat_history');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to load history:', e);
            return [];
        }
    }

    /**
     * Saves chat history to localStorage.
     */
    saveHistory() {
        try {
            localStorage.setItem('votewise_chat_history', JSON.stringify(this.history));
        } catch (e) {
            console.error('Failed to save history:', e);
        }
    }

    /**
     * Renders saved history to the UI.
     */
    renderHistory() {
        this.history.forEach(msg => {
            this.addMessage(msg.text, msg.sender, msg.thought);
        });
    }

    /**
     * Handles processing the user's message.
     */
    async handleUserMessage() {
        const text = this.chatInput.value.trim();
        if (!text) return;

        this.chatInput.value = '';
        this.addMessage(text, 'user');
        
        // Update history
        this.history.push({ text, sender: 'user', timestamp: Date.now() });
        this.saveHistory();

        const typingId = this.showTyping();

        try {
            const responseData = await this.callGemini(text);
            this.removeTyping(typingId);
            
            this.addMessage(responseData.text, 'ai', responseData.thought);
            
            // Update history
            this.history.push({ 
                text: responseData.text, 
                sender: 'ai', 
                thought: responseData.thought,
                timestamp: Date.now() 
            });
            this.saveHistory();

        } catch (error) {
            console.error('Gemini error:', error);
            this.removeTyping(typingId);
            
            const apiKey = config.get('GEMINI_API_KEY');
            if (!apiKey || apiKey.includes('your_')) {
                this.addMessage('API Key missing. Please configure your .env file to use the AI Assistant.', 'ai');
            } else {
                this.addMessage('I am having trouble connecting right now. Please try again later.', 'ai');
            }
        }
    }

    /**
     * Calls the Gemini API with support for both AI Studio and Vertex AI.
     * @param {string} prompt - User's prompt.
     * @returns {Promise<Object>} AI response text and thought.
     */
    async callGemini(prompt) {
        const apiKey = config.get('GEMINI_API_KEY');
        const projectId = config.get('GCP_PROJECT_ID');
        const region = config.get('GCP_REGION') || 'us-central1';
        
        if (!apiKey) throw new Error('No API key');

        const isVertex = apiKey.startsWith('AQ.');
        let url = "";
        let headers = { 'Content-Type': 'application/json' };

        if (isVertex) {
            url = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/gemini-2.0-flash:streamGenerateContent`;
            headers['Authorization'] = `Bearer ${apiKey}`;
        } else {
            url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        }

        const payload = {
            contents: [{
                role: 'user',
                parts: [{ text: this.systemPrompt + "\n\nUser Question: " + prompt }]
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

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || (Array.isArray(err) ? err[0].error.message : 'API Call Failed'));
        }

        const data = await response.json();
        const candidates = isVertex ? data[0].candidates : data.candidates;
        const parts = candidates[0].content.parts;
        
        let aiText = "";
        let thoughtProcess = "";

        parts.forEach(part => {
            if (part.thought) thoughtProcess += part.thought;
            if (part.text) aiText += part.text;
        });

        return {
            text: aiText || "I processed your request but couldn't generate a text response.",
            thought: thoughtProcess
        };
    }

    /**
     * Adds a message to the chat UI.
     * @param {string} text - Message text.
     * @param {string} sender - 'user' or 'ai'.
     * @param {string} [thought] - Optional reasoning path.
     */
    addMessage(text, sender, thought = '') {
        const msgWrapper = document.createElement('div');
        msgWrapper.className = `message-wrapper ${sender}`;

        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        
        // Basic markdown formatting
        const formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
            
        msgDiv.innerHTML = formattedText;

        // Add Thought/Reasoning Path for AI messages
        if (sender === 'ai' && thought) {
            const thoughtDetails = document.createElement('details');
            thoughtDetails.className = 'thought-process';
            thoughtDetails.innerHTML = `
                <summary><i class="fas fa-brain"></i> View AI Reasoning</summary>
                <div class="thought-content">${thought.replace(/\n/g, '<br>')}</div>
            `;
            msgDiv.prepend(thoughtDetails);
        }

        msgWrapper.appendChild(msgDiv);
        this.chatMessages.appendChild(msgWrapper);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    /**
     * Shows the typing indicator.
     */
    showTyping() {
        const id = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = id;
        typingDiv.className = 'message ai typing';
        typingDiv.innerHTML = `
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <span style="font-size: 0.7rem; color: #999; margin-left: 10px;">Thinking & Searching...</span>
        `;
        this.chatMessages.appendChild(typingDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        return id;
    }

    /**
     * Removes the typing indicator.
     */
    removeTyping(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }
}


export const gemini = new Gemini();
export default gemini;
