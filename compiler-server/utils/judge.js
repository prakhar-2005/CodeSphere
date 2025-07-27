const fs = require('fs/promises');
const { generateFile } = require('./generateFile');
const { generateInputFile } = require('./generateInputFile');
const runInContainer = require('./runInContainer'); 

const runCode = async ({ code, language, input, timeLimit, memoryLimit }) => {
  const extension = { python: 'py', c: 'c', cpp: 'cpp', java: 'java' }[language];
  if (!extension) throw new Error('Unsupported language.');

  let className;
  if (language === 'java') {
    const match = code.match(/public\s+class\s+(\w+)/);
    if (match) className = match[1];
  }

  const filePath = await generateFile(extension, code, className);
  const inputPath = await generateInputFile(input || '');
  const inputData = await fs.readFile(inputPath, 'utf8');

  let result;
  try {
    result = await runInContainer({ 
      language, 
      code, 
      input: inputData,
      timeLimit,
      memoryLimit
    });
  } finally {
    // Cleanup
    await fs.unlink(filePath).catch(() => {});
    await fs.unlink(inputPath).catch(() => {});
  }

  let status = 'Success';
  let errorMessage = '';

  if (!result.success) {
    const lowerError = result.output.toLowerCase();

    if (
      lowerError.includes('timed out') || 
      lowerError.includes('time limit') || 
      lowerError.includes('timeout') || 
      lowerError.includes('time limit exceeded')
    ) {
      status = 'Time Limit Exceeded';
    } else if (
      lowerError.includes('memory') || 
      lowerError.includes('killed') || 
      lowerError.includes('mle') || 
      lowerError.includes('out of memory')
    ) {
      status = 'Memory Limit Exceeded';
    } else {
      status = 'Runtime Error';
    }

    errorMessage = result.output;
  }

  return {
    output: result.success ? result.output : '',
    error: result.success ? '' : errorMessage,
    status,
  };
};

const judgeSubmission = async ({ code, language, testCases, timeLimit, memoryLimit }) => {
  const extension = { python: 'py', c: 'c', cpp: 'cpp', java: 'java' }[language];
  if (!extension) throw new Error('Unsupported language.');

  let className;
  if (language === 'java') {
    const match = code.match(/public\s+class\s+(\w+)/);
    if (match) className = match[1];
  }

  const filePath = await generateFile(extension, code, className);
  const results = [];
  let verdict = 'Accepted';
  let failedCaseIndex;

  for (const [index, testCase] of testCases.entries()) {
    const inputPath = await generateInputFile(testCase.input);
    const inputData = await fs.readFile(inputPath, 'utf8');

    let result;
    try {
      result = await runInContainer({ 
        language, 
        code, 
        input: inputData,
        timeLimit,
        memoryLimit
      });
    } finally {
      // Cleanup
      await fs.unlink(filePath).catch(() => {});
      await fs.unlink(inputPath).catch(() => {});
    }

    const actualOutput = result.output.trim();
    const expectedOutput = testCase.output.trim();

    let status = 'Passed';
    if (!result.success) {
      const lowerError = result.output.toLowerCase();

      if (
        lowerError.includes('timed out') ||
        lowerError.includes('time limit') ||
        lowerError.includes('timeout') ||
        lowerError.includes('time limit exceeded')
      ) {
        status = 'Time Limit Exceeded';
        verdict = 'Time Limit Exceeded';
      } else if (
        lowerError.includes('memory') ||
        lowerError.includes('killed') ||
        lowerError.includes('mle') ||
        lowerError.includes('out of memory')
      ) {
        status = 'Memory Limit Exceeded';
        verdict = 'Memory Limit Exceeded';
      } else {
        status = 'Runtime Error';
        verdict = 'Runtime Error';
      }
    } else if (actualOutput !== expectedOutput) {
      status = 'Wrong Answer';
      verdict = 'Wrong Answer';
    }

    if (status !== 'Passed' && failedCaseIndex === undefined) {
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