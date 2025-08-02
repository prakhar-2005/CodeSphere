const Submission = require('../models/Submission');
const User = require('../models/User');

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalSubmissions = await Submission.countDocuments({ userId });

    const submissions = await Submission.find({ userId })
      .populate('problemId', 'name difficulty')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

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
        date: new Date(year, month - 1, day).toISOString().split('T')[0], // "YYYY-MM-DD"
        count: entry.count
      };
    });

    res.status(200).json({
      user: {
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      submissions,
      totalPages: Math.ceil(totalSubmissions / limit),
      currentPage: page,
      activity: formattedActivity
    });

  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUserProfile };