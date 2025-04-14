import util from 'util';
import { exec as execChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';

const exec = util.promisify(execChildProcess);
const CODACY_ACCOUNT_TOKEN = process.env.CODACY_ACCOUNT_TOKEN;

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
  const configPath = path.join(rootPath, '.codacy', 'codacy.yaml');

  if (fs.existsSync(configPath)) {
    return true;
  }

  try {
    const command = `codacy-cli init --api-token ${CODACY_ACCOUNT_TOKEN} --provider ${provider} --organization ${organization} --repository ${repository}`;
    const options = { cwd: rootPath };

    await exec(command, options);
    await exec('codacy-cli install', options);
    return true;
  } catch (error) {
    console.error('Failed to initialize Codacy configuration:', error);
    return false;
  }
};

// Run analysis with potential retry after installation
const runAnalysis = async (args: any): Promise<{ stdout: string; stderr: string }> => {
  const safeFile = sanitizeCommand(args.file);
  const command = `codacy-cli analyze --format sarif ${safeFile}`;

  // Add options object with cwd and increased maxBuffer
  const options = {
    cwd: args.rootPath,
    maxBuffer: 1024 * 1024 * 10, // 10MB buffer size
  };

  try {
    return await exec(command, options);
  } catch (error) {
    // If first attempt fails, try installing and retry
    await exec('codacy-cli install', options);
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
        output: 'Failed to initialize Codacy configuration.',
      };
    }

    const { stdout, stderr } = await runAnalysis(args);

    // Only treat stderr as an error if:
    // 1. There's no stdout (meaning only errors occurred)
    // 2. stderr contains actual error messages (not just progress logs)
    if (stderr && (!stdout || /error|fail|exception/i.test(stderr))) {
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
