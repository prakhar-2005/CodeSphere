const { exec } = require('child_process');
const fs = require('fs/promises');
const path = require('path');
const { v4: uuid } = require('uuid');

const runInContainer = async ({ language, code, input, timeLimit, memoryLimit }) => {
    const jobId = uuid();
    const tempDir = path.join(__dirname, '..', 'temp', jobId);
    await fs.mkdir(tempDir, { recursive: true });

    let fileName, compileCmd, runCmd, binaryName;

    switch (language) {
        case 'cpp':
            fileName = 'main.cpp';
            binaryName = 'main.out';
            compileCmd = `g++ ${fileName} -o ${binaryName}`;
            runCmd = `./${binaryName} < input.txt`;
            break;
        case 'c':
            fileName = 'main.c';
            binaryName = 'main.out';
            compileCmd = `gcc ${fileName} -o ${binaryName}`;
            runCmd = `./${binaryName} < input.txt`;
            break;
        case 'python':
            fileName = 'main.py';
            compileCmd = '';
            runCmd = `python3 ${fileName} < input.txt`;
            break;
        case 'java':
            fileName = 'Main.java';
            binaryName = 'Main.class';
            compileCmd = 'javac Main.java';
            runCmd = `java Main < input.txt`;
            break;
        default:
            await fs.rm(tempDir, { recursive: true, force: true });
            throw new Error('Unsupported language');
    }

    const filePath = path.join(tempDir, fileName);
    await fs.writeFile(filePath, code);

    const inputPath = path.join(tempDir, 'input.txt');
    await fs.writeFile(inputPath, input);

    const dockerBase = [
        'docker run --rm',
        `--memory="${memoryLimit}m"`,
        `--cpus="0.5"`,
        '--pids-limit=64',
        `-v "${tempDir}:/app"`,
        `--workdir="/app"`,
        'codesphere-compiler',
        'sh -c'
    ];

    // Compile
    if (compileCmd) {
        const compileDockerCmd = [...dockerBase];
        compileDockerCmd.push(`"${compileCmd}"`);
        const compileFullCmd = compileDockerCmd.join(' ');

        const compileResult = await new Promise((resolve) => {
            exec(compileFullCmd, (err, stdout, stderr) => {
                if (err) {
                    resolve({
                        success: false,
                        stage: 'compile',
                        output: stderr || err.message,
                    });
                } else {
                    resolve({ success: true });
                }
            });
        });

        if (!compileResult.success) {
            await fs.rm(tempDir, { recursive: true, force: true });
            return {
                success: false,
                output: compileResult.output,
                errorType: 'Compiler Error',
            };
        }
    }

    // Execute
    const runDockerCmd = [
        ...dockerBase,
        `"ulimit -t ${Math.ceil(timeLimit / 1000)} && ulimit -v ${memoryLimit * 1024} && timeout ${Math.ceil(timeLimit / 1000)}s ${runCmd}"`
    ].join(' ');

    return new Promise((resolve) => {
        exec(runDockerCmd, async (err, stdout, stderr) => {
            try {
                await fs.rm(tempDir, { recursive: true, force: true });
                console.log(`🧹 Temp directory ${tempDir} deleted successfully.`);
            } catch (e) {
                console.error(`❌ Failed to delete temp directory ${tempDir}:`, e.message);
            }

            if (err) {
                const errorText = (stderr || err.message || '').toLowerCase();
                const exitCode = err.code;

                if (
                    errorText.includes('timeout') ||
                    errorText.includes('timed out') ||
                    errorText.includes('command terminated') ||
                    exitCode === 124
                ) {
                    return resolve({
                        success: false,
                        output: 'Time Limit Exceeded',
                        errorType: 'Time Limit Exceeded',
                    });
                }

                if (
                    errorText.includes('killed') ||
                    errorText.includes('memory') ||
                    errorText.includes('signal') ||
                    exitCode === 137
                ) {
                    return resolve({
                        success: false,
                        output: 'Memory Limit Exceeded',
                        errorType: 'Memory Limit Exceeded',
                    });
                }


                return resolve({
                    success: false,
                    output: stderr || err.message,
                    errorType: 'Runtime Error',
                });
            }


            return resolve({
                success: true,
                output: stdout,
            });
        });
    });

};

module.exports = runInContainer;