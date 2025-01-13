const UI = {
  init() {
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get("gameId");
    if (gameId) {
      Game.loadGame(gameId);
    }

    // Khôi phục theme từ localStorage nếu có
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.setAttribute("data-theme", "dark");
      document.querySelector(".theme-toggle i").classList.remove("fa-moon");
      document.querySelector(".theme-toggle i").classList.add("fa-sun");
    }
  },

  initializeBoard() {
    const board = document.getElementById("board");
    const size = Game.currentGame.size;

    board.style.gridTemplateColumns = `repeat(${size}, 40px)`;
    board.innerHTML =
      '<div class="overlay" id="overlay"><div class="overlay-content"></div></div>';

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.onclick = () => Game.makeMove(i, j);

        const number = document.createElement("span");
        number.className = "cell-number";
        number.textContent = i * size + j + 1;
        cell.appendChild(number);

        board.appendChild(cell);
      }
    }
  },

  updateBoard() {
    const cells = document.getElementsByClassName("cell");
    const board = Game.currentGame.board;

    board.forEach((row, i) => {
      row.forEach((value, j) => {
        const cell = cells[i * board.length + j];
        cell.innerHTML = "";

        if (value) {
          const icon = document.createElement("i");
          if (value === "X") {
            icon.className = "fas fa-times";
            cell.classList.add("x-mark");
          } else {
            icon.className = "fas fa-circle";
            cell.classList.add("o-mark");
          }
          cell.appendChild(icon);

          if (
            Game.currentGame.winningCells?.some(([r, c]) => r === i && c === j)
          ) {
            cell.classList.add("winner");
          }
        } else {
          const number = document.createElement("span");
          number.className = "cell-number";
          number.textContent = i * board.length + j + 1;
          cell.appendChild(number);
        }
      });
    });

    // Kiểm tra trạng thái game sau khi cập nhật bàn cờ
    this.checkGameEnd();
  },

  updateGameId(gameId) {
    document.getElementById("gameId").value = gameId;
    // Update URL without refreshing
    window.history.pushState({}, "", `?gameId=${gameId}`);
  },

  updateStatus(message) {
    document.getElementById("status").textContent = message;
  },

  checkGameEnd() {
    const overlay = document.getElementById("overlay");
    const overlayContent = overlay.querySelector(".overlay-content");

    if (
      Game.currentGame.status === "draw" ||
      Game.currentGame.status === "finished"
    ) {
      let message;
      if (Game.currentGame.status === "draw") {
        message = "It's a draw!";
      } else {
        const winnerColor =
          Game.currentGame.winner === "X" ? "var(--x-color)" : "var(--o-color)";
        message = `Player <span style="color: ${winnerColor}">${Game.currentGame.winner}</span> wins!`;
      }

      overlayContent.innerHTML = message;
      overlay.classList.add("active");
    } else {
      overlay.classList.remove("active");
    }
  },

  closeOverlay() {
    const overlay = document.getElementById("overlay");
    const overlayContent = overlay.querySelector(".overlay-content");

    overlayContent.style.opacity = "0";
    overlayContent.style.transform = "scale(0.9)";

    setTimeout(() => {
      overlay.classList.remove("active");
    }, 300);
  },

  startNewGame() {
    this.closeOverlay();
    setTimeout(() => {
      Game.newGame();
    }, 300);
  },

  async copyGameId() {
    const gameId = document.getElementById("gameId").value;
    if (gameId) {
      try {
        await navigator.clipboard.writeText(gameId);
        this.showMessage("Game ID copied to clipboard!");
      } catch (error) {
        this.showError("Failed to copy Game ID");
      }
    }
  },

  showLoadGamePrompt() {
    const gameId = prompt("Enter Game ID:");
    if (gameId) {
      Game.loadGame(gameId);
    }
  },

  toggleTheme() {
    const body = document.body;
    const themeToggle = document.querySelector(".theme-toggle i");

    if (body.getAttribute("data-theme") === "dark") {
      body.removeAttribute("data-theme");
      themeToggle.classList.remove("fa-sun");
      themeToggle.classList.add("fa-moon");
      localStorage.setItem("theme", "light");
    } else {
      body.setAttribute("data-theme", "dark");
      themeToggle.classList.remove("fa-moon");
      themeToggle.classList.add("fa-sun");
      localStorage.setItem("theme", "dark");
    }
  },

  showError(message) {
    alert(message);
  },

  showMessage(message) {
    alert(message);
  },

  resetBoard() {
    const board = document.getElementById("board");
    board.innerHTML = "";
  },

  clearGame() {
    this.resetBoard();
    this.updateStatus("Start a new game or load existing one");
  },

  async showDeleteConfirmation() {
    if (!Game.currentGame) {
      this.showError("No game to delete");
      return;
    }

    if (confirm("Are you sure you want to delete this game?")) {
      const result = await Game.deleteCurrentGame();
      if (result.success) {
        // Có thể thêm thông báo thành công nếu cần
        this.showMessage("Game deleted successfully");
      }
    }
  },
};

// Initialize UI when page loads
document.addEventListener("DOMContentLoaded", () => UI.init());
