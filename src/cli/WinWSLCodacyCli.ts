import { MacCodacyCli } from './MacCodacyCli.js';

export class WinWSLCodacyCli extends MacCodacyCli {
  constructor(rootPath: string, provider?: string, organization?: string, repository?: string) {
    const winRootPath = rootPath.startsWith('/mnt/')
      ? WinWSLCodacyCli.fromWSLPath(rootPath)
      : rootPath;
    super(winRootPath, provider, organization, repository);
  }

  private static toWSLPath(path: string): string {
    // Convert Windows path to WSL path
    // Example: C:\Users\user\project -> /mnt/c/Users/user/project
    const wslPath = path.replace(/\\/g, '/').replace(/^([a-zA-Z]):/, '/mnt/$1');
    return wslPath;
  }

  private static fromWSLPath(path: string): string {
    // Convert WSL path to Windows path
    // Example: /mnt/c/Users/user/project -> C:\Users\user\project
    const windowsPath = path.replace(/^\/mnt\/([a-zA-Z])/, '$1:').replace(/\//g, '\\');
    return windowsPath;
  }

  protected preparePathForExec(path: string): string {
    // Convert the path to WSL format
    return WinWSLCodacyCli.toWSLPath(path);
  }

  protected async execAsync(
    command: string,
    args?: Record<string, string>
  ): Promise<{ stdout: string; stderr: string }> {
    return await super.execAsync(`wsl ${command}`, args);
  }

  protected getCliCommand(): string {
    return WinWSLCodacyCli.toWSLPath(super.getCliCommand());
  }
}
