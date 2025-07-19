const { getProblems, createProblem, getProblemById } = require('../controllers/problemController');

const express = require('express');
const router = express.Router();

router.route('/').get(getProblems).post(createProblem);
router.route('/:id').get(getProblemById);

module.exports = router;