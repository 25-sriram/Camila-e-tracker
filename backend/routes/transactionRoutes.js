const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
    getTransactions, 
    addTransaction, 
    getAnalytics 
} = require('../controllers/transactionController');

router.route('/').get(protect, getTransactions).post(protect, addTransaction);


router.get('/analytics', protect, getAnalytics);

module.exports = router;