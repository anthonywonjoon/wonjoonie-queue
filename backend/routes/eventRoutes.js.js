/**
 * Router for all calls regarding Events DB
 */

/* Express Dependencies */
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.get('/', eventController.getAllEvents);
router.post('/add', eventController.addEvent);
router.post('/remove', eventController.removeEvents);
router.get('/list', eventController.listEvents);

module.exports = router;