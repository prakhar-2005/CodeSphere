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
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contest", 
    default: null,
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
});

const Submission = mongoose.model("Submission", submissionSchema);

module.exports = Submission;