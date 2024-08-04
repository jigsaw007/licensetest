document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('quiz-form');
    const submitButton = document.getElementById('submit-button');
    const resultDiv = document.getElementById('result');
    const reviewDiv = document.createElement('div');
    const shuffleButton = document.getElementById('shuffle-button');
    const goToTopButton = document.getElementById('go-to-top');
    reviewDiv.id = 'review';

    let shuffledQuizData = [];

    // Function to store the score with the current date and time
    const storeScore = (score) => {
        const scores = JSON.parse(localStorage.getItem('scores')) || [];
        const currentDate = new Date();
        const scoreEntry = {
            score: score,
            date: currentDate.toLocaleDateString(),
            time: currentDate.toLocaleTimeString()
        };

        scores.push(scoreEntry);
        if (scores.length > 5) {
            scores.shift(); // Keep only the latest 5 scores
        }

        localStorage.setItem('scores', JSON.stringify(scores));
    };

    // Function to display previous scores
    const displayScores = () => {
        const scores = JSON.parse(localStorage.getItem('scores')) || [];
        const scoresDiv = document.getElementById('previous-scores');
        scoresDiv.innerHTML = '<h2>Last 5 Scores</h2>';
        scores.forEach(scoreEntry => {
            const scoreElement = document.createElement('p');
            scoreElement.innerText = `Score: ${scoreEntry.score} - Date: ${scoreEntry.date} - Time: ${scoreEntry.time}`;
            scoresDiv.appendChild(scoreElement);
        });
    };

    const shuffleQuestions = () => {
        shuffledQuizData = quizData.sort(() => 0.5 - Math.random()).slice(0, 50);
    };

    const displayQuestions = () => {
        form.innerHTML = '';
        shuffledQuizData.forEach((item, index) => {
            const questionContainer = document.createElement('div');
            questionContainer.classList.add('question-container');
            questionContainer.setAttribute('data-index', index);

            const questionParagraph = document.createElement('p');
            questionParagraph.classList.add('question');
            questionParagraph.innerText = item.question;

            questionContainer.appendChild(questionParagraph);

            if (item.image) {
                const image = document.createElement('img');
                image.src = item.image;
                image.alt = 'Question Image';
                image.classList.add('question-image');
                image.onerror = function () {
                    image.style.display = 'none';
                    const placeholder = document.createElement('div');
                    placeholder.classList.add('image-placeholder');
                    placeholder.innerText = 'No image available';
                    questionContainer.appendChild(placeholder);
                };
                questionContainer.appendChild(image);
            } else {
                const placeholder = document.createElement('div');
                placeholder.classList.add('image-placeholder');
                placeholder.innerText = 'No image available';
                questionContainer.appendChild(placeholder);
            }

            const trueLabel = document.createElement('label');
            trueLabel.innerHTML = `<input type="radio" name="answer-${index}" value="T"> TRUE`;
            questionContainer.appendChild(trueLabel);

            const falseLabel = document.createElement('label');
            falseLabel.innerHTML = `<input type="radio" name="answer-${index}" value="F"> FALSE`;
            questionContainer.appendChild(falseLabel);

            form.appendChild(questionContainer);
        });
    };

    shuffleButton.addEventListener('click', () => {
        shuffleQuestions();
        displayQuestions();
        submitButton.style.display = 'block'; // Show the submit button
    });

    submitButton.addEventListener('click', (event) => {
        event.preventDefault();

        let allAnswered = true;

        // Clear previous highlights
        document.querySelectorAll('.question-container').forEach(container => {
            container.style.backgroundColor = 'white';
        });

        shuffledQuizData.forEach((item, index) => {
            const selectedAnswer = document.querySelector(`input[name="answer-${index}"]:checked`);
            if (!selectedAnswer) {
                allAnswered = false;
                const questionContainer = document.querySelector(`.question-container[data-index="${index}"]`);
                questionContainer.style.backgroundColor = 'lightcoral';
            }
        });

        if (!allAnswered) {
            alert('Please answer all the questions before submitting.');
            return;
        }

        let score = 0;
        let incorrectAnswers = [];

        shuffledQuizData.forEach((item, index) => {
            const selectedAnswer = document.querySelector(`input[name="answer-${index}"]:checked`);
            if (selectedAnswer && selectedAnswer.value === item.answer) {
                score++;
            } else {
                incorrectAnswers.push({
                    question: item.question,
                    correctAnswer: item.answer,
                    selectedAnswer: selectedAnswer ? selectedAnswer.value : 'No answer',
                    explanation: item.explanation,
                    image: item.image
                });
            }
        });

        // Display result with PASS/FAIL
        resultDiv.innerHTML = '';
        const resultMessage = document.createElement('p');
        if (score >= 45) {
            resultMessage.innerText = `PASS! You scored ${score} out of ${shuffledQuizData.length}.`;
            resultMessage.style.color = 'green';

            // Trigger confetti animation if score is 45 or more
            confetti({
                particleCount: 200,
                spread: 70,
                origin: { y: 0.6 }
            });
        } else {
            resultMessage.innerText = `FAIL, Better LUCK NEXT TIME. You scored ${score} out of ${shuffledQuizData.length}.`;
            resultMessage.style.color = 'red';
        }
        resultDiv.appendChild(resultMessage);

        storeScore(score); // Store the score
        displayScores(); // Display the scores

        if (incorrectAnswers.length > 0) {
            reviewDiv.innerHTML = '<h2>Review Incorrect Answers</h2>';
            incorrectAnswers.forEach(item => {
                const questionContainer = document.createElement('div');
                questionContainer.classList.add('question-container');

                const questionParagraph = document.createElement('p');
                questionParagraph.classList.add('question');
                questionParagraph.innerHTML = `<strong>Question:</strong> ${item.question}<br><strong>Your answer:</strong> ${item.selectedAnswer}<br><strong>Correct answer:</strong> ${item.correctAnswer}<br><strong>Explanation:</strong> ${item.explanation}`;

                questionContainer.appendChild(questionParagraph);

                if (item.image) {
                    const image = document.createElement('img');
                    image.src = item.image;
                    image.alt = 'Question Image';
                    image.classList.add('question-image');
                    image.onerror = function () {
                        image.style.display = 'none';
                        const placeholder = document.createElement('div');
                        placeholder.classList.add('image-placeholder');
                        placeholder.innerText = 'No image available';
                        questionContainer.appendChild(placeholder);
                    };
                    questionContainer.appendChild(image);
                } else {
                    const placeholder = document.createElement('div');
                    placeholder.classList.add('image-placeholder');
                    placeholder.innerText = 'No image available';
                    questionContainer.appendChild(placeholder);
                }

                reviewDiv.appendChild(questionContainer);
            });
            resultDiv.appendChild(reviewDiv);
        }
    });

    // Display previous scores on page load
    displayScores();

    // Show the button when the user scrolls down 20px from the top of the document
    window.onscroll = function() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            goToTopButton.style.display = "block";
        } else {
            goToTopButton.style.display = "none";
        }
    };

    // When the user clicks on the button, scroll to the top of the document
    goToTopButton.addEventListener('click', () => {
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE, and Opera
    });
});
