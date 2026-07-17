import * as fs from 'fs';
import * as path from 'path';
import {
  analyze as runnerAnalyze,
  formatOutput,
  getRegisteredAdapters,
  getRegisteredDescriptors,
  initAutoConfig,
  initRemoteConfig,
  configureApiToken,
  writeCodacyConfig,
  readCodacyConfig,
  createLogger,
} from '@codacy/analysis-runner';
import { registerBuiltinAdapters, loadUnsupportedPatterns } from '@codacy/analysis-adapters';
import type { Logger as RunnerLogger, CodacyConfig } from '@codacy/tooling';

import { ProcessedSarifResult, processSarifResults } from './utils.js';

export const CODACY_FOLDER_NAME = '.codacy';
export const CODACY_CONFIG_FILE = 'codacy.config.json';

/**
 * Strips the account token from an error message so it never leaks into a tool
 * response, and always returns a printable string.
 */
const extractErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return String(error ?? '');
};

const cleanErrorMessage = (error: unknown, token: string | undefined): string => {
  const message = extractErrorMessage(error) || 'Unknown error';
  return token ? message.replace(token, '***') : message;
};

/**
 * Drives Codacy local analysis in-process via `@codacy/analysis-runner`.
 *
 * This replaces the previous approach of downloading a `cli.sh` shell script and
 * shelling out to it. Because the runner is a Node library, a single class works
 * on every platform (including Windows without WSL) — there are no longer any
 * platform-specific subclasses.
 *
 * Because the analyzer ships with the server, "ready" no longer means "a script
 * was downloaded" — it means the repository has been initialized with a
 * `.codacy/codacy.config.json`. `isInitialized()` exposes that state.
 */
export class CodacyCli {
  public readonly _accountToken = process.env.CODACY_ACCOUNT_TOKEN;

  public readonly rootPath: string;
  public readonly provider?: string;
  public readonly organization?: string;
  public readonly repository?: string;

  constructor(rootPath: string, provider?: string, organization?: string, repository?: string) {
    this.rootPath = rootPath;
    this.provider = provider;
    this.organization = organization;
    this.repository = repository;

    // Populate the runner's tool adapter registry (idempotent).
    registerBuiltinAdapters();
  }

  // --- readiness -------------------------------------------------------------

  /** Whether the repository has been initialized (a Codacy config file exists). */
  public isInitialized(): boolean {
    return this.configExists();
  }

  // --- helpers ---------------------------------------------------------------

  private configPath(): string {
    return path.join(this.rootPath, CODACY_FOLDER_NAME, CODACY_CONFIG_FILE);
  }

  private configExists(): boolean {
    return fs.existsSync(this.configPath());
  }

  /** True when we have everything needed to pull configuration from Codacy Cloud. */
  private hasIdentification(): boolean {
    return !!(this._accountToken && this.provider && this.organization && this.repository);
  }

  /**
   * Runner logger that forwards human-readable messages to stderr. The MCP
   * protocol owns stdout, so all diagnostics must go to stderr.
   */
  private createRunnerLogger(): RunnerLogger {
    return createLogger({
      fileEnabled: false,
      onStderrMessage: text => console.error(text),
    });
  }

  /** Builds a fresh CodacyConfig using remote (if identified) or local auto-detection. */
  private async buildConfig(): Promise<CodacyConfig> {
    const adapters = await getRegisteredAdapters();

    if (this.hasIdentification()) {
      configureApiToken(this._accountToken!);
      const { config } = await initRemoteConfig(
        this.rootPath,
        this.provider!,
        this.organization!,
        this.repository!,
        adapters,
        this._accountToken!
      );
      return config;
    }

    const descriptors = getRegisteredDescriptors();
    // `loadUnsupportedPatterns` (from the adapters preset) gates stack-specific
    // patterns during auto-detection. The intermediate optional args (filters,
    // onDiscoveryComplete, rawFilterString) are left at their defaults.
    const { config } = await initAutoConfig(
      this.rootPath,
      adapters,
      descriptors,
      undefined,
      undefined,
      undefined,
      loadUnsupportedPatterns
    );
    return config;
  }

  // --- public lifecycle ------------------------------------------------------

  public async preflightCodacyCli(autoInstall: boolean): Promise<void> {
    if (this.configExists()) {
      await this.initialize();
      return;
    }

    if (autoInstall) await this.setup();
  }

