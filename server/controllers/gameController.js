const Game = require("../models/Game");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;
const path = require("path");
const { createCanvas, registerFont } = require("canvas");

registerFont(path.join(__dirname, "../fonts/segoe-ui.ttf"), {
  family: "Segoe UI",
});
registerFont(path.join(__dirname, "../fonts/segoe-ui-bold.ttf"), {
  family: "Segoe UI Bold",
});
registerFont(
  path.join(__dirname, "../fonts/Font Awesome 6 Pro-Solid-900.otf"),
  { family: "Font Awesome 6 Pro Solid" }
);

class GameController {
  constructor() {
    this.gamesDir = path.join(__dirname, "../data/games");
  }

  getGamePath(gameId) {
    return path.join(this.gamesDir, `${gameId}.json`);
  }

  async createGame(req, res) {
    try {
      const { size = 10 } = req.body;
      const gameId = uuidv4();
      const game = new Game(gameId, size);

      await fs.writeFile(
        this.getGamePath(gameId),
        JSON.stringify(game, null, 2)
      );

      res.status(201).json({ gameId, game });
    } catch (error) {
      console.error("Create game error:", error);
      res.status(500).json({ error: "Failed to create game" });
    }
  }

  async getGame(req, res) {
    try {
      const { id } = req.params;
      const gamePath = this.getGamePath(id);

      const gameData = await fs.readFile(gamePath, "utf8");
      const game = JSON.parse(gameData);

      res.json(game);
    } catch (error) {
      if (error.code === "ENOENT") {
        res.status(404).json({ error: "Game not found" });
      } else {
        console.error("Get game error:", error);
        res.status(500).json({ error: "Failed to get game" });
      }
    }
  }

  async updateGame(req, res) {
    try {
      const { id } = req.params;
      const { row, col } = req.body;
      const gamePath = this.getGamePath(id);

      const gameData = await fs.readFile(gamePath, "utf8");
      const gameState = JSON.parse(gameData);

      const game = Object.assign(new Game(), gameState);

      if (game.makeMove(row, col)) {
        await fs.writeFile(gamePath, JSON.stringify(game, null, 2));
        res.json(game);
      } else {
        res.status(400).json({ error: "Invalid move" });
      }
    } catch (error) {
      console.error("Update game error:", error);
      res.status(500).json({ error: "Failed to update game" });
    }
  }

  async deleteGame(req, res) {
    try {
      const { id } = req.params;
      const gamePath = this.getGamePath(id);

      // Kiểm tra xem file có tồn tại không
      try {
        await fs.access(gamePath);
      } catch (error) {
        return res.status(404).json({ error: "Game not found" });
      }

      // Xóa file game
      await fs.unlink(gamePath);
      res.status(200).json({ message: "Game deleted successfully" });
    } catch (error) {
      console.error("Delete game error:", error);
      res.status(500).json({ error: "Failed to delete game" });
    }
  }

