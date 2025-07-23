const { exec } = require('child_process');
const path = require('path');
const { generateFile } = require('./generateFile');
const { generateInputFile } = require('./generateInputFile');

const runCode = async ({ code, language, input }) => {
  const fileExtension = { python: 'py', c: 'c', cpp: 'cpp', java: 'java' }[language];
  if (!fileExtension) throw new Error('Unsupported language.');

  let className;
  if (language === 'java') {
    const match = code.match(/public\s+class\s+(\w+)/);
    if (match) className = match[1];
  }

  const filePath = await generateFile(fileExtension, code, className);
  const inputPath = await generateInputFile(input || '');
  const classBaseName = language === 'java' ? path.basename(filePath, '.java') : null;
  const dirName = path.dirname(filePath);

  let compileCommand;
  let command;
  switch (language) {
    case 'python':
      command = `python ${filePath} < ${inputPath}`;
      break;
    case 'c':
      compileCommand = `gcc ${filePath} -o ${filePath}.out`;
      command = `${filePath}.out < ${inputPath}`;
      break;
    case 'cpp':
      compileCommand = `g++ ${filePath} -o ${filePath}.out`;
      command = `${filePath}.out < ${inputPath}`;
      break;
    case 'java':
      compileCommand = `javac ${filePath} -d ${dirName}`;
      command = `java -classpath ${dirName} ${classBaseName} < ${inputPath}`;
      break;
  }

  const execute = (cmd) => {
    return new Promise((resolve, reject) => {
      exec(cmd, { timeout: 5000 }, (error, stdout, stderr) => {
        if (error) {
          reject({ error, stdout, stderr });
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  };

  try {
    if (compileCommand) {
      await execute(compileCommand); 
    }
    const { stdout, stderr } = await execute(command);
    return { output: stdout, error: stderr, status: 'Success' };
  } catch (err) {
    const isCompileErr = compileCommand && err.stderr;
    return {
      output: '',
      error: `${isCompileErr ? 'Compilation Error' : 'Runtime Error'}:\n${err.stderr || err.error.message}`,
      status: isCompileErr ? 'Compilation Error' : 'Runtime Error',
    };
  }
};

const judgeSubmission = async ({ code, language, testCases, timeLimit }) => {
  const fileExtension = { python: 'py', c: 'c', cpp: 'cpp', java: 'java' }[language];
  if (!fileExtension) throw new Error('Unsupported language.');

  let className;
  if (language === 'java') {
    const match = code.match(/public\s+class\s+(\w+)/);
    if (match) className = match[1];
  }

  const filePath = await generateFile(fileExtension, code, className);
  const dirName = path.dirname(filePath);
  const classBaseName = language === 'java' ? path.basename(filePath, '.java') : null;

  let compileCommand;
  switch (language) {
    case 'c':
      compileCommand = `gcc ${filePath} -o ${filePath}.out`;
      break;
    case 'cpp':
      compileCommand = `g++ ${filePath} -o ${filePath}.out`;
      break;
    case 'java':
      compileCommand = `javac ${filePath} -d ${dirName}`;
      break;
  }

  const execute = (cmd) => {
    return new Promise((resolve, reject) => {
      exec(cmd, { timeout: timeLimit }, (error, stdout, stderr) => {
        if (error) reject({ error, stdout, stderr });
        else resolve({ stdout, stderr });
      });
    });
  };

  if (compileCommand) {
    try {
      await execute(compileCommand);
    } catch (err) {
      return {
        verdict: 'Compilation Error',
        testResults: [{
          testCase: 1,
          status: 'Compilation Error',
          error: err.stderr || err.error.message,
        }],
        failedCaseIndex: 0,
      };
    }
  }

  let verdict = 'Accepted';
  const results = [];
  let failedCaseIndex;

  for (const [index, testCase] of testCases.entries()) {
    const inputPath = await generateInputFile(testCase.input);
    let command;
    switch (language) {
      case 'python':
        command = `python ${filePath} < ${inputPath}`;
        break;
      case 'c':
      case 'cpp':
        command = `${filePath}.out < ${inputPath}`;
        break;
      case 'java':
        command = `java -classpath ${dirName} ${classBaseName} < ${inputPath}`;
        break;
    }

    try {
      const { stdout } = await execute(command);
      const actualOutput = stdout.trim();
      const expectedOutput = testCase.output.trim();

      const testStatus = actualOutput === expectedOutput ? 'Passed' : 'Wrong Answer';
      if (testStatus !== 'Passed') {
        if (!failedCaseIndex) failedCaseIndex = index;
        verdict = 'Wrong Answer';
      }

      results.push({
        testCase: index + 1,
        status: testStatus,
        actualOutput,
        expectedOutput,
        error: '',
      });

      if (verdict !== 'Accepted') break;
    } catch (err) {
      const testStatus = err.error?.killed ? 'Time Limit Exceeded' : 'Runtime Error';
      verdict = testStatus;
      if (failedCaseIndex === undefined) failedCaseIndex = index;

      results.push({
        testCase: index + 1,
        status: testStatus,
        actualOutput: '',
        expectedOutput: testCase.output.trim(),
        error: err.stderr || err.error.message || '',
      });

      break;
    }
  }

  return { verdict, testResults: results, failedCaseIndex };
};

module.exports = {
  runCode,
  judgeSubmission,
};