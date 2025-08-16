const Docker = require('dockerode');
const fs = require('fs/promises');
const path = require('path');
const { v4: uuid } = require('uuid');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

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

    const containerConfig = {
        Image: 'codesphere-compiler',
        Tty: true,
        HostConfig: {
            Binds: [`${tempDir}:/app`],
            Memory: memoryLimit * 1024 * 1024,
            Cpus: 0.5,
            PidsLimit: 64,
        },
        WorkingDir: '/app',
        Cmd: ['sh', '-c', ''],
    };

    let result;

    try {
        if (compileCmd) {
            containerConfig.Cmd[2] = compileCmd;
            const output = await docker.run(containerConfig.Image, containerConfig.Cmd, process.stdout, containerConfig.HostConfig);
            if (output.exitCode !== 0) {
                await fs.rm(tempDir, { recursive: true, force: true });
                return {
                    success: false,
                    output: `Compiler Error: ${output.output.stderr}`,
                    errorType: 'Compiler Error',
                };
            }
        }

        const runCommand = `ulimit -t ${Math.ceil(timeLimit / 1000)} && ulimit -v ${memoryLimit * 1024} && timeout ${Math.ceil(timeLimit / 1000)}s ${runCmd}`;
        containerConfig.Cmd[2] = runCommand;
        result = await docker.run(containerConfig.Image, containerConfig.Cmd, process.stdout, containerConfig.HostConfig);

        const { exitCode, output } = result;
        if (exitCode !== 0) {
            const errorText = (output.stderr || output.stdout || '').toLowerCase();
            if (errorText.includes('timeout') || exitCode === 124) {
                return { success: false, output: 'Time Limit Exceeded', errorType: 'Time Limit Exceeded' };
            }
            if (errorText.includes('killed') || exitCode === 137) {
                return { success: false, output: 'Memory Limit Exceeded', errorType: 'Memory Limit Exceeded' };
            }
            return { success: false, output: output.stderr, errorType: 'Runtime Error' };
        }

        return { success: true, output: output.stdout };

    } catch (err) {
        return {
            success: false,
            output: `Docker execution error: ${err.message}`,
            errorType: 'Internal Error',
        };
    } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
    }
};

module.exports = runInContainer;