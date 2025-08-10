const { getProblems, createProblem, getProblemById, updateProblem, deleteProblem, getAllTags, getProblemForAdminEdit } = require('../controllers/problemController');
const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/tags', getAllTags); 

router.route('/')
    .get(getProblems)
    .post(protect, authorize('admin'), createProblem);

router.get('/:id', getProblemById);
router.get('/edit/:id', protect, authorize('admin'), getProblemForAdminEdit);

router.route('/:id')
    .delete(protect, authorize('admin'), deleteProblem)
    .put(protect, authorize('admin'), updateProblem); 

module.exports = router;