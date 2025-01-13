const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const gameRoutes = require('./routes/gameRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Create games directory if it doesn't exist
const gamesDir = path.join(__dirname, 'data', 'games');
if (!fs.existsSync(gamesDir)) {
    fs.mkdirSync(gamesDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/games', gameRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});