/**
 * Router for all calls regarding Spotify API
 */

// Express Dependencies
const express = require('express');
const router = express.Router();

const spotifyController = require('../controllers/spotifyController');
const checkToken = require('../middleware/checkToken');

// GET: Searches for the track and finds the most similar result
router.get('/search', checkToken, spotifyController.searchSpotify);

module.exports = router;