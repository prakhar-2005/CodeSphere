const express = require('express');
const router = express.Router();
const {
  getAllContests,
  getContestById,
  registerForContest,
  getContestParticipants,
  getContestLeaderboard
} = require('../controllers/contestController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllContests);
router.get('/:id', getContestById);
router.post('/register/:id', protect, registerForContest);
router.get('/:id/participants', getContestParticipants);
router.get('/:id/leaderboard', getContestLeaderboard);

module.exports = router;