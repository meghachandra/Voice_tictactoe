const cells = document.querySelectorAll('.cell');
const statusDiv = document.getElementById('status');
const recognitionOutputDiv = document.getElementById('recognitionOutput'); // New div for recognition
const startButton = document.getElementById('start');
const restartButton = document.getElementById('restart');
const playerXScoreSpan = document.getElementById('playerXScore');
const playerOScoreSpan = document.getElementById('playerOScore');
let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let playerXScore = 0;
let playerOScore = 0;
let recognition;

// Winning conditions
const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Check for browser compatibility
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true; // Keep listening until manually stopped
    recognition.interimResults = true; // Show results as they are recognized

    // Start recognition
    startButton.addEventListener('click', () => {
        recognition.start();
        startButton.disabled = true;
        statusDiv.textContent = `Listening for commands...`;
    });

    // Handle results
    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                transcript += event.results[i][0].transcript;
                // Process the final recognized command
                const cellIndex = parseCellIndex(transcript);
                if (cellIndex !== null && gameActive) {
                    placeMove(cellIndex);
                }
            } else {
                transcript += event.results[i][0].transcript + ' '; // Add spaces for interim results
            }
        }
        // Update recognition output
        recognitionOutputDiv.textContent = `Recognized: ${transcript}`;
    };

    // Handle end of speech recognition
    recognition.onend = () => {
        if (!gameActive) {
            statusDiv.textContent = 'Game has ended.';
        }
    };
} else {
    statusDiv.textContent = 'Speech recognition not supported';
}

function handleCellClick(event) {
    const cell = event.target;
    const index = cell.getAttribute('data-index');
    
    if (board[index] !== '' || !gameActive) {
        return;
    }

    placeMove(index);
}

function placeMove(index) {
    board[index] = currentPlayer;
    cells[index].textContent = currentPlayer;
    recognitionOutputDiv.textContent = ''; // Clear recognition output after placing the move
    checkResult();
}

function checkResult() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] === '' || board[b] === '' || board[c] === '') {
            continue;
        }
        if (board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusDiv.textContent = `Player ${currentPlayer} wins!`;
        updateScore(currentPlayer);
        gameActive = false;
        recognition.stop(); // Stop recognition when game ends
        return;
    }

    if (!board.includes('')) {
        statusDiv.textContent = 'It\'s a draw!';
        gameActive = false;
        recognition.stop(); // Stop recognition when game ends
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDiv.textContent = `Current Player: ${currentPlayer}`;
}

function updateScore(player) {
    if (player === 'X') {
        playerXScore++;
        playerXScoreSpan.textContent = playerXScore;
    } else {
        playerOScore++;
        playerOScoreSpan.textContent = playerOScore;
    }
}

function parseCellIndex(command) {
    const positions = {
        'top left': 0,
        'top middle': 1,
        'top right': 2,
        'middle left': 3,
        'center': 4,
        'middle right': 5,
        'bottom left': 6,
        'bottom middle': 7,
        'bottom right': 8
    };

    return positions[command.toLowerCase().trim()];
}

function restartGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    statusDiv.textContent = `Current Player: ${currentPlayer}`;
    cells.forEach(cell => {
        cell.textContent = '';
    });
    recognition.start(); // Restart recognition when the game restarts
}

// Event Listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', restartGame);
