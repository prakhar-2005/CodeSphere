const Problem = require("../models/Problem");

const getProblems = async (req, res) => {
    try {
        const problems = await Problem.find({}); 
        res.status(200).json(problems); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const createProblem = async (req, res) => {
    try {
    // Destructure problem fields from request body
        const {
            name,
            description,
            inputFormat,
            outputFormat,
            sampleTestCases,
            constraints,
            tags,
            difficulty,
            rating,
        } = req.body;

        if (!name || !description || !inputFormat || !outputFormat || !constraints || !tags || !difficulty) {
            return res.status(400).json({ message: 'Please enter all required fields' });
        }

        const problem = await Problem.create({
            name,
            description,
            inputFormat,
            outputFormat,
            sampleTestCases,
            constraints,
            tags,
            difficulty,
            rating,
        });

        res.status(201).json(problem); 
    } catch (error) {
        if (error.code === 11000) { // MongoDB duplicate key error code
            return res.status(400).json({ message: 'Problem with this name already exists' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getProblems,
    createProblem,
};