import util from 'util';
import { exec as execChildProcess } from 'child_process';

const exec = util.promisify(execChildProcess);

// Safeguard: Validate and sanitize command inputs
const sanitizeCommand = (command?: string): string => {
  // Remove any shell metacharacters
  return command?.replace(/[;&|`$]/g, '') || '';
};

export const cliAnalyzeHandler = async (args: any) => {
  try {
    const safeFile = sanitizeCommand(args.file);

    const command = `codacy-cli analyze --format sarif ${safeFile}`;

    // Add options object with cwd and increased maxBuffer
    const options = {
      cwd: args.rootPath,
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer size
    };

    const { stdout, stderr } = await exec(command, options);

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
