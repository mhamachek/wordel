let targetWord = '';
let currentRow = 0;
let currentTile = 0;
let gameOver = false;
let currentWordList = EASY_WORDS; // Default to easy

// Initialize the game
function initGame() {
    // Select a random word from the current difficulty
    targetWord = currentWordList[Math.floor(Math.random() * currentWordList.length)];
    
    // Create the game board
    const gameBoard = document.querySelector('.game-board');
    gameBoard.innerHTML = '';
    
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        
        for (let j = 0; j < 4; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            row.appendChild(tile);
        }
        
        gameBoard.appendChild(row);
    }
    
    // Reset game state
    currentRow = 0;
    currentTile = 0;
    gameOver = false;
    document.getElementById('attempts-left').textContent = '6';
    document.getElementById('message').textContent = '';
    
    // Reset keyboard colors
    document.querySelectorAll('.key').forEach(key => {
        key.classList.remove('correct', 'present', 'absent');
    });
}

// Handle keyboard input
function handleKeyPress(key) {
    if (gameOver) return;
    
    const rows = document.querySelectorAll('.row');
    const currentRowElement = rows[currentRow];
    const tiles = currentRowElement.querySelectorAll('.tile');
    
    if (key === 'Backspace') {
        if (currentTile > 0) {
            currentTile--;
            tiles[currentTile].textContent = '';
            document.getElementById('message').textContent = ''; // Clear error message
        }
    } else if (key === 'Enter') {
        if (currentTile === 4) {
            const isValidGuess = checkGuess();
            if (!isValidGuess) {
                // Allow editing the current row if guess was invalid
                currentTile = 4;
            }
        }
    } else if (currentTile < 4) {
        tiles[currentTile].textContent = key.toUpperCase();
        currentTile++;
        document.getElementById('message').textContent = ''; // Clear error message
    }
}

// Check if the current guess is correct
function checkGuess() {
    const rows = document.querySelectorAll('.row');
    const currentRowElement = rows[currentRow];
    const tiles = currentRowElement.querySelectorAll('.tile');
    
    let guess = '';
    tiles.forEach(tile => {
        guess += tile.textContent.toLowerCase();
    });
    
    // Check if the word is in our list
    if (!currentWordList.includes(guess)) {
        document.getElementById('message').textContent = 'Not in word list!';
        return false; // Return false to indicate invalid guess
    }
    
    // Check each letter
    const targetLetters = targetWord.split('');
    const guessLetters = guess.split('');
    const usedLetters = new Array(4).fill(false);
    
    // First pass: check for correct letters
    guessLetters.forEach((letter, index) => {
        if (letter === targetLetters[index]) {
            tiles[index].classList.add('correct');
            updateKeyboard(letter, 'correct');
            usedLetters[index] = true;
        }
    });
    
    // Second pass: check for present letters
    guessLetters.forEach((letter, index) => {
        if (!tiles[index].classList.contains('correct')) {
            const targetIndex = targetLetters.findIndex((targetLetter, i) => 
                targetLetter === letter && !usedLetters[i]
            );
            
            if (targetIndex !== -1) {
                tiles[index].classList.add('present');
                updateKeyboard(letter, 'present');
                usedLetters[targetIndex] = true;
            } else {
                tiles[index].classList.add('absent');
                updateKeyboard(letter, 'absent');
            }
        }
    });
    
    // Check for win or loss
    if (guess === targetWord) {
        gameOver = true;
        document.getElementById('message').textContent = 'You won! 🎉';
    } else {
        currentRow++;
        currentTile = 0;
        document.getElementById('attempts-left').textContent = 6 - currentRow;
        
        if (currentRow === 6) {
            gameOver = true;
            document.getElementById('message').textContent = `Game Over! The word was ${targetWord.toUpperCase()}`;
        }
    }
    return true; // Return true to indicate valid guess
}

// Update keyboard colors
function updateKeyboard(letter, state) {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        if (key.textContent.toLowerCase() === letter) {
            // Don't downgrade the state from present to absent if two letters are guessed and only one is present
            if (state === 'absent' && key.classList.contains('present')) {
                return;
            }
            // Remove any existing state classes
            key.classList.remove('correct', 'present', 'absent');
            // Add the new state
            key.classList.add(state);
        }
    });
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === 'Backspace' || /^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key);
    }
});

document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => {
        if (key.id === 'backspace') {
            handleKeyPress('Backspace');
        } else {
            handleKeyPress(key.textContent);
        }
    });
});

// Mobile submit button event listener
const mobileSubmit = document.getElementById('mobile-submit');
if (mobileSubmit) {
    mobileSubmit.addEventListener('click', () => {
        handleKeyPress('Enter');
    });
}

// Handle difficulty selection
document.getElementById('start-game').addEventListener('click', () => {
    const difficulty = document.getElementById('difficulty').value;
    switch(difficulty) {
        case 'easy':
            currentWordList = EASY_WORDS;
            break;
        case 'medium':
            currentWordList = MEDIUM_WORDS;
            break;
        case 'hard':
            currentWordList = HARD_WORDS;
            break;
    }
    initGame();
});

// Initialize the game when the page loads
window.addEventListener('load', initGame); 