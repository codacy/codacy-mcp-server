import { MacCodacyCli } from './MacCodacyCli.js';

export class WinWSLCodacyCli extends MacCodacyCli {
  constructor(rootPath: string, provider?: string, organization?: string, repository?: string) {
    const winRootPath = rootPath.startsWith('/mnt/')
      ? WinWSLCodacyCli.fromWSLPath(rootPath)
      : rootPath;
    super(winRootPath, provider, organization, repository);
  }

  private static toWSLPath(path: string): string {
    // First, remove outer quotes if present
    const cleanPath = path.replace(/^["']|["']$/g, '');
    // Convert backslashes to slashes and handle drive letter
    const wslPath = cleanPath
      .replace(/\\/g, '/')
      .replace(/^([a-zA-Z]):/, (match, letter) => `/mnt/${letter.toLowerCase()}`);
    return wslPath;
  }

  private static fromWSLPath(path: string): string {
    // Convert WSL path to Windows path
    // Example: /mnt/c/Users/user/project -> C:\Users\user\project
    const windowsPath = path
      .replace(/^'\/mnt\/([a-zA-Z])/, (match, letter) => `'${letter.toUpperCase()}:`)
      .replace(/^\/mnt\/([a-zA-Z])/, (match, letter) => `${letter.toUpperCase()}:`)
      .replace(/\//g, '\\');
    return windowsPath;
  }

  protected preparePathForExec(path: string): string {
    // Convert WSL path to Windows format for validation
    const winFilePath = path.startsWith('/mnt/') ? WinWSLCodacyCli.fromWSLPath(path) : path;

    // Validate path security before escaping
    if (!this.isPathSafe(winFilePath)) {
      throw new Error(`Unsafe file path rejected: ${winFilePath}`);
    }
    // Convert to WSL format and escape special characters
    const wslPath = WinWSLCodacyCli.toWSLPath(winFilePath);
    const escapedPath = wslPath.replace(/([\s'"\\;&|`$()[\]{}*?~<>])/g, '\\$1');
    return `'${escapedPath}'`;
  }

  protected async execAsync(
    command: string,
    args?: Record<string, string>
  ): Promise<{ stdout: string; stderr: string }> {
    return await super.execAsync(`wsl bash -c "${command}"`, args);
  }

  protected getCliCommand(): string {
    return WinWSLCodacyCli.toWSLPath(super.getCliCommand());
  }
}
