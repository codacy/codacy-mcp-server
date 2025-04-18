import util from 'util';
import { exec as execChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';

const exec = util.promisify(execChildProcess);
const CODACY_ACCOUNT_TOKEN = process.env.CODACY_ACCOUNT_TOKEN;
const CODACY_CLI_COMMAND = 'CODACY_CLI_V2_VERSION=1.0.0-main.232.a6a6368 codacy-cli';

// Safeguard: Validate and sanitize command inputs
const sanitizeCommand = (command?: string): string => {
  // Remove any shell metacharacters
  return command?.replace(/[;&|`$]/g, '') || '';
};

// Check if codacy-cli is installed and install if needed
const ensureCodacyCLI = async (): Promise<boolean> => {
  try {
    await exec('which codacy-cli');
    return true;
  } catch {
    try {
      // Install codacy-cli using brew
      await exec('brew install codacy/codacy-cli-v2/codacy-cli-v2');

      return true;
    } catch (error) {
      console.error('Failed to install codacy-cli:', error);
      return false;
    }
  }
};

// Check if .codacy/codacy.yaml exists and initialize if needed
const ensureCodacyConfig = async (
  rootPath: string,
  provider: string,
  organization: string,
  repository: string
): Promise<boolean> => {
  const extensions = ['yaml', 'yml'];
  const configExists = extensions.some(ext =>
    fs.existsSync(path.join(rootPath, '.codacy', `codacy.${ext}`))
  );

  if (configExists) {
    return true;
  }

  try {
    const command = `${CODACY_CLI_COMMAND} init --api-token ${CODACY_ACCOUNT_TOKEN} --provider ${provider} --organization ${organization} --repository ${repository}`;
    const options = { cwd: rootPath };

    await exec(command, options);
    await exec(`${CODACY_CLI_COMMAND} install`, options);
    return true;
  } catch (error) {
    console.error('Failed to initialize Codacy configuration:', error);
    return false;
  }
};

// Only treat stderr as an error if:
// 1. There's no stdout (meaning only errors occurred)
// 2. stderr contains actual error messages (not just progress logs)
const falseSuccess = (stdout: string, stderr?: string) =>
  stderr && (!stdout || /error|fail|exception/i.test(stderr));

// Run analysis with potential retry after installation
const runAnalysis = async (args: any): Promise<{ stdout: string; stderr: string }> => {
  const safeFile = sanitizeCommand(args.file);
  const tool = args.tool ? `--tool ${args.tool}` : '';
  const command = `${CODACY_CLI_COMMAND} analyze ${tool} --format sarif ${safeFile}`;

  // Add options object with cwd and increased maxBuffer
  const options = {
    cwd: args.rootPath,
    maxBuffer: 1024 * 1024 * 10, // 10MB buffer size
  };

  try {
    const { stdout, stderr } = await exec(command, options);
    if (falseSuccess(stdout, stderr)) {
      throw new Error('Failed to run analysis. Trying to install codacy-cli...');
    }
    return { stdout, stderr };
  } catch (error) {
    // If first attempt fails, try installing and retry
    await exec(`${CODACY_CLI_COMMAND} install`, options);
    return await exec(command, options);
  }
};

export const cliAnalyzeHandler = async (args: any) => {
  try {
    // Ensure codacy-cli is installed
    const isCLIAvailable = await ensureCodacyCLI();
    if (!isCLIAvailable) {
      return {
        success: false,
        errorType: 'cli-missing',
        output: 'Failed to install codacy-cli. Please install it manually.',
      };
    }

    // Check for mandatory configuration file and initialize if needed
    const configExists = await ensureCodacyConfig(
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

    const { stdout, stderr } = await runAnalysis(args);

    if (falseSuccess(stdout, stderr)) {
      return {
        success: false,
        errorType: 'stderr',
        output: stderr,
      };
    }

    // Try to extract JSON from the output if it's embedded in other text
    const jsonMatch = /(\{[\s\S]*\}|\[[\s\S]*\])/.exec(stdout);

    return {
      success: true,
      output: stdout,
      result: jsonMatch ? JSON.parse(jsonMatch[0]) : null,
    };
  } catch (error) {
    return {
      success: false,
      errorType: 'try-catch',
      output: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
