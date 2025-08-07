const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  isContestSubmission: {
    type: Boolean,
    default: false,
  },
  testResults: [
    {
      testCase: Number,
      status: String,
      actualOutput: String,
      expectedOutput: String,
      error: String,
    }
  ],
  failedCaseIndex: {
    type: Number,
    default: null,
  },
  contest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    default: null,
  },
});

const Submission = mongoose.model("Submission", submissionSchema);

module.exports = Submission;