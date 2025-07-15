const { getProblems, createProblem } = require('../controllers/problemController');

const express = require('express');
const router = express.Router();

router.route('/').get(getProblems).post(createProblem);

// router.route('/:id').get(getProblemById).put(updateProblem).delete(deleteProblem);

module.exports = router;