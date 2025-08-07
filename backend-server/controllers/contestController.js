const Contest = require('../models/Contest');
const Submission = require('../models/Submission');
const User = require('../models/User');

const getAllContests = async (req, res) => {
  try {
    const now = new Date();
    const contests = await Contest.find().sort({ startTime: 1 });

    const upcoming = contests.filter(c => c.startTime > now);
    const ongoing = contests.filter(c => c.startTime <= now && c.endTime >= now);
    const past = contests.filter(c => c.endTime < now);

    res.json({ upcoming, ongoing, past });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate('problems');
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    // Access control: hide problems if not registered and contest not started
    const now = new Date();
    const isRegistered = contest.registeredUsers.includes(req.user?._id?.toString());

    if (now < contest.startTime && !isRegistered) {
      return res.json({ ...contest.toObject(), problems: [] });
    }

    res.json(contest);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const registerForContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    const now = new Date();
    const cutoff = new Date(contest.startTime.getTime() - 30 * 60000); // 30 mins before start
    if (now > cutoff) {
      return res.status(400).json({ message: 'Registration closed' });
    }

    if (!contest.registeredUsers.includes(req.user._id)) {
      contest.registeredUsers.push(req.user._id);
      await contest.save();
    }

    res.json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getContestParticipants = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate('registeredUsers', 'username');
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    res.json(contest.registeredUsers);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getContestLeaderboard = async (req, res) => {
  try {
    const submissions = await Submission.find({
      contestId: req.params.id,
      status: 'Accepted'
    }).populate('user', 'username');

    // Group by user and count accepted submissions
    const scores = {};
    for (const sub of submissions) {
      const uid = sub.user._id;
      if (!scores[uid]) {
        scores[uid] = { user: sub.user, solved: new Set() };
      }
      scores[uid].solved.add(sub.problem.toString());
    }

    const leaderboard = Object.values(scores).map(({ user, solved }) => ({
      username: user.username,
      solvedCount: solved.size
    })).sort((a, b) => b.solvedCount - a.solvedCount);

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getAllContests,
  getContestById,
  registerForContest,
  getContestParticipants,
  getContestLeaderboard
};