import { Log } from 'sarif';
import { CodacyCli } from './CodacyCli.js';

const NOT_SUPPORTED = 'CLI on Windows is not supported without WSL.';

export class WinCodacyCli extends CodacyCli {
  constructor(rootPath: string, provider?: string, organization?: string, repository?: string) {
    super(rootPath, provider, organization, repository);
  }

  public install(): Promise<void> {
    throw new Error(NOT_SUPPORTED);
  }
  public installDependencies(): Promise<void> {
    throw new Error(NOT_SUPPORTED);
  }
  public update(): Promise<void> {
    throw new Error(NOT_SUPPORTED);
  }
  public initialize(): Promise<void> {
    throw new Error(NOT_SUPPORTED);
  }
  public analyze(_options: { file?: string; tool?: string }): Promise<Log | null> {
    throw new Error(NOT_SUPPORTED);
  }
}
