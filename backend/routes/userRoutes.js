

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const { getMe, updateIncome, updateUserProfile } = require('../controllers/userController'); 


router.get('/me', protect, getMe);


router.put('/income', protect, updateIncome);


router.put('/profile', protect, updateUserProfile);
module.exports = router;