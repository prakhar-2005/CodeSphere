const Problem = require("../models/Problem");
const mongoose = require('mongoose');

const getProblems = async (req, res) => {
    try {
        const { tags, difficulty, sort } = req.query;

        const query = {};

        if (tags) {
            const tagsArray = tags.split(',').map(tag => tag.trim());
            query.tags = { $in: tagsArray };
        }

        if (difficulty && difficulty !== 'All') {
            query.difficulty = difficulty;
        }

        let problemsQuery = Problem.find(query);

        if (sort === 'rating-asc') {
            problemsQuery = problemsQuery.sort({ rating: 1 });
        } else if (sort === 'rating-desc') {
            problemsQuery = problemsQuery.sort({ rating: -1 });
        }

        const problems = await problemsQuery;
        res.status(200).json(problems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


const getProblemById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid problem ID format' });
        }

        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        res.status(200).json(problem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getAllTags = async (req, res) => {
    try {
        const tags = await Problem.distinct("tags");
        res.status(200).json(tags);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error while fetching tags' });
    }
};

const createProblem = async (req, res) => {
    try {
        const {
            name,
            description,
            inputFormat,
            outputFormat,
            sampleTestCases,
            testCases,
            timeLimit,
            memoryLimit,
            constraints,
            tags,
            difficulty,
            rating,
        } = req.body;

        if (!name || !description || !inputFormat || !outputFormat || !constraints || !tags || !difficulty || !testCases || !timeLimit || !memoryLimit) {
            return res.status(400).json({ message: 'Please enter all required fields' });
        }

        const problem = await Problem.create({
            name,
            description,
            inputFormat,
            outputFormat,
            sampleTestCases,
            testCases,
            timeLimit,
            memoryLimit,
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

const updateProblem = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid problem ID format' });
        }
        const { id } = req.params;
        const updatedData = req.body;
        const problem = await Problem.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

        if (!problem) {
            return res.status(404).json({ message: 'Problem not found.' });
        }

        res.status(200).json({ message: 'Problem updated successfully', problem });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: getMongooseErrorMessage(error) });
    }
};

const deleteProblem = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid problem ID format' });
        }
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        await Problem.deleteOne({ _id: req.params.id });

        res.status(200).json({ message: 'Problem removed successfully', id: req.params.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during deletion.' });
    }
};

module.exports = {
    getProblems,
    createProblem,
    getProblemById,
    deleteProblem,
    updateProblem,
    getAllTags,
};