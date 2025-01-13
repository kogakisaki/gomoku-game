const API = {
  async createGame(size) {
    const response = await fetch("/api/games/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ size }),
    });
    return response.json();
  },

  async getGame(gameId) {
    const response = await fetch(`/api/games/${gameId}`);
    if (!response.ok) throw new Error("Game not found");
    return response.json();
  },

  async makeMove(gameId, row, col) {
    const response = await fetch(`/api/games/${gameId}/move`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ row, col }),
    });
    return response.json();
  },

  async deleteGame(gameId) {
    const response = await fetch(`/api/games/${gameId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete game");
    return response.json();
  },
};
