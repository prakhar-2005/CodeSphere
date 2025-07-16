const { registerUser, loginUser, logoutUser } = require('../controllers/authController');
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser); 
router.post('/login', loginUser);       
router.post('/logout', logoutUser);    

router.get('/me', protect, (req, res) => {
    if (req.user) {
        res.status(200).json({
            _id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role, 
        });
    } else {
        res.status(401).json({ message: 'Not authorized, user not found after token verification' });
    }
});

module.exports = router;