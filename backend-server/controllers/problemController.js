const Problem = require("../models/Problem");
const mongoose = require('mongoose');
const Contest = require('../models/Contest');

// This function is for the public ProblemsPage
const getProblems = async (req, res) => {
    try {
        const { tags, difficulty, sort } = req.query;
        const now = new Date();
        const PENDING_CONTEST_ID = '000000000000000000000000'; // Special ID for pending contest problems

        // Find all contests that are currently ongoing or upcoming
        const activeContests = await Contest.find({ endTime: { $gte: now } });
        const activeContestIds = activeContests.map(c => c._id.toString());

        // Add the pending ID to the list to hide those problems
        activeContestIds.push(PENDING_CONTEST_ID);

        const query = {
            // A problem is public if its contestId is NOT in the list of active/pending contest IDs
            contestId: { $nin: activeContestIds.map(id => new mongoose.Types.ObjectId(id)) }
        };

        // Apply filters directly to the query
        if (tags) {
            const tagsArray = tags.split(',').map(tag => tag.trim());
            query.tags = { $in: tagsArray };
        }
        if (difficulty && difficulty !== 'All') {
            query.difficulty = difficulty;
        }

        let problemsQuery = Problem.find(query);

        // Apply sorting directly to the query
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

const getProblemForAdminEdit = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid problem ID format' });
        }

        const problem = await Problem.findById(req.params.id).select('+testCases');
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        res.status(200).json(problem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getAllProblemsForAdmin = async (req, res) => {
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
            name, description, inputFormat, outputFormat, sampleTestCases, testCases,
            timeLimit, memoryLimit, constraints, tags, difficulty, rating, contestId
        } = req.body;

        if (!name || !description || !inputFormat || !outputFormat || !constraints || !tags || !difficulty || !testCases || !timeLimit || !memoryLimit) {
            return res.status(400).json({ message: 'Please enter all required fields' });
        }

        const problem = await Problem.create({
            name, description, inputFormat, outputFormat, sampleTestCases, testCases,
            timeLimit, memoryLimit, constraints, tags, difficulty, rating, contestId
        });

        res.status(201).json(problem);
    } catch (error) {
        if (error.code === 11000) {
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
    getProblemForAdminEdit,
    deleteProblem,
    updateProblem,
    getAllTags,
    getAllProblemsForAdmin,
};