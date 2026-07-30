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
  readBaselineConfig,
  writeBaselineConfig,
  updateConfigIncremental,
  mergeConfigs,
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
   *
   * On a repository that is already initialized with a matching identification
   * state, this performs an incremental config update instead — picking up newly
   * detected languages/frameworks while preserving local edits (disabled patterns,
   * tuned parameters, custom excludes). This matters because the MCP server and the
   * VS Code extension share the same `.codacy/` config: a destructive regenerate
   * here would clobber edits the user made through the extension.
   */
  public async setup(): Promise<void> {
    try {
      if (this.configExists() && !(await this.needsRegeneration())) {
        await this.updateConfig();
        await this.installDependencies();
      } else {
        await this.initialize();
      }
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

  /**
   * Whether the config must be rebuilt from scratch: either it doesn't exist yet,
   * or the repo's identification state no longer matches it (e.g. it was created
   * remotely but we now lack a token, or vice versa). A mismatch is a reset — the
   * previous config no longer applies, so local edits are intentionally discarded.
   */
  private async needsRegeneration(): Promise<boolean> {
    if (!this.configExists()) return true;
    const config = await readCodacyConfig(this.rootPath).catch(() => null);
    const isRemote = config?.metadata?.source === 'remote';
    return isRemote !== this.hasIdentification();
  }

  public async initialize(): Promise<void> {
    if (!(await this.needsRegeneration())) {
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

  /**
   * Writes the live config plus its baseline snapshot.
   *
   * The baseline (`codacy.config.baseline.json`, committed alongside the config) is
   * always the *exact generator output* — never the merged/edited result — so the
   * next {@link updateConfig} can tell a user-disabled pattern apart from a
   * default-off one. On a full regenerate `config === baseline`; on an incremental
   * update `config` is the merge result while `baseline` is the fresh generation.
   */
  private async writeConfigAndBaseline(
    config: CodacyConfig,
    baseline: CodacyConfig
  ): Promise<void> {
    // writeCodacyConfig writes the live config to `.codacy/codacy.config.json` and
    // ensures `.codacy/.gitignore` so generated tool configs stay untracked.
    await writeCodacyConfig(this.rootPath, config);
    // writeBaselineConfig persists the generator-output snapshot to
    // `.codacy/codacy.config.baseline.json` (a committed sibling of the config) with
    // no `.codacy/` side effects, so the next updateConfig() can diff against it.
    await writeBaselineConfig(this.rootPath, baseline);
  }

  /**
   * Rebuilds the Codacy config from scratch, discarding any local edits (the reset
   * path). Used for first-time init and when the identification state changes
   * (remote↔local), where the previous config no longer applies.
   */
  private async regenerateConfig(): Promise<void> {
    const config = await this.buildConfig();
    await this.writeConfigAndBaseline(config, config);
  }

  /**
   * Incrementally updates the config, preserving local edits. Re-runs the original
   * init mode to produce `next`, then three-way merges it into the current config
   * against the committed baseline: newly-detected languages/frameworks add
   * tools/patterns, stack elements that disappeared are removed, and user edits
   * (disabled patterns, tuned parameters, custom excludes) survive.
   *
   * - Remote configs are authoritative: they are re-synced wholesale from Codacy
   *   Cloud, with no local-edit preservation.
   * - When no baseline snapshot exists (a config predating baselines), we cannot
   *   distinguish user-disabled patterns from default-off ones, so we fall back to
   *   an additive merge (edits kept, stale tools not pruned) and warn.
   */
  private async updateConfig(): Promise<void> {
    const next = await this.buildConfig();

    if (next.metadata?.source === 'remote') {
      await this.writeConfigAndBaseline(next, next);
      return;
    }

    const [base, current] = await Promise.all([
      readBaselineConfig(this.rootPath).catch(() => null),
      readCodacyConfig(this.rootPath).catch(() => null),
    ]);

    let result: CodacyConfig;
    if (base && current) {
      result = updateConfigIncremental(base, current, next);
    } else if (current) {
      // The MCP protocol owns stdout, so diagnostics go to stderr.
      console.error(
        'No Codacy config baseline snapshot found; performing an additive merge ' +
          '(local edits are kept, but tools for a removed language/framework are not pruned).'
      );
      // dest = current so the user's edits win; preferDestParameters keeps their
      // tuned parameters over freshly-generated defaults.
      result = mergeConfigs(next, current, { preferDestParameters: true });
    } else {
      result = next;
    }

    await this.writeConfigAndBaseline(result, next);
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
