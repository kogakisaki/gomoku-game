const Game = require("../models/Game");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;
const path = require("path");

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
}

module.exports = new GameController();
