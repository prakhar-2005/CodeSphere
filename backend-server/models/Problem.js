const mongoose = require('mongoose');

const ProblemSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a problem name'],
        unique: true, 
        trim: true, 
    },
    description: {
        type: String,
        required: [true, 'Please add a problem description'],
    },
    inputFormat: {
        type: String,
        required: [true, 'Please add input format details'],
    },
    outputFormat: {
        type: String,
        required: [true, 'Please add output format details'],
    },
    sampleTestCases: [ 
        {
        input: {
            type: String,
            required: true,
        },
        output: {
            type: String,
            required: true,
        },
        },
    ],
    testCases: {
      type: [ 
        {
          input: {
            type: String,
            required: true,
          },
          output: {
            type: String,
            required: true,
          },
        },
      ],
      select: false, 
    },
    timeLimit: {
      type: Number,
      required: [true, 'Please add a time limit in milliseconds'],
      min: [1000, 'Time limit must be at least 1000ms'], 
    },
    memoryLimit: { 
      type: Number,
      required: [true, 'Please add a memory limit in megabytes'],
      min: [256, 'Memory limit must be at least 256MB'], 
    },
    constraints: {
        type: String,
        required: [true, 'Please add problem constraints'],
    },
    tags: {
        type: [String], 
        required: [true, 'Please add problem tags'],
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'], 
        required: [true, 'Please add problem difficulty'],
    },
    rating: { 
        type: Number,
        default: 0, 
    },
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contest',
      default: null
    }
    },
    {
    timestamps: true, 
    }
);

module.exports = mongoose.model('Problem', ProblemSchema);