  async generateGameImage(req, res) {
    try {
      const { id } = req.params;
      const theme = req.query.theme || "light";
      const gamePath = this.getGamePath(id);
      const gameData = await fs.readFile(gamePath, "utf8");
      const game = JSON.parse(gameData);

      // Canvas settings with higher resolution
      const scale = 2;
      const cellSize = 50 * scale;
      const padding = 40 * scale;
      const headerHeight = 100 * scale;
      const footerHeight = 80 * scale;

      const width = game.size * cellSize + padding * 2;
      const height =
        game.size * cellSize + padding * 2 + headerHeight + footerHeight;

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Theme colors
      const colors =
        theme === "dark"
          ? {
              bg: "#1a1a1a",
              boardBg: "#2d2d2d",
              grid: "#404040",
              text: "#ffffff",
              xColor: "#ff4757",
              oColor: "#2196f3",
              overlayBg: "rgba(0, 0, 0, 0.85)",
              cellNumber: "rgba(255, 255, 255, 0.3)",
            }
          : {
              bg: "#f0f2f5",
              boardBg: "#ffffff",
              grid: "#e1e4e8",
              text: "#2c3e50",
              xColor: "#ff4757",
              oColor: "#2196f3",
              overlayBg: "rgba(255, 255, 255, 0.85)",
              cellNumber: "rgba(0, 0, 0, 0.3)",
            };

      // Draw main background
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, width, height);

      // Draw header with shadow
      ctx.fillStyle = colors.boardBg;
      ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
      ctx.shadowBlur = 10 * scale;
      ctx.shadowOffsetY = 5 * scale;
      ctx.fillRect(
        padding / 2,
        padding / 2,
        width - padding,
        headerHeight - padding / 2
      );
      ctx.shadowColor = "transparent";

      // Draw game title
      ctx.fillStyle = "#2196f3";
      ctx.font = `bold ${42 * scale}px "Segoe UI Bold"`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Draw gamepad icon
      ctx.font = `normal ${42 * scale}px "Font Awesome 6 Pro Solid"`;
      ctx.fillText("\uf11b", width / 2 - 120 * scale, headerHeight / 2); // Gamepad icon

      // Draw title text
      ctx.font = `bold ${42 * scale}px "Segoe UI Bold"`;
      ctx.fillText("Gomoku Game", width / 2 + 20 * scale, headerHeight / 2);

      // Draw board background with shadow
      ctx.fillStyle = colors.boardBg;
      ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
      ctx.shadowBlur = 10 * scale;
      ctx.shadowOffsetY = 5 * scale;
      ctx.fillRect(
        padding / 2,
        headerHeight + padding / 2,
        width - padding,
        height - headerHeight - footerHeight - padding
      );
      ctx.shadowColor = "transparent";

      // Draw grid
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = scale;

      // Draw vertical lines
      for (let i = 0; i <= game.size; i++) {
        ctx.beginPath();
        ctx.moveTo(padding + i * cellSize, headerHeight + padding);
        ctx.lineTo(padding + i * cellSize, height - footerHeight - padding);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let i = 0; i <= game.size; i++) {
        ctx.beginPath();
        ctx.moveTo(padding, headerHeight + padding + i * cellSize);
        ctx.lineTo(width - padding, headerHeight + padding + i * cellSize);
        ctx.stroke();
      }

      // Draw cell numbers and X's/O's
      for (let i = 0; i < game.size; i++) {
        for (let j = 0; j < game.size; j++) {
          const value = game.board[i][j];
          const x = padding + j * cellSize + cellSize / 2;
          const y = headerHeight + padding + i * cellSize + cellSize / 2;

          if (value) {
            // Draw X or O
            ctx.fillStyle = value === "X" ? colors.xColor : colors.oColor;
            ctx.font = `normal ${36 * scale}px "Font Awesome 6 Pro Solid"`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            if (value === "X") {
              ctx.fillText("\uf00d", x, y); // X icon
            } else {
              ctx.fillText("\uf111", x, y); // O icon
            }
          } else {
            // Draw cell number
            ctx.fillStyle = colors.cellNumber;
            ctx.font = `${14 * scale}px "Segoe UI"`;
            ctx.textAlign = "right";
            ctx.textBaseline = "bottom";
            ctx.fillText(
              (i * game.size + j + 1).toString(),
              x + cellSize / 2 - 5 * scale,
              y + cellSize / 2 - 5 * scale
            );
          }
        }
      }

      // Draw footer with shadow
      ctx.fillStyle = colors.boardBg;
      ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
      ctx.shadowBlur = 10 * scale;
      ctx.shadowOffsetY = 5 * scale;
      ctx.fillRect(
        padding / 2,
        height - footerHeight + padding / 2,
        width - padding,
        footerHeight - padding
      );
      ctx.shadowColor = "transparent";

      // Draw current turn in footer
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${28 * scale}px "Segoe UI"`;

      const turnText = `Current Turn: `;
      const textWidth = ctx.measureText(turnText).width;

      // Draw "Current Turn: " in normal color
      ctx.fillStyle = colors.text;
      ctx.fillText(
        turnText,
        width / 2 - textWidth / 4,
        height - footerHeight / 2
      );

      // Draw player symbol (X/O) in its color
      ctx.font = `normal ${28 * scale}px "Font Awesome 6 Pro Solid"`;
      ctx.fillStyle =
        game.currentPlayer === "X" ? colors.xColor : colors.oColor;
      ctx.fillText(
        game.currentPlayer === "X" ? "\uf00d" : "\uf111",
        width / 2 + textWidth / 4,
        height - footerHeight / 2
      );

      // Draw overlay for game end
      if (game.status === "finished" || game.status === "draw") {
        ctx.fillStyle = colors.overlayBg;
        ctx.fillRect(
          padding / 2,
          headerHeight + padding / 2,
          width - padding,
          height - headerHeight - footerHeight - padding
        );

        ctx.fillStyle = colors.text;
        ctx.font = `bold ${48 * scale}px "Segoe UI Bold"`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        let message;
        if (game.status === "draw") {
          message = "It's a draw!";
        } else {
          const winnerColor =
            game.winner === "X" ? colors.xColor : colors.oColor;
          ctx.fillStyle = winnerColor;
          message = `Player ${game.winner} wins!`;
        }

        ctx.fillText(
          message,
          width / 2,
          headerHeight + (height - headerHeight - footerHeight) / 2
        );
      }

      // Add subtle border radius to all rectangles
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = scale;
      ctx.strokeRect(
        padding / 2,
        padding / 2,
        width - padding,
        headerHeight - padding / 2
      );
      ctx.strokeRect(
        padding / 2,
        headerHeight + padding / 2,
        width - padding,
        height - headerHeight - footerHeight - padding
      );
      ctx.strokeRect(
        padding / 2,
        height - footerHeight + padding / 2,
        width - padding,
        footerHeight - padding
      );

      // Send the image
      res.setHeader("Content-Type", "image/png");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="gomoku-${id}.png"`
      );
      canvas.createPNGStream().pipe(res);
    } catch (error) {
      console.error("Generate image error:", error);
      res.status(500).json({ error: "Failed to generate game image" });
    }
  }
}

module.exports = new GameController();
