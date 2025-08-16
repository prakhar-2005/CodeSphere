const Docker = require('dockerode');
const fs = require('fs/promises');
const path = require('path');
const { v4: uuid } = require('uuid');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

async function runDocker(image, cmd, binds, workingDir, hostConfig = {}) {
    const options = {
        Image: image,
        Cmd: cmd,
        WorkingDir: workingDir,
        HostConfig: hostConfig,
        Tty: false,
    };

    const container = await docker.createContainer(options);
    await container.start();

    const stream = await container.logs({
        stdout: true,
        stderr: true,
        follow: true,
    });

    let stdout = '';
    let stderr = '';
    stream.on('data', chunk => {
        const log = chunk.toString();
        stdout += log;
    });

    const exitData = await container.wait();
    await container.remove();

    return { exitCode: exitData.StatusCode, stdout, stderr };
}

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

    const hostConfig = {
        Binds: [`${tempDir}:/app`],
        Memory: memoryLimit * 1024 * 1024,
        Cpus: 0.5,
        PidsLimit: 64,
    };

    try {
        // compile step
        if (compileCmd) {
            const compileRes = await runDocker(
                'codesphere-compiler:latest',
                ['sh', '-c', compileCmd],
                [`${tempDir}:/app`],
                '/app',
                hostConfig
            );

            if (compileRes.exitCode !== 0) {
                await fs.rm(tempDir, { recursive: true, force: true });
                return {
                    success: false,
                    output: `Compiler Error:\n${compileRes.stderr || compileRes.stdout}`,
                    errorType: 'Compiler Error',
                };
            }
        }

        // run step with limits
        const runCommand =
            `ulimit -t ${Math.ceil(timeLimit / 1000)} && ` +
            `ulimit -v ${memoryLimit * 1024} && ` +
            `timeout ${Math.ceil(timeLimit / 1000)}s ${runCmd}`;

        const runRes = await runDocker(
            'codesphere-compiler:latest',
            ['sh', '-c', runCommand],
            [`${tempDir}:/app`],
            '/app',
            hostConfig
        );

        if (runRes.exitCode !== 0) {
            const errorText = (runRes.stderr || runRes.stdout || '').toLowerCase();
            if (errorText.includes('timeout') || runRes.exitCode === 124) {
                return { success: false, output: 'Time Limit Exceeded', errorType: 'Time Limit Exceeded' };
            }
            if (errorText.includes('killed') || runRes.exitCode === 137) {
                return { success: false, output: 'Memory Limit Exceeded', errorType: 'Memory Limit Exceeded' };
            }
            return { success: false, output: runRes.stderr || runRes.stdout, errorType: 'Runtime Error' };
        }

        return { success: true, output: runRes.stdout };

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