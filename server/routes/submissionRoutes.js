const express = require('express');
const { runCode, submitCode } = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/run', runCode);
router.post('/submit', protect, submitCode); // Protected by 'protect' middleware

module.exports = router;