import { Log } from 'sarif';
import { MacCodacyCli } from './MacCodacyCli.js';

export class WinWSLCodacyCli extends MacCodacyCli {
  constructor(rootPath: string, provider?: string, organization?: string, repository?: string) {
    super(rootPath, provider, organization, repository);
  }

  private async toWSLPath(path: string): Promise<string> {
    // Convert Windows path to WSL path
    // Example: C:\Users\user\project -> /mnt/c/Users/user/project
    const wslPath = path.replace(/\\/g, '/').replace(/^([a-zA-Z]):/, '/mnt/$1');
    return wslPath;
  }

  private async fromWSLPath(path: string): Promise<string> {
    // Convert WSL path to Windows path
    // Example: /mnt/c/Users/user/project -> C:\Users\user\project
    const windowsPath = path.replace(/^\/mnt\/([a-zA-Z])/, '$1:').replace(/\//g, '\\');
    return windowsPath;
  }

  protected async execAsync(
    command: string,
    args?: Record<string, string>
  ): Promise<{ stdout: string; stderr: string }> {
    return await super.execAsync(`wsl ${command}`, args);
  }

  public async analyze(options: { file?: string; tool?: string }): Promise<Log | null> {
    const winOptions = { ...options };

    // Convert the file path to WSL path
    if (options.file) {
      winOptions.file = await this.toWSLPath(options.file);
    }

    const result = await super.analyze(winOptions);

    // Convert the result paths back to Windows paths if needed
    // if (result) {
    //   // Assuming result has a property 'filePath' that needs conversion
    //   // You may need to adjust this based on the actual structure of the result
    //   result.filePath = await this.fromWSLPath(result.filePath);
    // }

    return result;
  }
}
