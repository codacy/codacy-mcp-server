import { Log } from 'sarif';
import { CodacyCli } from './CodacyCli.js';

export class WinCodacyCli extends CodacyCli {
  constructor(rootPath: string, provider?: string, organization?: string, repository?: string) {
    super(rootPath, provider, organization, repository);
  }

  public install(): Promise<void> {
    throw new Error('CLI on Windows is not supported without WSL.');
  }
  public installDependencies(): Promise<void> {
    throw new Error('CLI on Windows is not supported without WSL.');
  }
  public update(): Promise<void> {
    throw new Error('CLI on Windows is not supported without WSL.');
  }
  public initialize(): Promise<void> {
    throw new Error('CLI on Windows is not supported without WSL.');
  }
  public analyze(_options: { file?: string; tool?: string }): Promise<Log | null> {
    throw new Error('CLI on Windows is not supported without WSL.');
  }
}
