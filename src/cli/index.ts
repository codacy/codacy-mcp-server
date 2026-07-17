import { CodacyCli } from './CodacyCli.js';

export type CliOptions = {
  rootPath: string;
  provider?: string;
  organization?: string;
  repository?: string;
};

export class Cli {
  private static cliInstance: CodacyCli | null = null;

  static async get(options: CliOptions) {
    if (!Cli.cliInstance) {
      return await Cli.createInstance(options);
    } else if (
      options.rootPath !== Cli.cliInstance.rootPath ||
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

    // A single implementation now works on every platform (the analyzer ships with
    // the server as a Node library — no shell script, no WSL).
    Cli.cliInstance = new CodacyCli(rootPath, provider, organization, repository);

    // Detect existing config / initialize if present (without auto-installing).
    await Cli.cliInstance.preflightCodacyCli(false);

    return Cli.cliInstance;
  }
}

export { ProcessedSarifResult, processSarifResults } from './utils.js';
