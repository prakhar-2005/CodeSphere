const express = require('express');
const { runCode, submitCode, getUserSubmissionsForProblem, getUserAcceptedSubmissionsForContest } = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/run', runCode);
router.post('/submit', protect, submitCode); 
router.get('/:problemId/mine', protect, getUserSubmissionsForProblem);
router.get('/contest/:contestId/accepted', protect, getUserAcceptedSubmissionsForContest); 

module.exports = router;