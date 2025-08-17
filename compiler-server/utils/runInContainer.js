const fs = require('fs/promises');
const path = require('path');
const { v4: uuid } = require('uuid');
const Docker = require('dockerode');

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock' });
const TEMP_BASE = process.env.TEMP_BASE || '/var/codesphere/temp'; 
const COMPILER_IMAGE = process.env.COMPILER_IMAGE || 'codesphere-compiler:latest';

function parseDockerLogs(buffer) {
    let offset = 0;
    let result = '';

    while (offset < buffer.length) {
        const streamType = buffer[offset];
        const payloadSize = buffer.readUInt32BE(offset + 4);
        
        offset += 8;
        const payload = buffer.toString('utf8', offset, offset + payloadSize);
        result += payload;
        offset += payloadSize;
    }
    return result;
}

const getHostPath = (containerPath) => {
    const HOST_BASE = process.env.HOST_TEMP_BASE;
    const CONTAINER_BASE = process.env.TEMP_BASE;
    return containerPath.replace(CONTAINER_BASE, HOST_BASE);
};

const mbToBytes = (mb) => mb * 1024 * 1024;

async function ensureImage(image) {
  try {
    await docker.getImage(image).inspect();
    return;
  } catch (err) {
    await new Promise((resolve, reject) => {
      docker.pull(image, (pullErr, stream) => {
        if (pullErr) return reject(pullErr);
        docker.modem.followProgress(stream, (followErr) => {
          if (followErr) reject(followErr);
          else resolve();
        });
      });
    });
  }
}

async function createTempJobDir(jobId) {
  const dir = path.join(TEMP_BASE, jobId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

async function removeTempDir(dir) {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch (e) {
    console.error('Failed to remove temp dir', dir, e.message);
  }
}

async function runContainerAndWait(container, timeLimitMs) {
  await container.start();

  let timedOut = false;
  const timeout = setTimeout(async () => {
    timedOut = true;
    try { await container.kill({ signal: 'SIGKILL' }); } catch (e) { /* ignore */ }
  }, timeLimitMs);

  const waitResult = await container.wait(); 
  clearTimeout(timeout);

  const logsBuf = await container.logs({ stdout: true, stderr: true, timestamps: false });
  const logs = parseDockerLogs(logsBuf);
  const info = await container.inspect();

  return {
    timedOut,
    exitCode: waitResult.StatusCode,
    logs,
    oomKilled: info.State && info.State.OOMKilled,
  };
}

async function runInContainer({ language, code, input = '', timeLimit = 2000, memoryLimit = 256 }) {
  const jobId = uuid();
  const jobDir = await createTempJobDir(jobId);
  const hostJobDir = getHostPath(jobDir);

  let fileName, compileCmd, runCmd, needsCompile = true;
  switch (language) {
    case 'cpp':
      fileName = 'main.cpp';
      compileCmd = 'g++ main.cpp -O2 -std=gnu++17 -o main.out';
      runCmd = './main.out < input.txt';
      break;
    case 'c':
      fileName = 'main.c';
      compileCmd = 'gcc main.c -O2 -std=gnu11 -o main.out';
      runCmd = './main.out < input.txt';
      break;
    case 'python':
      fileName = 'main.py';
      compileCmd = ''; 
      runCmd = 'python3 main.py < input.txt';
      needsCompile = false;
      break;
    case 'java':
      fileName = 'Main.java';
      compileCmd = 'javac Main.java';
      runCmd = 'java Main < input.txt';
      break;
    default:
      await removeTempDir(jobDir);
      throw new Error('Unsupported language');
  }

  const codePath = path.join(jobDir, fileName);
  const inputPath = path.join(jobDir, 'input.txt');
  await fs.writeFile(codePath, code);
  await fs.writeFile(inputPath, input);

  const memBytes = mbToBytes(memoryLimit); 
  const nanoCpus = Math.floor(0.5 * 1e9); 
  const hostBind = `${hostJobDir}:/app`;

  try {
    await ensureImage(COMPILER_IMAGE);

    if (needsCompile && compileCmd) {
      const compileContainer = await docker.createContainer({
        Image: COMPILER_IMAGE,
        Cmd: ['/bin/sh', '-c', compileCmd],
        WorkingDir: '/app',
        HostConfig: {
          Binds: [hostBind],
          Memory: memBytes,
          NanoCpus: nanoCpus,
          PidsLimit: 64,
        },
      });

      const compileTimeLimitMs = Math.max(10000, timeLimit); 
      const compileResult = await runContainerAndWait(compileContainer, compileTimeLimitMs);

      try { await compileContainer.remove({ force: true }); } catch (e) { /* ignore */ }

      if (compileResult.timedOut) {
        await removeTempDir(jobDir);
        return { success: false, output: 'Compile Time Limit Exceeded', errorType: 'Compiler Error' };
      }
      if (compileResult.exitCode !== 0) {
        await removeTempDir(jobDir);
        return { success: false, output: compileResult.logs || 'Compilation failed', errorType: 'Compiler Error' };
      }
    }

    const runContainer = await docker.createContainer({
      Image: COMPILER_IMAGE,
      Cmd: ['/bin/sh', '-c', runCmd],
      WorkingDir: '/app',
      HostConfig: {
        Binds: [hostBind],
        Memory: memBytes,
        NanoCpus: nanoCpus,
        PidsLimit: 64,
      },
    });

    const runResult = await runContainerAndWait(runContainer, timeLimit);

    try { await runContainer.remove({ force: true }); } catch (e) { /* ignore */ }

    if (runResult.timedOut) {
      await removeTempDir(jobDir);
      return { success: false, output: 'Time Limit Exceeded', errorType: 'Time Limit Exceeded' };
    }
    if (runResult.oomKilled || runResult.exitCode === 137) {
      await removeTempDir(jobDir);
      return { success: false, output: 'Memory Limit Exceeded', errorType: 'Memory Limit Exceeded' };
    }

    if (runResult.exitCode !== 0) {
      await removeTempDir(jobDir);
      return { success: false, output: runResult.logs || 'Runtime Error', errorType: 'Runtime Error' };
    }

    await removeTempDir(jobDir);
    return { success: true, output: runResult.logs || '', errorType: null };
  } catch (err) {
    await removeTempDir(jobDir);
    return { success: false, output: `Internal error: ${err.message}`, errorType: 'Internal Error' };
  }
}

module.exports = runInContainer;