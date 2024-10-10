const boardSize = 10; // Taille du plateau
const mineCount = 20; // Nombre de mines
let board = []; // Plateau de jeu
let revealedCount = 0; // Nombre de cellules révélées
let gameOver = false; // État du jeu
let firstClick = true; // Indicateur pour le premier clic

// Crée le plateau de jeu
function createBoard() {
    board = Array.from({ length: boardSize }, () => 
        Array.from({ length: boardSize }, () => ({ isMine: false, isRevealed: false, adjacentMines: 0, isFlagged: false }))
    );
    renderBoard(); // Afficher le plateau
}

// Placer les mines aléatoirement
function placeMines(firstRow, firstCol) {
    let placedMines = 0;
    while (placedMines < mineCount) {
        const row = Math.floor(Math.random() * boardSize);
        const col = Math.floor(Math.random() * boardSize);

        // S'assurer que la mine n'est pas placée dans la cellule du premier clic ou ses cellules adjacentes
        if (
            !board[row][col].isMine &&
            !(row === firstRow && col === firstCol) &&
            !(row === firstRow - 1 && col === firstCol) &&
            !(row === firstRow + 1 && col === firstCol) &&
            !(row === firstRow && col === firstCol - 1) &&
            !(row === firstRow && col === firstCol + 1) &&
            !(row === firstRow - 1 && col === firstCol - 1) &&
            !(row === firstRow - 1 && col === firstCol + 1) &&
            !(row === firstRow + 1 && col === firstCol - 1) &&
            !(row === firstRow + 1 && col === firstCol + 1)
        ) {
            board[row][col].isMine = true;
            placedMines++;
        }
    }
}

// Calculer le nombre de mines adjacentes
function calculateAdjacentMines() {
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (board[r][c].isMine) continue;
            board[r][c].adjacentMines = countMines(r, c);
        }
    }
}

// Compte le nombre de mines autour d'une cellule
function countMines(row, col) {
    let count = 0;
    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c].isMine) {
                count++;
            }
        }
    }
    return count;
}

// Rendu du plateau de jeu
function renderBoard() {
    const gameBoardElement = document.getElementById('game-board');
    gameBoardElement.innerHTML = '';
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('contextmenu', handleRightClick); // Ajouter l'événement de clic droit
            gameBoardElement.appendChild(cell);
        }
    }
}

// Gestion des clics sur les cellules (clic gauche)
function handleCellClick(event) {
    if (gameOver) return;

    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (firstClick) {
        placeMines(row, col); // Placer les mines en tenant compte de la cellule du premier clic
        calculateAdjacentMines(); // Calculer les mines adjacentes après avoir placé les mines
        firstClick = false; // Changer l'indicateur de premier clic
    }

    if (board[row][col].isRevealed || board[row][col].isFlagged) return; // Ne rien faire si la cellule est déjà révélée ou marquée

    board[row][col].isRevealed = true; // Révéler la cellule
    revealedCount++;

    if (board[row][col].isMine) { // Si c'est une mine
        cell.classList.add('mine');
        gameOver = true;
        document.getElementById('status').innerText = 'Jeu terminé! Vous avez perdu!';
        document.getElementById('reset-button').style.display = 'block';
        revealAllMines();
    } else {
        cell.classList.add('revealed');
        cell.innerText = board[row][col].adjacentMines || ''; // Afficher le nombre de mines adjacentes

        if (board[row][col].adjacentMines === 0) {
            revealAdjacentCells(row, col); // Révéler les cellules adjacentes si aucune mine
        }

        if (revealedCount === (boardSize * boardSize - mineCount)) { // Vérifier si toutes les cellules sauf les mines sont révélées
            gameOver = true;
            document.getElementById('status').innerText = 'Félicitations! Vous avez gagné!';
            document.getElementById('reset-button').style.display = 'block';
        }
    }
}

// Gestion des clics droits sur les cellules (placer ou retirer un drapeau)
function handleRightClick(event) {
    event.preventDefault(); // Empêche le menu contextuel par défaut de s'afficher

    if (gameOver) return;

    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (board[row][col].isRevealed) return; // Ne rien faire si la cellule est déjà révélée

    // Basculer l'état du drapeau
    board[row][col].isFlagged = !board[row][col].isFlagged;

    // Mettre à jour l'affichage du drapeau
    if (board[row][col].isFlagged) {
        cell.classList.add('flag');
        cell.innerText = '🚩'; // Afficher le drapeau
    } else {
        cell.classList.remove('flag');
        cell.innerText = ''; // Retirer le drapeau
    }
}

// Révèle toutes les mines lorsque le joueur perd
function revealAllMines() {
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (board[r][c].isMine) {
                const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                cell.classList.add('mine');
            }
        }
    }
}

// Révèle les cellules adjacentes
function revealAdjacentCells(row, col) {
    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) {
                handleCellClick({ target: document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`) });
            }
        }
    }
}

// Réinitialise le jeu
document.getElementById('reset-button').addEventListener('click', () => {
    gameOver = false;
    revealedCount = 0;
    firstClick = true; // Réinitialiser l'indicateur du premier clic
    document.getElementById('status').innerText = '';
    createBoard();
    document.getElementById('reset-button').style.display = 'none';
});

// Crée le plateau au chargement de la page
createBoard();
