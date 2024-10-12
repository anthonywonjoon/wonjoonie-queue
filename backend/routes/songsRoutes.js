/**
 * Router for all calls regarding song queue
 */

// Express Dependencies
const express = require('express');
const router = express.Router();

const songsController = require('../controllers/songsController');

router.get('/', songsController.getSongQueue);
router.post('/', songsController.addSongToQueue);
router.delete('/pop', songsController.removeSongFromQueue);

module.exports = router;