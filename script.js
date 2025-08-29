let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let selectedChoice = null;

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
    selectedChoice = null;
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('results-container').style.display = 'none';
    displayQuestion();
}

function displayQuestion() {
    if (currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        selectedChoice = null;
        
        document.getElementById('question-number').textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
        document.getElementById('question-text').textContent = question.question;
        
        const answerInput = document.getElementById('answer-input');
        const multipleChoiceContainer = document.getElementById('multiple-choice-container');
        const graphCanvas = document.getElementById('graph-canvas');
        
        answerInput.style.display = 'none';
        multipleChoiceContainer.style.display = 'none';
        graphCanvas.style.display = 'none';
        
        if (question.graph) {
            graphCanvas.style.display = 'block';
            drawGraph(question.graph);
        }
        
        if (question.type === 'multiple-choice') {
            multipleChoiceContainer.style.display = 'block';
            displayMultipleChoice(question);
        } else {
            answerInput.style.display = 'block';
            answerInput.value = '';
            answerInput.focus();
        }
        
        updateProgressBar();
        
        const isLastQuestion = currentQuestionIndex === questions.length - 1;
        document.getElementById('next-btn').style.display = isLastQuestion ? 'none' : 'inline-block';
        document.getElementById('submit-btn').style.display = isLastQuestion ? 'inline-block' : 'none';
    }
}

function displayMultipleChoice(question) {
    const container = document.getElementById('multiple-choice-container');
    container.innerHTML = '';
    
    question.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'choice-button';
        button.innerHTML = `<span class="choice-label">${question.choiceLabels[index]}.</span>${choice}`;
        button.onclick = () => selectChoice(choice, button);
        container.appendChild(button);
    });
}

function selectChoice(choice, button) {
    const buttons = document.querySelectorAll('.choice-button');
    buttons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    selectedChoice = choice;
}

function drawGraph(graphData) {
    const canvas = document.getElementById('graph-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 400;
    canvas.height = 400;
    
    const padding = 40;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;
    
    const xMin = graphData.xRange[0];
    const xMax = graphData.xRange[1];
    const yMin = graphData.yRange[0];
    const yMax = graphData.yRange[1];
    
    function transformX(x) {
        return padding + ((x - xMin) / (xMax - xMin)) * width;
    }
    
    function transformY(y) {
        return canvas.height - padding - ((y - yMin) / (yMax - yMin)) * height;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (graphData.gridLines) {
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 0.5;
        
        for (let x = Math.ceil(xMin); x <= xMax; x++) {
            ctx.beginPath();
            ctx.moveTo(transformX(x), padding);
            ctx.lineTo(transformX(x), canvas.height - padding);
            ctx.stroke();
        }
        
        for (let y = Math.ceil(yMin); y <= yMax; y++) {
            ctx.beginPath();
            ctx.moveTo(padding, transformY(y));
            ctx.lineTo(canvas.width - padding, transformY(y));
            ctx.stroke();
        }
    }
    
    if (graphData.showAxes) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(transformX(0), padding);
        ctx.lineTo(transformX(0), canvas.height - padding);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(padding, transformY(0));
        ctx.lineTo(canvas.width - padding, transformY(0));
        ctx.stroke();
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        
        for (let x = Math.ceil(xMin); x <= xMax; x++) {
            if (x !== 0) {
                ctx.fillText(x, transformX(x) - 5, transformY(0) + 20);
            }
        }
        
        for (let y = Math.ceil(yMin); y <= yMax; y++) {
            if (y !== 0) {
                ctx.fillText(y, transformX(0) - 20, transformY(y) + 5);
            }
        }
    }
    
    if (graphData.type === 'line' && graphData.points.length > 0) {
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const extendedPoints = [];
        if (graphData.points.length >= 2) {
            const [x1, y1] = graphData.points[0];
            const [x2, y2] = graphData.points[1];
            const slope = (y2 - y1) / (x2 - x1);
            const intercept = y1 - slope * x1;
            
            const leftX = xMin;
            const rightX = xMax;
            const leftY = slope * leftX + intercept;
            const rightY = slope * rightX + intercept;
            
            extendedPoints.push([leftX, leftY]);
            extendedPoints.push([rightX, rightY]);
        }
        
        extendedPoints.forEach(([x, y], index) => {
            const screenX = transformX(x);
            const screenY = transformY(y);
            
            if (index === 0) {
                ctx.moveTo(screenX, screenY);
            } else {
                ctx.lineTo(screenX, screenY);
            }
        });
        
        ctx.stroke();
        
        ctx.fillStyle = '#764ba2';
        graphData.points.forEach(([x, y]) => {
            const screenX = transformX(x);
            const screenY = transformY(y);
            
            ctx.beginPath();
            ctx.arc(screenX, screenY, 5, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
}

function updateProgressBar() {
    const progress = ((currentQuestionIndex) / questions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
}

function nextQuestion() {
    const question = questions[currentQuestionIndex];
    let answer = '';
    
    if (question.type === 'multiple-choice') {
        if (!selectedChoice) {
            alert('Please select an answer before proceeding.');
            return;
        }
        answer = selectedChoice;
    } else {
        answer = document.getElementById('answer-input').value.trim();
        if (answer === '') {
            alert('Please enter an answer before proceeding.');
            return;
        }
    }
    
    userAnswers.push(answer);
    currentQuestionIndex++;
    displayQuestion();
}

function submitQuiz() {
    const question = questions[currentQuestionIndex];
    let answer = '';
    
    if (question.type === 'multiple-choice') {
        if (!selectedChoice) {
            alert('Please select an answer before submitting.');
            return;
        }
        answer = selectedChoice;
    } else {
        answer = document.getElementById('answer-input').value.trim();
        if (answer === '') {
            alert('Please enter an answer before submitting.');
            return;
        }
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