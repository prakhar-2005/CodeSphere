const { getProblems, createProblem, getProblemById, updateProblem, deleteProblem, getAllTags } = require('../controllers/problemController');

const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/tags', getAllTags); 

router.route('/')
    .get(getProblems)
    .post(protect, authorize('admin'), createProblem);

router.route('/:id')
    .get(getProblemById)
    .delete(protect, authorize('admin'), deleteProblem)
    .put(protect, authorize('admin'), updateProblem); 

module.exports = router;