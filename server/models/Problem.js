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
    timestamps: true, // Add createdAt and updatedAt fields automatically
    }
);

module.exports = mongoose.model('Problem', ProblemSchema);