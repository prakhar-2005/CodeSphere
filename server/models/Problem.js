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
    testCases: [ 
      {
        input: {
          type: String,
          required: true,
        },
        output: {
          type: String,
          required: true,
        },
        // You could add more fields here like 'isSample' if you wanted to combine
        // sample and hidden test cases into one array, but separating is clearer.
      },
    ],
    timeLimit: {
      type: Number,
      required: [true, 'Please add a time limit in milliseconds'],
      min: [1000, 'Time limit must be at least 1000ms'], 
    },
    memoryLimit: { // Memory limit in megabytes (e.g., 256 for 256MB)
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
    },
    {
    timestamps: true, 
    }
);

module.exports = mongoose.model('Problem', ProblemSchema);