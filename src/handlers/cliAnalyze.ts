import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import os from 'os';

const CODACY_ACCOUNT_TOKEN = process.env.CODACY_ACCOUNT_TOKEN;
const CODACY_CLI_VERSION = process.env.CODACY_CLI_VERSION;

const CLI_FILE_NAME = 'cli.sh';
const CLI_FOLDER_NAME = '.codacy';
const CLI_LOCAL_COMMAND = `${CLI_FOLDER_NAME}/${CLI_FILE_NAME}`;
const CLI_GLOBAL_COMMAND = 'codacy-cli';

// Function to detect if user is on Windows
const isWindows = () => {
  const isWindows = os.platform() === 'win32';
  return isWindows;
};

const isWSL = async (): Promise<boolean> => {
  if (!isWindows()) return false;

  return new Promise((resolve) => {
    exec('wsl --list', (error) => {
      resolve(!error);
    });
  });
};

// Convert Windows path to WSL path
const convertToWslPath = async (windowsPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(`wsl wslpath -a "${windowsPath}"`, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      // Replace backslashes with forward slashes
      const sanitizedPath = stdout.trim().replace(/\\/g, '/');
      resolve(sanitizedPath);
    });
  });
};

// Set a larger buffer size (10MB)
const MAX_BUFFER_SIZE = 1024 * 1024 * 10;

const execAsync: (
  command: string,
  options: { rootPath: string }
) => Promise<{ stdout: string; stderr: string }> = async (
  command: string,
  options: { rootPath: string }
) => {
    const hasWsl = await isWSL();

    const cliVersion = hasWsl ? `export CODACY_CLI_V2_VERSION=${CODACY_CLI_VERSION} && ` : `CODACY_CLI_V2_VERSION=${CODACY_CLI_VERSION}`;

    return new Promise(async (resolve, reject) => {

      const execCommand = ` ${CODACY_CLI_VERSION ? cliVersion : ''}${command}`;
      exec(
        `${hasWsl ? `wsl bash -c "${execCommand}"` : execCommand}`,
        {
          cwd: options.rootPath,
          maxBuffer: MAX_BUFFER_SIZE, // To solve: stdout maxBuffer exceeded
        },
        (error, stdout, stderr) => {
          console.error('execCommand', execCommand);
          console.error('cwd', options.rootPath);
           console.error('stdout', stdout);
          console.error('stderr', stderr);
          if (error) {
            reject(error);
            return;
          }

          if (stderr && !stdout) {
            reject(new Error(stderr));
            return;
          }

          resolve({ stdout, stderr });
        }
      );
    });
  };

// Safeguard: Validate and sanitize command inputs
const sanitizeCommand = (command?: string): string => {
  // Remove any shell metacharacters
  return command?.replace(/[;&|`$]/g, '') || '';
};

// Run analysis with potential retry after installation
const runAnalysis = async (
  cliCommand: string,
  args: any
): Promise<{ stdout: string; stderr: string }> => {
  const safeFile = sanitizeCommand(args.file);
  const tool = args.tool ? `--tool ${args.tool}` : '';
  const command = `${cliCommand} analyze ${tool} --format sarif ${safeFile}`;

  const options = {
    rootPath: args.rootPath,
  };

  return await execAsync(command, options);
};

const ensureCodacyConfig = async (
  cliCommand: string,
  rootPath: string,
  provider?: string,
  organization?: string,
  repository?: string
) => {
  const codacyConfigPath = path.join(rootPath, CLI_FOLDER_NAME, 'codacy.yaml');

  if (!fs.existsSync(codacyConfigPath)) {
    const apiToken = CODACY_ACCOUNT_TOKEN ? `--api-token ${CODACY_ACCOUNT_TOKEN}` : '';
    const repositoryAccess =
      repository && provider && organization
        ? `--provider ${provider} --organization ${organization} --repository ${repository}`
        : '';

    // initialize codacy-cli
    await execAsync(`${cliCommand} init ${apiToken} ${repositoryAccess}`, { rootPath });

    // install dependencies
    await execAsync(`${cliCommand} install`, { rootPath });
  }

  return true;
};

const ensureCodacyCLIExists = async (
  rootPath: string,
  provider?: string,
  organization?: string,
  repository?: string
) => {
  const hasWsl = await isWSL();
  let isCLIAvailable = false;
  try {
    await execAsync(`${CLI_LOCAL_COMMAND} --help`, { rootPath });
    return CLI_LOCAL_COMMAND;
  } catch {
    isCLIAvailable = false;
  }


  if (!isCLIAvailable) {
    try {
      await execAsync(`${CLI_GLOBAL_COMMAND} --help`, { rootPath });
      return CLI_GLOBAL_COMMAND;
    } catch {
      isCLIAvailable = false;
    }
  }

  // install locally if not available
  const codacyFolder = path.join(rootPath, CLI_FOLDER_NAME);
  console.error('codacyFolder', codacyFolder);
  if (!fs.existsSync(codacyFolder)) {
    console.error('folder', codacyFolder)
    fs.mkdirSync(codacyFolder, { recursive: true });
  }

  // Download cli.sh if it doesn't exist
  const codacyCliPath = path.join(codacyFolder, CLI_FILE_NAME);
  if (!fs.existsSync(codacyCliPath)) {
    await execAsync(
      `curl -Ls -o "${CLI_LOCAL_COMMAND}" https://raw.githubusercontent.com/codacy/codacy-cli-v2/main/codacy-cli.sh`,
      { rootPath }
    );

    await execAsync(`chmod +x "${CLI_LOCAL_COMMAND}"`, { rootPath });
  }

  // initialize codacy-cli
  await ensureCodacyConfig(CLI_LOCAL_COMMAND, rootPath, provider, organization, repository);

  return CLI_LOCAL_COMMAND;
};

export const cliAnalyzeHandler = async (args: any) => {
  const wslInstalled = await isWSL();
  if (isWindows()) {
    if (!wslInstalled) {
      return {
        success: false,
        errorType: 'cli-unsupported-os',
        output: 'Codacy CLI is only available on Windows via WSL. Please install WSL (Windows Subsystem for Linux) and try again.',
      };
    }
  }

  try {

    // Ensure codacy-cli is installed
    const cliCommand = await ensureCodacyCLIExists(
      args.rootPath,
      args.provider,
      args.organization,
      args.repository
    );
    if (!cliCommand) {
      return {
        success: false,
        errorType: 'cli-missing',
        output: 'Failed to install codacy-cli. Please install it manually.',
      };
    }

    // Check for mandatory configuration file and initialize if needed
    const configExists = await ensureCodacyConfig(
      cliCommand,
      args.rootPath,
      args.provider,
      args.organization,
      args.repository
    );

    if (!configExists) {
      return {
        success: false,
        errorType: 'cli-config-missing',
        output: 'Failed to find Codacy CLI configuration.',
      };
    }
     const correctRootPath = wslInstalled ? await convertToWslPath(args.rootPath) : args.rootPath;
    const correctFilePath = wslInstalled ? await convertToWslPath(args.file) : args.file;

    const { stdout, stderr } = await runAnalysis(cliCommand, { ...args, rootPath: correctRootPath, file: correctFilePath });

    // Try to extract JSON from the output if it's embedded in other text
    const jsonMatch = /(\{[\s\S]*\}|\[[\s\S]*\])/.exec(stdout);

    return {
      success: true,
      result: jsonMatch ? JSON.parse(jsonMatch[0]) : null,
      warnings: stderr,
    };
  } catch (error) {
    return {
      success: false,
      errorType: 'try-catch',
      output: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
