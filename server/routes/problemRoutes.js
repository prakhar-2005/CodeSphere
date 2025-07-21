const { getProblems, createProblem, getProblemById, updateProblem, deleteProblem } = require('../controllers/problemController');

const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(getProblems).post(createProblem);
router.route('/:id').get(getProblemById);

router.route('/').post(protect, authorize('admin'), createProblem); 
router.route('/:id')
    .delete(protect, authorize('admin'), deleteProblem)
    .put(protect, authorize('admin'), updateProblem); 

module.exports = router;