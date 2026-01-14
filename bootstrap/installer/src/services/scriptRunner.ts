import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ScriptResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

export interface ScriptOptions {
  onOutput?: (data: string, type: 'stdout' | 'stderr') => void;
  onProgress?: (progress: number) => void;
  cwd?: string;
  timeout?: number;
}

/**
 * Execute a PowerShell script on Windows
 */
export async function runPowerShellScript(
  scriptPath: string,
  options: ScriptOptions = {}
): Promise<ScriptResult> {
  const startTime = Date.now();
  const { onOutput, cwd } = options;

  return new Promise((resolve, reject) => {
    const ps = spawn(
      'powershell.exe',
      ['-ExecutionPolicy', 'Bypass', '-File', scriptPath],
      { cwd, shell: true }
    );

    let stdout = '';
    let stderr = '';

    ps.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      onOutput?.(output, 'stdout');
    });

    ps.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      onOutput?.(output, 'stderr');
    });

    ps.on('close', (code) => {
      const duration = Date.now() - startTime;
      resolve({
        stdout,
        stderr,
        exitCode: code || 0,
        duration,
      });
    });

    ps.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Execute a Bash script in WSL
 */
export async function runWSLScript(
  scriptPath: string,
  options: ScriptOptions = {}
): Promise<ScriptResult> {
  const startTime = Date.now();
  const { onOutput } = options;

  // First, copy script to WSL temp directory
  const tempPath = `/tmp/nyra-bootstrap-${Date.now()}.sh`;
  await execAsync(`wsl cp "${scriptPath}" "${tempPath}"`);
  await execAsync(`wsl chmod +x "${tempPath}"`);

  return new Promise((resolve, reject) => {
    const wsl = spawn('wsl', ['bash', tempPath]);

    let stdout = '';
    let stderr = '';

    wsl.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      onOutput?.(output, 'stdout');
    });

    wsl.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      onOutput?.(output, 'stderr');
    });

    wsl.on('close', (code) => {
      // Cleanup temp file
      execAsync(`wsl rm "${tempPath}"`).catch(() => {});

      const duration = Date.now() - startTime;
      resolve({
        stdout,
        stderr,
        exitCode: code || 0,
        duration,
      });
    });

    wsl.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Execute a command in PowerShell
 */
export async function runPowerShellCommand(
  command: string,
  options: ScriptOptions = {}
): Promise<ScriptResult> {
  const startTime = Date.now();
  const { cwd } = options;

  try {
    const { stdout, stderr } = await execAsync(
      `powershell.exe -Command "${command}"`,
      { cwd }
    );
    const duration = Date.now() - startTime;

    return {
      stdout,
      stderr,
      exitCode: 0,
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || error.message,
      exitCode: error.code || 1,
      duration,
    };
  }
}

/**
 * Execute a command in WSL
 */
export async function runWSLCommand(
  command: string,
  options: ScriptOptions = {}
): Promise<ScriptResult> {
  const startTime = Date.now();

  try {
    const { stdout, stderr } = await execAsync(`wsl bash -c "${command}"`);
    const duration = Date.now() - startTime;

    return {
      stdout,
      stderr,
      exitCode: 0,
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || error.message,
      exitCode: error.code || 1,
      duration,
    };
  }
}

/**
 * Check if WSL is installed and accessible
 */
export async function checkWSLAvailable(): Promise<boolean> {
  try {
    const result = await runWSLCommand('echo "test"');
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

/**
 * Check PowerShell version
 */
export async function getPowerShellVersion(): Promise<string> {
  try {
    const result = await runPowerShellCommand('$PSVersionTable.PSVersion.ToString()');
    return result.stdout.trim();
  } catch {
    return 'Unknown';
  }
}
