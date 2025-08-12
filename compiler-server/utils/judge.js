const runInContainer = require('./runInContainer');

const runCode = async ({ code, language, input, timeLimit, memoryLimit }) => {
  try {
    const result = await runInContainer({
      language,
      code,
      input,
      timeLimit,
      memoryLimit
    });

    return {
      output: result.success ? result.output : '',
      error: result.success ? '' : result.output,
      status: result.success ? 'Success' : result.errorType,
    };
  } catch (err) {
    return {
      output: '',
      error: `Error during code execution: ${err.message}`,
      status: 'Internal Error'
    };
  }
};

const judgeSubmission = async ({ code, language, testCases, timeLimit, memoryLimit }) => {
  const results = [];
  let verdict = 'Accepted';
  let failedCaseIndex;

  for (const [index, testCase] of testCases.entries()) {
    let result;
    try {
      result = await runInContainer({
        language,
        code,
        input: testCase.input,
        timeLimit,
        memoryLimit,
      });
    } catch (err) {
      return {
        verdict: 'Internal Error',
        testResults: [],
        failedCaseIndex: undefined,
        error: `Error during judging: ${err.message}`
      };
    }

    const actualOutput = result.output.trim();
    const expectedOutput = testCase.output.trim();

    let status;
    if (!result.success) {
      status = result.errorType;
    } else if (actualOutput !== expectedOutput) {
      status = 'Wrong Answer';
    } else {
      status = 'Passed';
    }

    if (status !== 'Passed' && failedCaseIndex === undefined) {
      verdict = status;
      failedCaseIndex = index;
    }

    results.push({
      testCase: index + 1,
      status,
      actualOutput: result.success ? actualOutput : '',
      expectedOutput,
      error: result.success ? '' : result.output,
    });

    if (status !== 'Passed') break;
  }

  return { verdict, testResults: results, failedCaseIndex };
};

module.exports = { runCode, judgeSubmission };