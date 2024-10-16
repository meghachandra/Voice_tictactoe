const cells = document.querySelectorAll('.cell');
const statusDiv = document.getElementById('status');
const startButton = document.getElementById('start');
const restartButton = document.getElementById('restart');
const playerXScoreSpan = document.getElementById('playerXScore');
const playerOScoreSpan = document.getElementById('playerOScore');
let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let playerXScore = 0;
let playerOScore = 0;

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

function handleCellClick(event) {
    const cell = event.target;
    const index = cell.getAttribute('data-index');

    if (board[index] !== '' || !gameActive) {
        return;
    }

    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
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
        return;
    }

    if (!board.includes('')) {
        statusDiv.textContent = 'It\'s a draw!';
        gameActive = false;
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

function startListening() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.start();

    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        handleVoiceCommand(command);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
    };
}

function handleVoiceCommand(command) {
    const cellIndex = parseCellIndex(command);
    if (cellIndex !== null) {
        const cell = cells[cellIndex];
        cell.click();
    }
}

function parseCellIndex(command) {
    const match = command.match(/place (x|o) in (top left|top middle|top right|middle left|center|middle right|bottom left|bottom middle|bottom right)/);
    if (!match) return null;

    const positions = {
        'top left': 0, 'top middle': 1, 'top right': 2,
        'middle left': 3, 'center': 4, 'middle right': 5,
        'bottom left': 6, 'bottom middle': 7, 'bottom right': 8
    };

    return positions[match[2]];
}

function restartGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    statusDiv.textContent = `Current Player: ${currentPlayer}`;
    cells.forEach(cell => {
        cell.textContent = '';
    });
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
startButton.addEventListener('click', startListening);
restartButton.addEventListener('click', restartGame);
