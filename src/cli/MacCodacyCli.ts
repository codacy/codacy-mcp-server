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
        this._cliVersion ? `CODACY_CLI_V2_VERSION=${this._cliVersion} ${localPath}` : localPath
      );
      return;
    }

    // CLI not found, attempt to install it
    await this.install();
    return;
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
    try {
      const codacyFolder = path.join(this.rootPath, CODACY_FOLDER_NAME);
      if (!fs.existsSync(codacyFolder)) {
        fs.mkdirSync(codacyFolder, { recursive: true });
      }

      // Download cli.sh if it doesn't exist
      const codacyCliPath = path.join(CODACY_FOLDER_NAME, 'cli.sh');

      if (!fs.existsSync(codacyCliPath)) {
        const execPath = this.preparePathForExec(codacyCliPath);

        await this.execAsync(
          `curl -Ls -o "${execPath}" https://raw.githubusercontent.com/codacy/codacy-cli-v2/main/codacy-cli.sh`
        );

        await this.execAsync(`chmod +x "${execPath}"`);

        this.setCliCommand(
          this._cliVersion
            ? `CODACY_CLI_V2_VERSION=${this._cliVersion} ${codacyCliPath}`
            : codacyCliPath
        );
      }
    } catch (error) {
      throw new Error(`Failed to install CLI: ${error}`);
    }

    // Initialize codacy-cli after installation
    await this.initialize();
  }

  public async installDependencies(): Promise<void> {
    const command = `${this.getCliCommand()} install`;
    try {
      await this.execAsync(command);
    } catch (error) {
      throw new Error(`Failed to install dependencies: ${error}`);
    }
  }

  public async update(): Promise<void> {
    const command = `${this.getCliCommand()} update`;
    try {
      await this.execAsync(command);
    } catch (error) {
      throw new Error(`Failed to update CLI: ${error}`);
    }

    this.installDependencies();
  }

  public async initialize(): Promise<void> {
    // Check if the configuration files exist
    const configFilePath = path.join(this.rootPath, CODACY_FOLDER_NAME, 'codacy.yaml');
    const cliConfigFilePath = path.join(this.rootPath, CODACY_FOLDER_NAME, 'cli-config.yaml');
    const toolsFolderPath = path.join(this.rootPath, CODACY_FOLDER_NAME, 'tools-configs');

    const initFilesOk =
      fs.existsSync(configFilePath) &&
      fs.existsSync(cliConfigFilePath) &&
      fs.existsSync(toolsFolderPath);
    let needsInitialization = !initFilesOk;

    if (initFilesOk) {
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
      const initParams = (
        this._accountToken && this.repository && this.provider && this.organization
          ? {
              provider: this.provider,
              organization: this.organization,
              repository: this.repository,
              'api-token': this._accountToken,
            }
          : {}
      ) as Record<string, string>;

      try {
        // initialize codacy-cli
        await this.execAsync(`${this.getCliCommand()} init`, initParams);
      } catch (error) {
        throw new Error(`Failed to initialize CLI: ${error}`);
      }

      // install dependencies
      await this.installDependencies();
    }
  }

  public async analyze(options: { file?: string; tool?: string }): Promise<Log | null> {
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
