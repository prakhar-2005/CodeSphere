const { getProblems, createProblem, getProblemById, updateProblem, deleteProblem, getAllTags, getProblemForAdminEdit, getAllProblemsForAdmin } = require('../controllers/problemController');
const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/tags', getAllTags); 

router.get('/', getProblems);
router.post('/', protect, authorize('admin'), createProblem);

router.get('/admin', protect, authorize('admin'), getAllProblemsForAdmin);
router.route('/:id')
    .get(getProblemById)
    .delete(protect, authorize('admin'), deleteProblem)
    .put(protect, authorize('admin'), updateProblem);
router.get('/edit/:id', protect, authorize('admin'), getProblemForAdminEdit);

module.exports = router;