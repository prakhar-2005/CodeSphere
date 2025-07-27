const { runCode, judgeSubmission } = require('../utils/judge');

const runHandler = async (req, res) => {
  const { code, language, input, timeLimit, memoryLimit } = req.body;
  try {
    const result = await runCode({ code, language, input, timeLimit, memoryLimit });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to execute code', details: err.message });
  }
};

const judgeHandler = async (req, res) => {
  const { code, language, testCases, timeLimit, memoryLimit } = req.body;
  try {
    const result = await judgeSubmission({ code, language, testCases, timeLimit, memoryLimit });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Judging failed', details: err.message });
  }
};

module.exports = {
  runHandler,
  judgeHandler,
};