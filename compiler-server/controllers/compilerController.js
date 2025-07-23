const { runCode, judgeSubmission } = require('../utils/judge');

const runHandler = async (req, res) => {
  const { code, language, input } = req.body;
  try {
    const result = await runCode({ code, language, input });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to execute code', details: err.message });
  }
};

const judgeHandler = async (req, res) => {
  const { code, language, testCases, timeLimit = 5000 } = req.body;
  try {
    const result = await judgeSubmission({ code, language, testCases, timeLimit });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Judging failed', details: err.message });
  }
};

module.exports = {
  runHandler,
  judgeHandler,
};