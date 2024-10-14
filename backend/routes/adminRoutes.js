/**
 * Router for all calls regarding Admin Panel
 */

/* Express Dependencies */
const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');

router.get('/', adminController.getAdminPanel);

module.exports = router;