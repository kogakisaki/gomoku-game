class Game {
    constructor(id, size) {
        this.id = id;
        this.size = size;
        this.board = Array(size).fill().map(() => Array(size).fill(''));
        this.currentPlayer = 'X';
        this.status = 'active';
        this.winner = null;
        this.winningCells = [];
        this.createdAt = new Date().toISOString();
        this.lastUpdated = new Date().toISOString();
    }

    makeMove(row, col) {
        if (this.isValidMove(row, col)) {
            this.board[row][col] = this.currentPlayer;
            this.lastUpdated = new Date().toISOString();

            if (this.checkWinner(row, col)) {
                this.status = 'finished';
                this.winner = this.currentPlayer;
            } else if (this.checkDraw()) {
                this.status = 'draw';
            } else {
                this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            }
            return true;
        }
        return false;
    }

    isValidMove(row, col) {
        return (
            this.status === 'active' &&
            row >= 0 &&
            row < this.size &&
            col >= 0 &&
            col < this.size &&
            this.board[row][col] === ''
        );
    }

    checkWinner(row, col) {
        const directions = [
            [[0, 1], [0, -1]],   // Horizontal
            [[1, 0], [-1, 0]],   // Vertical
            [[1, 1], [-1, -1]],  // Diagonal
            [[1, -1], [-1, 1]]   // Anti-diagonal
        ];

        return directions.some(direction => {
            const cells = [[row, col]];
            const [dir1, dir2] = direction;

            // Check both directions
            for (const [dx, dy] of [dir1, dir2]) {
                let [r, c] = [row + dx, col + dy];
                while (
                    r >= 0 && r < this.size &&
                    c >= 0 && c < this.size &&
                    this.board[r][c] === this.currentPlayer
                ) {
                    cells.push([r, c]);
                    r += dx;
                    c += dy;
                }
            }

            if (cells.length >= 5) {
                this.winningCells = cells;
                return true;
            }
            return false;
        });
    }

    checkDraw() {
        return this.board.every(row => row.every(cell => cell !== ''));
    }
}

module.exports = Game;