const Submission = require('../models/Submission');
const User = require('../models/User');
const { uploadFile, getSignedUrl } = require('../utils/s3upload');

const getUserInfo = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const profilePicSignedUrl = user.profilePic ? getSignedUrl(user.profilePic) : null;

    res.status(200).json({
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      profilePic: profilePicSignedUrl,
    });
  } catch (err) {
    console.error('Error fetching user info:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserActivity = async (req, res) => {
  try {
    const userId = req.user._id;

    const activity = await Submission.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            year: { $year: '$submittedAt' },
            month: { $month: '$submittedAt' },
            day: { $dayOfMonth: '$submittedAt' }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedActivity = activity.map(entry => {
      const { year, month, day } = entry._id;
      return {
        date: new Date(year, month - 1, day).toISOString().split('T')[0],
        count: entry.count
      };
    });

    res.status(200).json(formattedActivity);
  } catch (err) {
    console.error('Error fetching user activity:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalSubmissions = await Submission.countDocuments({ userId });

    const submissions = await Submission.find({ userId })
      .populate('problemId', 'name difficulty')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      submissions,
      totalPages: Math.ceil(totalSubmissions / limit),
      currentPage: page
    });
  } catch (err) {
    console.error('Error fetching user submissions:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadProfilePic = async (req, res) => {
  try {
    const userId = req.user._id;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const profilePicUrl = await uploadFile(file, userId);
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePic: profilePicUrl },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile picture updated successfully',
      profilePic: getSignedUrl(user.profilePic),
    });

  } catch (err) {
    console.error('Error uploading profile picture:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserInfo,
  getUserActivity,
  getUserSubmissions,
  uploadProfilePic
};