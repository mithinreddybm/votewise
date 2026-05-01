/**
 * Civic Quiz engine for VoteWise.
 * Handles MCQ logic, scoring, and progress tracking.
 */
class Quiz {
    constructor() {
        this.container = document.getElementById('quiz-app');
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.questions = [
            {
                question: "What is the minimum age required to vote in Indian General Elections?",
                options: ["16 years", "18 years", "21 years", "25 years"],
                correct: 1,
                explanation: "The voting age was reduced from 21 to 18 years by the 61st Amendment Act of 1988."
            },
            {
                question: "Which article of the Indian Constitution provides for the Election Commission?",
                options: ["Article 320", "Article 324", "Article 356", "Article 370"],
                correct: 1,
                explanation: "Article 324 provides for the power of superintendence, direction, and control of elections to be vested in an Election Commission."
            },
            {
                question: "What does VVPAT stand for in the context of Indian elections?",
                options: ["Voter Verified Paper Audit Trail", "Voter Verified Password Audit Trail", "Voter Verification Process and Trail", "Visual Voter Paper Account Trail"],
                correct: 0,
                explanation: "VVPAT stands for Voter Verified Paper Audit Trail, which allows voters to verify that their vote was cast as intended."
            },
            {
                question: "Maximum how many candidates can an EVM (Electronic Voting Machine) support including NOTA?",
                options: ["16", "64", "384", "2000"],
                correct: 2,
                explanation: "A single M3 EVM can support up to 384 candidates (including NOTA) by connecting up to 24 Balloting Units."
            },
            {
                question: "When does the Model Code of Conduct (MCC) come into effect?",
                options: ["1 month before voting", "On the day of nomination", "Immediately upon announcement of schedule", "On polling day"],
                correct: 2,
                explanation: "The MCC comes into force immediately after the ECI announces the election schedule."
            },
            {
                question: "Who appoints the Chief Election Commissioner of India?",
                options: ["Prime Minister", "Chief Justice of India", "President of India", "Parliament"],
                correct: 2,
                explanation: "The Chief Election Commissioner and other Election Commissioners are appointed by the President of India."
            },
            {
                question: "What is the security deposit for a General Category candidate in Lok Sabha elections?",
                options: ["₹5,000", "₹10,000", "₹25,000", "₹50,000"],
                correct: 2,
                explanation: "A candidate in a Lok Sabha election has to deposit ₹25,000. For SC/ST candidates, it is ₹12,500."
            },
            {
                question: "Under which Act are election disputes handled in India?",
                options: ["Indian Penal Code", "Representation of the People Act, 1951", "Civil Procedure Code", "Election Dispute Act"],
                correct: 1,
                explanation: "The Representation of the People Act, 1951 provides the framework for the conduct of elections and resolution of disputes."
            }
        ];
    }

    /**
     * Initializes the quiz.
     */
    init() {
        this.renderQuestion();
    }

    /**
     * Renders the current question and progress.
     */
    renderQuestion() {
        if (!this.container) return;

        const question = this.questions[this.currentQuestionIndex];
        const progress = ((this.currentQuestionIndex) / this.questions.length) * 100;

        this.container.innerHTML = `
            <div class="progress-container">
                <div class="progress-bar" style="width: ${progress}%"></div>
            </div>
            <p class="mb-4">Question ${this.currentQuestionIndex + 1} of ${this.questions.length}</p>
            <div class="question-text">${question.question}</div>
            <div class="options-grid">
                ${question.options.map((option, index) => `
                    <button class="option-btn" data-index="${index}">${option}</button>
                `).join('')}
            </div>
            <div id="feedback" class="mt-4 hidden"></div>
            <button id="next-btn" class="search-btn mt-4 hidden" style="width: 100%">Next Question</button>
        `;

        this.setupListeners();
    }

    /**
     * Sets up click listeners for options.
     */
    setupListeners() {
        const btns = this.container.querySelectorAll('.option-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAnswer(parseInt(e.target.dataset.index)));
        });

        const nextBtn = this.container.querySelector('#next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }
    }

    /**
     * Handles the user's answer selection.
     * @param {number} selectedIndex - Index of the selected option.
     */
    handleAnswer(selectedIndex) {
        const question = this.questions[this.currentQuestionIndex];
        const btns = this.container.querySelectorAll('.option-btn');
        const feedback = this.container.querySelector('#feedback');
        const nextBtn = this.container.querySelector('#next-btn');

        // Disable all buttons
        btns.forEach(btn => btn.disabled = true);

        if (selectedIndex === question.correct) {
            this.score++;
            btns[selectedIndex].classList.add('correct');
            feedback.innerHTML = `<div style="color: var(--color-green); font-weight: 700;">Correct!</div><p>${question.explanation}</p>`;
        } else {
            btns[selectedIndex].classList.add('wrong');
            btns[question.correct].classList.add('correct');
            feedback.innerHTML = `<div style="color: #ff5252; font-weight: 700;">Incorrect</div><p>${question.explanation}</p>`;
        }

        feedback.classList.remove('hidden');
        nextBtn.classList.remove('hidden');
        
        if (this.currentQuestionIndex === this.questions.length - 1) {
            nextBtn.textContent = "See Final Results";
        }
    }

    /**
     * Moves to the next question or shows results.
     */
    nextQuestion() {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.questions.length) {
            this.renderQuestion();
        } else {
            this.showResults();
        }
    }

    /**
     * Renders the final score and results.
     */
    showResults() {
        const percentage = (this.score / this.questions.length) * 100;
        let message = "";
        
        if (percentage === 100) message = "Perfect! You're a Civic Master!";
        else if (percentage >= 70) message = "Great job! You have high civic awareness.";
        else if (percentage >= 50) message = "Good effort! Keep learning about our democracy.";
        else message = "Time to brush up on your election knowledge!";

        this.container.innerHTML = `
            <div class="text-center">
                <div style="font-size: 4rem; color: var(--color-navy); margin-bottom: 10px;">
                    <i class="fas fa-trophy"></i>
                </div>
                <h2>Quiz Completed!</h2>
                <div style="font-size: 2rem; font-weight: 700; margin: 20px 0; color: var(--color-saffron);">
                    ${this.score} / ${this.questions.length}
                </div>
                <p style="font-size: 1.2rem; margin-bottom: 30px;">${message}</p>
                <button id="restart-btn" class="search-btn">Try Again</button>
            </div>
        `;

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.currentQuestionIndex = 0;
            this.score = 0;
            this.renderQuestion();
        });
    }
}

export const quiz = new Quiz();
export default quiz;
