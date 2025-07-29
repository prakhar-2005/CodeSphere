const express = require('express');
const { simplifyProblem, generateBoilerplate, analyzeTimeComplexity } = require('../controllers/aiController');
const router = express.Router();

router.post('/simplify-problem', simplifyProblem);
router.post('/generate-boilerplate', generateBoilerplate);
router.post('/analyze-time-complexity', analyzeTimeComplexity)

module.exports = router;