const express = require('express');
const router = express.Router();
const {
  getAllContests,
  getContestById,
  registerForContest,
  getContestParticipants,
  getContestLeaderboard,
  createContest,
  updateContest,
  deleteContest,
  getContestForAdminEdit
} = require('../controllers/contestController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllContests);
router.get('/:id', getContestById);
router.post('/register/:id', protect, registerForContest);
router.get('/:id/participants', getContestParticipants);
router.get('/:id/leaderboard', getContestLeaderboard);
router.get('/edit/:id', protect, authorize('admin'), getContestForAdminEdit);

router.post('/', protect, authorize('admin'), createContest);
router.put('/:id', protect, authorize('admin'), updateContest);
router.delete('/:id', protect, authorize('admin'), deleteContest);

module.exports = router;