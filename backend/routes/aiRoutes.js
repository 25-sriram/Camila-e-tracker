
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAIChatResponse } = require('../controllers/aiController');

router.post('/chat', protect, getAIChatResponse);

module.exports = router;