export const CODACY_FOLDER_NAME = '.codacy';
import { exec } from 'child_process';
import { Log } from 'sarif';
import * as path from 'path';

// Set a larger buffer size (10MB)
const MAX_BUFFER_SIZE = 1024 * 1024 * 10;

export abstract class CodacyCli {
  private _cliCommand: string = '';

  public readonly _accountToken = process.env.CODACY_ACCOUNT_TOKEN;
  public readonly _cliVersion = process.env.CODACY_CLI_VERSION;

  public readonly rootPath: string;
  public readonly provider?: string;
  public readonly organization?: string;
  public readonly repository?: string;

  constructor(rootPath: string, provider?: string, organization?: string, repository?: string) {
    this.rootPath = rootPath;
    this.provider = provider;
    this.organization = organization;
    this.repository = repository;
  }

  public abstract install(): Promise<void>;
  public abstract installDependencies(): Promise<void>;

  public abstract update(): Promise<void>;
  public abstract initialize(): Promise<void>;

  public abstract analyze(options: { file?: string; tool?: string }): Promise<Log | null>;

  protected getCliCommand(): string {
    return this._cliCommand;
  }
  protected setCliCommand(command: string): void {
    this._cliCommand = command;
  }

  protected isPathSafe(filePath: string): boolean {
    // Reject null bytes (always a security risk)
    if (filePath.includes('\0')) {
      return false;
    }

    // Reject all control characters (including newline, tab, carriage return)
    // as they are very unusual for file names
    // eslint-disable-next-line no-control-regex -- Intentionally checking for control chars to reject them for security
    const hasUnsafeControlChars = /[\x00-\x1F\x7F]/.test(filePath);
    if (hasUnsafeControlChars) {
      return false;
    }

    // Resolve the path to check for path traversal attempts
    const resolvedPath = path.resolve(this.rootPath, filePath);
    const normalizedRoot = path.normalize(this.rootPath);
    // Check if the resolved path is within the workspace
    if (!resolvedPath.startsWith(normalizedRoot)) {
      return false;
    }

    return true;
  }

  protected preparePathForExec(path: string): string {
    // Validate path security before escaping
    if (!this.isPathSafe(path)) {
      throw new Error(`Unsafe file path rejected: ${path}`);
    }

    // Escape special characters for shell execution
    return path.replace(/([\s'"\\;&|`$()[\]{}*?~<>])/g, '\\$1');
  }

  protected execAsync(
    command: string,
    args?: Record<string, string>
  ): Promise<{ stdout: string; stderr: string }> {
    // stringyfy the args
    const argsString = Object.entries(args || {})
      .map(([key, value]) => {
        // Validate argument key (should be alphanumeric and hyphens only)
        if (!/^[a-zA-Z0-9-]+$/.test(key)) {
          throw new Error(`Invalid argument key: ${key}`);
        }

        // Escape the value to prevent injection
        const escapedValue = value.replace(/([\s'"\\;&|`$()[\]{}*?~<>])/g, '\\$1');
        return `--${key} ${escapedValue}`;
      })
      .join(' ');

    // Build the command - no need to strip characters since we've already escaped them properly
    const cmd = `${command} ${argsString}`.trim();

    return new Promise((resolve, reject) => {
      exec(
        cmd,
        {
          cwd: this.rootPath,
          maxBuffer: MAX_BUFFER_SIZE, // To solve: stdout maxBuffer exceeded
          encoding: 'utf-8',
        },
        (error, stdout, stderr) => {
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
  }
}
