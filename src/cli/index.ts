import { CodacyCli } from './CodacyCli.js';
import { MacCodacyCli } from './MacCodacyCli.js';
import { LinuxCodacyCli } from './LinuxCodacyCli.js';
import { WinWSLCodacyCli } from './WinWSLCodacyCli.js';
import { WinCodacyCli } from './WinCodacyCli.js';

import { exec } from 'child_process';

export type CliOptions = {
  rootPath: string;
  provider?: string;
  organization?: string;
  repository?: string;
};

async function execWindowsCmdAsync(command: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    exec(
      command,
      {
        encoding: 'buffer',
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }

        if (stderr && !stdout) {
          reject(new Error(stderr.toString('utf16le')));
          return;
        }

        resolve({ stdout: stdout.toString('utf16le'), stderr: stderr.toString('utf16le') });
      }
    );
  });
}

export class Cli {
  private static cliInstance: CodacyCli | null = null;

  static async get(options: CliOptions) {
    if (!Cli.cliInstance) {
      return await Cli.createInstance(options);
    } else if (
      options.provider !== Cli.cliInstance.provider ||
      options.organization !== Cli.cliInstance.organization ||
      options.repository !== Cli.cliInstance.repository
    ) {
      // If the options have changed, create a new instance
      Cli.cliInstance = null;
      return await Cli.createInstance(options);
    } else {
      // If the options are the same, return the existing instance
      return Cli.cliInstance;
    }
  }

  private static async createInstance(options: CliOptions) {
    const { rootPath, provider, organization, repository } = options;
    const platform = process.platform;

    if (platform === 'darwin') {
      Cli.cliInstance = new MacCodacyCli(rootPath, provider, organization, repository);
    } else if (platform === 'linux') {
      Cli.cliInstance = new LinuxCodacyCli(rootPath, provider, organization, repository);
    } else if (platform === 'win32') {
      // is WSL installed?
      const { stdout } = await execWindowsCmdAsync('wsl --status');
      const hasWSL = stdout.includes('Default Distribution');

      Cli.cliInstance = hasWSL
        ? new WinWSLCodacyCli(rootPath, provider, organization, repository)
        : new WinCodacyCli(rootPath, provider, organization, repository);
    }

    if (!Cli.cliInstance) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    return Cli.cliInstance;
  }
}
