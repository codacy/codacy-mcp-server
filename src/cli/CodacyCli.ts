export const CODACY_FOLDER_NAME = '.codacy';
import { exec } from 'child_process';
import { Log } from 'sarif';

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

  protected preparePathForExec(path: string): string {
    return path;
  }

  protected execAsync(
    command: string,
    args?: Record<string, string>
  ): Promise<{ stdout: string; stderr: string }> {
    // stringyfy the args
    const argsString = Object.entries(args || {})
      .map(([key, value]) => `--${key} ${value}`)
      .join(' ');

    // Add the args to the command and remove any shell metacharacters
    const cmd = `${command} ${argsString}`.trim().replace(/[;&|`$]/g, '');

    console.log(`Executing command: ${cmd}`);

    // Add the CODACY_CLI_VERSION to the command
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
