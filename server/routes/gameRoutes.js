const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.post('/new', gameController.createGame.bind(gameController));
router.get('/:id', gameController.getGame.bind(gameController));
router.put('/:id/move', gameController.updateGame.bind(gameController));
router.delete('/:id', gameController.deleteGame.bind(gameController));
router.get('/:id/image', gameController.generateGameImage.bind(gameController));

module.exports = router;