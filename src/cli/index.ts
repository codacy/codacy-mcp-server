import { CodacyCli } from './CodacyCli.js';
import { MacCodacyCli } from './MacCodacyCli.js';
import { LinuxCodacyCli } from './LinuxCodacyCli.js';
import { execSync } from 'child_process';
import { WinWSLCodacyCli } from './WinWSLCodacyCli.js';
import { WinCodacyCli } from './WinCodacyCli.js';

export type CliOptions = {
  rootPath: string;
  provider?: string;
  organization?: string;
  repository?: string;
};

export class Cli {
  private static cliInstance: CodacyCli | null = null;

  static get(options: CliOptions) {
    if (!Cli.cliInstance) {
      return Cli.createInstance(options);
    } else if (
      options.rootPath !== Cli.cliInstance.rootPath ||
      options.provider !== Cli.cliInstance.provider ||
      options.organization !== Cli.cliInstance.organization ||
      options.repository !== Cli.cliInstance.repository
    ) {
      // If the options have changed, create a new instance
      Cli.cliInstance = null;
      return Cli.createInstance(options);
    } else {
      // If the options are the same, return the existing instance
      return Cli.cliInstance;
    }
  }

  private static createInstance(options: CliOptions) {
    const { rootPath, provider, organization, repository } = options;
    const platform = process.platform;

    if (platform === 'darwin') {
      Cli.cliInstance = new MacCodacyCli(rootPath, provider, organization, repository);
    } else if (platform === 'linux') {
      Cli.cliInstance = new LinuxCodacyCli(rootPath, provider, organization, repository);
    } else if (platform === 'win32') {
      // is WSL installed?
      const stdout = execSync('wsl --list', { stdio: 'inherit', encoding: 'utf-8' });
      const hasWSL = stdout.toString().includes('Default Distribution');

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