  /**
   * "Set up local analysis": generates the repository config and downloads any
   * tool dependencies.
   */
  public async setup(): Promise<void> {
    try {
      await this.initialize();
    } catch (error) {
      const cleanedErrorMessage = cleanErrorMessage(error, this._accountToken);
      throw new Error(`Failed to set up Codacy local analysis: ${cleanedErrorMessage}`);
    }
  }

  public async installDependencies(): Promise<void> {
    try {
      // "auto-install" downloads any missing runtimes/tools before analysis.
      await runnerAnalyze({
        repositoryRoot: this.rootPath,
        mode: 'auto-install',
        logger: this.createRunnerLogger(),
      });
    } catch (error) {
      const cleanedErrorMessage = cleanErrorMessage(error, this._accountToken);
      throw new Error(`Failed to install dependencies: ${cleanedErrorMessage}`);
    }
  }

  public async initialize(): Promise<void> {
    const configExists = this.configExists();

    let needsInitialization = !configExists;

    if (configExists) {
      // Regenerate if the repo's identification state no longer matches the config
      // (e.g. it was created remotely but we now lack a token, or vice versa).
      const config = await readCodacyConfig(this.rootPath).catch(() => null);
      const isRemote = config?.metadata?.source === 'remote';
      if (isRemote !== this.hasIdentification()) {
        needsInitialization = true;
      }
    }

    if (!needsInitialization) {
      return;
    }

    try {
      await this.regenerateConfig();
    } catch (error) {
      const cleanedErrorMessage = cleanErrorMessage(error, this._accountToken);
      throw new Error(`Failed to initialize CLI: ${cleanedErrorMessage}`);
    }

    // Fetch any missing runtimes/tools for the freshly generated config.
    await this.installDependencies();
  }

  /** Rebuilds the Codacy config from the current identification state and writes it. */
  private async regenerateConfig(): Promise<void> {
    const config = await this.buildConfig();
    // writeCodacyConfig also ensures `.codacy/.gitignore` so generated tool configs
    // stay untracked.
    await writeCodacyConfig(this.rootPath, config);
  }

  public async analyze(options: {
    file?: string;
    tool?: string;
  }): Promise<ProcessedSarifResult[] | null> {
    await this.preflightCodacyCli(true);

    if (!this.isInitialized()) {
      throw new Error('Codacy is not initialized. Please install the Codacy CLI first.');
    }

    const { file, tool } = options;

    try {
      const result = await runnerAnalyze({
        repositoryRoot: this.rootPath,
        files: file ? [this.toRepoRelativePath(file)] : undefined,
        tools: tool ? [tool] : undefined,
        outputFormat: 'sarif',
        logger: this.createRunnerLogger(),
      });

      const sarifResult = JSON.parse(formatOutput(result, 'sarif'));

      return sarifResult && 'runs' in sarifResult ? processSarifResults(sarifResult.runs) : [];
    } catch (error) {
      const cleanedErrorMessage = cleanErrorMessage(error, this._accountToken);
      throw new Error(`Failed to analyze code: ${cleanedErrorMessage}`);
    }
  }

  // --- path safety -----------------------------------------------------------

  /**
   * Validates a file path for security concerns and returns it relative to the
   * repository root (the shape the runner expects for `files`).
   *
   * Rejects null bytes, control characters, and path-traversal attempts that would
   * resolve outside the workspace.
   */
  private toRepoRelativePath(filePath: string): string {
    if (!this.isPathSafe(filePath)) {
      throw new Error(`Unsafe file path rejected: ${filePath}`);
    }

    const resolved = path.isAbsolute(filePath) ? filePath : path.resolve(this.rootPath, filePath);
    return path.relative(this.rootPath, resolved);
  }

  private isPathSafe(filePath: string): boolean {
    // Reject null bytes (always a security risk)
    if (filePath.includes('\0')) {
      return false;
    }

    // Reject all control characters (including newline, tab, carriage return)
    // eslint-disable-next-line no-control-regex -- Intentionally checking for control chars to reject them for security
    const hasUnsafeControlChars = /[\x00-\x1F\x7F]/.test(filePath);
    if (hasUnsafeControlChars) {
      return false;
    }

    // Resolve the path to check for path traversal attempts
    const resolvedPath = path.resolve(this.rootPath, filePath);
    const normalizedRoot = path.normalize(this.rootPath);
    if (!resolvedPath.startsWith(normalizedRoot)) {
      return false;
    }

    return true;
  }
}
