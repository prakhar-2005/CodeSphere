const express = require('express');
const router = express.Router();
const { runHandler, judgeHandler } = require('../controllers/compilerController');

// Health check
router.get('/', (req, res) => {
  res.send('CodeSphere Compiler Server is running!');
});

router.post('/run', runHandler);
router.post('/judge', judgeHandler);

module.exports = router;