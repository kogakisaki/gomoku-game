const Game = {
  currentGame: null,

  async newGame() {
    const size = parseInt(document.getElementById("boardSize").value);
    try {
      const response = await API.createGame(size);
      this.currentGame = response.game;
      UI.updateGameId(response.gameId);
      UI.initializeBoard();
      UI.updateStatus(`Player ${this.currentGame.currentPlayer}'s turn`);
      UI.closeOverlay();
    } catch (error) {
      UI.showError("Failed to create new game");
    }
  },

  async loadGame(gameId) {
    try {
      this.currentGame = await API.getGame(gameId);
      UI.updateGameId(gameId);
      UI.initializeBoard();
      UI.updateBoard();
      UI.updateStatus(this.getStatusMessage());
    } catch (error) {
      UI.showError("Failed to load game");
    }
  },

  async makeMove(row, col) {
    if (!this.currentGame || this.currentGame.status !== "active") return;

    try {
      const updatedGame = await API.makeMove(this.currentGame.id, row, col);
      this.currentGame = updatedGame;
      UI.updateBoard();
      UI.updateStatus(this.getStatusMessage());
    } catch (error) {
      UI.showError("Failed to make move");
    }
  },

  getStatusMessage() {
    if (this.currentGame.status === "finished") {
      return `Player ${this.currentGame.winner} wins!`;
    } else if (this.currentGame.status === "draw") {
      return "It's a draw!";
    } else {
      return `Player ${this.currentGame.currentPlayer}'s turn`;
    }
  },

  async deleteCurrentGame() {
    if (!this.currentGame) return;

    try {
      await API.deleteGame(this.currentGame.id);
      this.currentGame = null;
      UI.clearGame();
      UI.updateGameId("");
      window.history.pushState({}, "", window.location.pathname);
    } catch (error) {
      UI.showError("Failed to delete game");
    }
  },
};
