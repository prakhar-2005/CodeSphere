const express = require('express');
const multer = require('multer');
const { uploadProfilePic, getUserInfo, getUserActivity, getUserSubmissions } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/profile/info', protect, getUserInfo);
router.get('/profile/activity', protect, getUserActivity);
router.get('/profile/submissions', protect, getUserSubmissions);
router.post('/upload-profile-pic', protect, upload.single('profilePic'), uploadProfilePic);

module.exports = router;