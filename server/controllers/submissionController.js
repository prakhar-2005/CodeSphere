const { exec } = require('child_process');
const path = require('path');
const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const { generateFile } = require('../utils/generateFile');
const { generateInputFile } = require('../utils/generateInputFile');

const TEMP_DIR = path.join(__dirname, '..', 'temp');

const executeCode = async (filePath, language, inputPath, res) => {
  let command;
  let timeout = 5000;
  let compileCommand;

  const className = language === 'java' ? path.basename(filePath, '.java') : null;
  const dirName = path.dirname(filePath);

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
      command = `java -classpath ${dirName} ${className} < ${inputPath}`;
      break;
    default:
      return res.status(400).json({ message: 'Unsupported language.' });
  }

  const execute = (cmd, callback) => {
    exec(cmd, { timeout }, (error, stdout, stderr) => {
      callback(error, stdout, stderr);
    });
  };

  if (compileCommand) {
    exec(compileCommand, { timeout: 10000 }, (compileError, _, compileStderr) => {
      if (compileError) {
        return res.status(200).json({
          output: '',
          error: `Compilation Error:\n${compileStderr || compileError.message}`,
          status: 'Compilation Error',
        });
      }
      execute(command, (execError, stdout, stderr) => {
        if (execError) {
          return res.status(200).json({
            output: '',
            error: `Runtime Error:\n${stderr || execError.message}`,
            status: 'Runtime Error',
          });
        }
        res.status(200).json({ output: stdout, error: stderr, status: 'Success' });
      });
    });
  } else {
    execute(command, (execError, stdout, stderr) => {
      if (execError) {
        return res.status(200).json({
          output: '',
          error: `Runtime Error:\n${stderr || execError.message}`,
          status: 'Runtime Error',
        });
      }
      res.status(200).json({ output: stdout, error: stderr, status: 'Success' });
    });
  }
};

const runCode = async (req, res) => {
  const { code, language, customInput } = req.body;
  if (!code || !language) return res.status(400).json({ message: 'Code and language are required.' });

  try {
    const fileExtension = { python: 'py', c: 'c', cpp: 'cpp', java: 'java' }[language];
    if (!fileExtension) return res.status(400).json({ message: 'Unsupported language for execution.' });

    let className;
    if (language === 'java') {
      const match = code.match(/public\s+class\s+(\w+)/);
      if (match) className = match[1];
    }

    const filePath = await generateFile(fileExtension, code, className);
    const inputPath = await generateInputFile(customInput || '');

    await executeCode(filePath, language, inputPath, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during code execution.' });
  }
};

const submitCode = async (req, res) => {
  const { problemId, code, language } = req.body;
  const userId = req.user._id;

  if (!problemId || !code || !language) {
    return res.status(400).json({ message: 'Problem ID, code, and language are required.' });
  }
  if (!mongoose.Types.ObjectId.isValid(problemId)) {
    return res.status(400).json({ message: 'Invalid problem ID format.' });
  }

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found.' });

    const { testCases, timeLimit } = problem;
    const fileExtension = { python: 'py', c: 'c', cpp: 'cpp', java: 'java' }[language];

    let className;
    if (language === 'java') {
      const match = code.match(/public\s+class\s+(\w+)/);
      if (match) className = match[1];
    }

    const filePath = await generateFile(fileExtension, code, className);
    const results = [];
    let verdict = 'Accepted';

    for (const [index, testCase] of testCases.entries()) {
      const inputPath = await generateInputFile(testCase.input);
      let compileCommand, command;
      const className = language === 'java' ? path.basename(filePath, '.java') : null;
      const dirName = path.dirname(filePath);

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
          command = `java -classpath ${dirName} ${className} < ${inputPath}`;
          break;
        default:
          verdict = 'Unsupported language';
          break;
      }

      await new Promise((resolve) => {
        const execute = (cmd) => {
          exec(cmd, { timeout: timeLimit }, (execError, stdout, stderr) => {
            let testStatus = 'Passed';
            const actualOutput = stdout.trim();
            const expectedOutput = testCase.output.trim();

            if (execError || stderr || actualOutput !== expectedOutput) {
              if (execError?.killed && execError.signal === 'SIGTERM') {
                testStatus = 'Time Limit Exceeded';
                verdict = 'Time Limit Exceeded';
              } else if (execError || stderr) {
                testStatus = 'Runtime Error';
                verdict = 'Runtime Error';
              } else {
                testStatus = 'Wrong Answer';
                verdict = 'Wrong Answer';
              }
            }

            results.push({
              testCase: index + 1,
              status: testStatus,
              actualOutput,
              expectedOutput,
              error: stderr || execError?.message || '',
            });

            resolve();
          });
        };

        if (compileCommand) {
          exec(compileCommand, { timeout: 10000 }, (compileError, _, compileStderr) => {
            if (compileError) {
              verdict = 'Compilation Error';
              results.push({
                testCase: index + 1,
                status: 'Compilation Error',
                error: `Compilation Error:\n${compileStderr || compileError.message}`,
              });
              return resolve();
            }
            execute(command);
          });
        } else {
          execute(command);
        }
      });

      if (verdict !== 'Accepted') break;
    }

    res.status(200).json({
      message: 'Submission judged successfully.',
      verdict,
      testResults: results,
    });
  } catch (error) {
    console.error('Error during code submission judging:', error);
    res.status(500).json({ message: 'Server error during code submission judging.' });
  }
};

module.exports = {
  runCode,
  submitCode,
};