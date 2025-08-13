const Contest = require('../models/Contest');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Problem = require('../models/Problem');
const mongoose = require('mongoose');

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

const createContest = async (req, res) => {
  try {
    const { name, description, startTime, endTime, problems } = req.body;

    if (!name || !startTime || !endTime) {
      return res.status(400).json({ message: 'Name, startTime, and endTime are required.' });
    }

    const newContest = await Contest.create({
      name,
      description,
      startTime,
      endTime,
      problems,
      createdBy: req.user._id,
    });

    // --- NEW LOGIC: Update the problems with the new contestId ---
    if (problems && problems.length > 0) {
      await Problem.updateMany(
        { _id: { $in: problems } },
        { $set: { contestId: newContest._id } }
      );
    }
    // -------------------------------------------------------------

    res.status(201).json(newContest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateContest = async (req, res) => {
  try {
    const { problems: newProblemIds, ...restOfBody } = req.body;
    const contestId = req.params.id;

    // Find the old contest to get a list of original problems
    const oldContest = await Contest.findById(contestId);
    if (!oldContest) {
      return res.status(404).json({ message: 'Contest not found.' });
    }
    const oldProblemIds = oldContest.problems.map(p => p.toString());

    // Problems to be added: newProblemIds that were not in oldProblemIds
    const problemsToAdd = newProblemIds.filter(id => !oldProblemIds.includes(id));
    // Problems to be removed: oldProblemIds that are no longer in newProblemIds
    const problemsToRemove = oldProblemIds.filter(id => !newProblemIds.includes(id));

    // Update problems that were added to the contest
    if (problemsToAdd.length > 0) {
      await Problem.updateMany(
        { _id: { $in: problemsToAdd } },
        { $set: { contestId: contestId } }
      );
    }

    // Update problems that were removed from the contest (set contestId back to null)
    if (problemsToRemove.length > 0) {
      await Problem.updateMany(
        { _id: { $in: problemsToRemove } },
        { $set: { contestId: null } }
      );
    }

    // Now update the contest itself
    const updatedContest = await Contest.findByIdAndUpdate(
      contestId,
      { problems: newProblemIds, ...restOfBody },
      { new: true, runValidators: true }
    );

    if (!updatedContest) {
      return res.status(404).json({ message: 'Contest not found.' });
    }

    res.json(updatedContest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found.' });
    }

    await Problem.updateMany(
      { _id: { $in: contest.problems } },
      { $set: { contestId: null } }
    );

    res.json({ message: 'Contest deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const registerForContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    const now = new Date();
    const cutoff = new Date(contest.startTime.getTime() - 30 * 60000);
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
    }).populate('user', 'username').populate('problem', 'name');

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

const getContestForAdminEdit = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id).populate('problems');
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }
        res.status(200).json(contest);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
  getAllContests,
  getContestById,
  createContest,
  updateContest,
  deleteContest,
  registerForContest,
  getContestParticipants,
  getContestLeaderboard,
  getContestForAdminEdit
};