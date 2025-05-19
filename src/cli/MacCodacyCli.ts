import fs from 'fs';
import path from 'path';

import { CODACY_FOLDER_NAME, CodacyCli } from './CodacyCli.js';
import { Log } from 'sarif';

export class MacCodacyCli extends CodacyCli {
  constructor(rootPath: string, provider?: string, organization?: string, repository?: string) {
    super(rootPath, provider, organization, repository);
  }

  protected async findCliCommand(): Promise<void> {
    this.setCliCommand('');

    // check if .codacy/cli.sh exists
    const localPath = path.join(CODACY_FOLDER_NAME, 'cli.sh');
    const fullPath = path.join(this.rootPath, localPath);

    if (fs.existsSync(fullPath)) {
      this.setCliCommand(
        this._cliVersion ? `CODACY_CLI_VERSION=${this._cliVersion} ${localPath}` : localPath
      );
      return;
    }

    // check if codacy-cli is installed globally
    try {
      // first set the command for the getCliCommand to do the right thing when called
      this.setCliCommand(
        this._cliVersion ? `CODACY_CLI_VERSION=${this._cliVersion} codacy-cli` : 'codacy-cli'
      );
      await this.execAsync(`${this.getCliCommand()} --help`);

      return;
    } catch {
      // CLI not found, clear it, and attempt to install it
      this.setCliCommand('');
      await this.install();
      return undefined;
    }
  }

  private async preflightCodacyCli(): Promise<void> {
    // is there a command?
    if (!this.getCliCommand()) {
      await this.findCliCommand();
    } else {
      await this.initialize();
    }
  }

  public async install(): Promise<void> {
    console.log('Installing codacy-cli...');
    try {
      const codacyFolder = path.join(this.rootPath, CODACY_FOLDER_NAME);
      if (!fs.existsSync(codacyFolder)) {
        fs.mkdirSync(codacyFolder, { recursive: true });
      }

      console.log('Downloading codacy-cli...');

      // Download cli.sh if it doesn't exist
      const codacyCliPath = path.join(CODACY_FOLDER_NAME, 'cli.sh');
      console.log(`CLI path: ${codacyCliPath}`);
      if (!fs.existsSync(codacyCliPath)) {
        console.log('Downloading codacy-cli.sh......');

        const execPath = this.preparePathForExec(codacyCliPath);

        await this.execAsync(
          `curl -Ls -o "${execPath}" https://raw.githubusercontent.com/codacy/codacy-cli-v2/main/codacy-cli.sh`
        );

        console.log('Making codacy-cli executable...');

        await this.execAsync(`chmod +x "${execPath}"`);

        this.setCliCommand(
          this._cliVersion ? `CODACY_CLI_VERSION=${this._cliVersion} ${codacyCliPath}` : codacyCliPath);
      }
    } catch (error) {
      throw new Error(`Failed to install CLI: ${error}`);
    }

    // Initialize codacy-cli after installation
    await this.initialize();
  }

  public async installDependencies(): Promise<void> {
    console.log('Installing dependencies...');
    const command = `${this.getCliCommand()} install`;
    try {
      await this.execAsync(command);
    } catch (error) {
      throw new Error(`Failed to install dependencies: ${error}`);
    }
  }

  public async update(): Promise<void> {
    console.log('Updating codacy-cli...');
    const command = `${this.getCliCommand()} update`;
    try {
      await this.execAsync(command);
    } catch (error) {
      throw new Error(`Failed to update CLI: ${error}`);
    }

    this.installDependencies();
  }

  public async initialize(): Promise<void> {
    console.log('Initializing codacy-cli...');
    // Check if the configuration files exist
    const configFilePath = path.join(this.rootPath, CODACY_FOLDER_NAME, 'codacy.yaml');
    const toolsFolderPath = path.join(this.rootPath, CODACY_FOLDER_NAME, 'tools-configs');

    let needsInitialization = !fs.existsSync(configFilePath) || !fs.existsSync(toolsFolderPath);

    if (!needsInitialization) {
      // Check if the mode matches the current properties
      const cliConfig = fs.readFileSync(
        path.join(this.rootPath, CODACY_FOLDER_NAME, 'cli-config.yaml'),
        'utf-8'
      );

      if (
        (cliConfig === 'mode: local' && this.repository) ||
        (cliConfig === 'mode: remote' && !this.repository)
      ) {
        needsInitialization = true;
      }
    }

    if (needsInitialization) {
      const apiToken: Record<string, string> = this._accountToken
        ? { 'api-token': this._accountToken }
        : {};

      const repositoryAccess: Record<string, string> =
        this.repository && this.provider && this.organization
          ? {
              provider: this.provider,
              organization: this.organization,
              repository: this.repository,
            }
          : {};

      try {
        // initialize codacy-cli
        await this.execAsync(`${this.getCliCommand()} init`, { ...apiToken, ...repositoryAccess });
      } catch (error) {
        throw new Error(`Failed to initialize CLI: ${error}`);
      }

      // install dependencies
      await this.installDependencies();
    }
  }

  public async analyze(options: { file?: string; tool?: string }): Promise<Log | null> {
    console.log('Analyzing code...');
    await this.preflightCodacyCli();

    if (!this.getCliCommand()) {
      throw new Error('CLI command not found. Please install the CLI first.');
    }

    const { file, tool } = options;

    try {
      const { stdout } = await this.execAsync(
        `${this.getCliCommand()} analyze ${file ? this.preparePathForExec(file) : ''} --format sarif`,
        tool ? { tool: tool } : {}
      );

      const jsonMatch = /(\{[\s\S]*\}|\[[\s\S]*\])/.exec(stdout);

      return jsonMatch ? (JSON.parse(jsonMatch[0]) as Log) : null;
    } catch (error) {
      throw new Error(`Failed to analyze code: ${error}`);
    }
  }
}
