let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];

async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        questions = data.questions;
        initializeQuiz();
    } catch (error) {
        console.error('Error loading questions:', error);
        alert('Failed to load questions. Please refresh the page.');
    }
}

function initializeQuiz() {
    currentQuestionIndex = 0;
    userAnswers = [];
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('results-container').style.display = 'none';
    displayQuestion();
}

function displayQuestion() {
    if (currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        
        document.getElementById('question-number').textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
        document.getElementById('question-text').textContent = question.question;
        document.getElementById('answer-input').value = '';
        document.getElementById('answer-input').focus();
        
        updateProgressBar();
        
        const isLastQuestion = currentQuestionIndex === questions.length - 1;
        document.getElementById('next-btn').style.display = isLastQuestion ? 'none' : 'inline-block';
        document.getElementById('submit-btn').style.display = isLastQuestion ? 'inline-block' : 'none';
    }
}

function updateProgressBar() {
    const progress = ((currentQuestionIndex) / questions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
}

function nextQuestion() {
    const answer = document.getElementById('answer-input').value.trim();
    
    if (answer === '') {
        alert('Please enter an answer before proceeding.');
        return;
    }
    
    userAnswers.push(answer);
    currentQuestionIndex++;
    displayQuestion();
}

function submitQuiz() {
    const answer = document.getElementById('answer-input').value.trim();
    
    if (answer === '') {
        alert('Please enter an answer before submitting.');
        return;
    }
    
    userAnswers.push(answer);
    gradeQuiz();
}

function gradeQuiz() {
    let correctCount = 0;
    const resultsHTML = [];
    
    questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer.toLowerCase() === question.answer.toLowerCase();
        
        if (isCorrect) correctCount++;
        
        const resultItem = `
            <div class="result-item ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="result-status ${isCorrect ? 'correct' : 'incorrect'}">
                    ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </div>
                <div class="result-question">Q${index + 1}: ${question.question}</div>
                <div class="result-answer">
                    Your answer: ${userAnswer}
                    ${!isCorrect ? `<br><span class="correct-answer">Correct answer: ${question.answer}</span>` : ''}
                </div>
            </div>
        `;
        resultsHTML.push(resultItem);
    });
    
    const percentage = Math.round((correctCount / questions.length) * 100);
    
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('results-container').style.display = 'block';
    document.getElementById('score-display').innerHTML = `
        You got ${correctCount} out of ${questions.length} correct (${percentage}%)
    `;
    document.getElementById('results-list').innerHTML = resultsHTML.join('');
    
    document.getElementById('progress-fill').style.width = '100%';
}

function restartQuiz() {
    initializeQuiz();
}

document.getElementById('answer-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const isLastQuestion = currentQuestionIndex === questions.length - 1;
        if (isLastQuestion) {
            submitQuiz();
        } else {
            nextQuestion();
        }
    }
});

window.addEventListener('DOMContentLoaded', loadQuestions);