const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const axios = require('axios');

const runCode = async (req, res) => {
  const { code, language, customInput } = req.body;
  if (!code || !language) return res.status(400).json({ message: 'Code and language are required.' });

  try {
    
    const response = await axios.post(`${process.env.COMPILER_BASE_URL}/run`, {
      code,
      language,
      input: customInput || '',
    });

    return res.status(200).json(response.data);
  } catch (err) {
    console.error('Error calling compiler service:', err.message);
    return res.status(500).json({ message: 'Error calling compiler service.', error: err.message });
  }
};

const submitCode = async (req, res) => {
  const { problemId, code, language } = req.body;
  const userId = req.user._id;

  if (!problemId || !code || !language) {
    return res.status(400).json({ message: 'Problem ID, code, and language are required.' });
  }
  if (!mongoose.Types.ObjectId.isValid(problemId)) {
    return res.status(400).json({ message: 'Invalid problem ID format.' });
  }

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found.' });
    const { testCases, timeLimit } = problem;

    const response = await axios.post(`${process.env.COMPILER_BASE_URL}/judge`, {
      code,
      language,
      testCases,
      timeLimit,
    });

    const { verdict, testResults, failedCaseIndex } = response.data;

    await Submission.create({
      userId,
      problemId,
      contestId: req.body.contestId || null,
      language,
      code,
      status: verdict,
      isContestSubmission: !!req.body.contestId,
      failedCaseIndex,
      testResults,
    });

    res.status(200).json({
      message: 'Submission judged successfully.',
      verdict,
      failedCaseIndex,
      testResults,
    });
  } catch (error) {
    console.error('Error during code submission judging:', error.message);
    res.status(500).json({ message: 'Error during judging.', error: error.message });
  }
};

const getUserSubmissionsForProblem = async (req, res) => {
  const { problemId } = req.params;
  const userId = req.user._id;

  // pagination params
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!mongoose.Types.ObjectId.isValid(problemId)) {
    return res.status(400).json({ message: 'Invalid problem ID format.' });
  }

  try {
    const total = await Submission.countDocuments({
      userId,
      problemId,
    });

    const submissions = await Submission.find({
      userId,
      problemId,
    })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit) 
      .select('-__v') // remove metadata
      .populate('problemId', 'name') 
      .populate('userId', 'username'); 

    res.status(200).json({ 
      submissions,
      total,
      page,
      totalPages: Math.ceil(total / limit)
     });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Server error while fetching submissions.' });
  }
};

module.exports = {
  runCode,
  submitCode,
  getUserSubmissionsForProblem,
};