import { Cli, CliOptions } from '../cli/index.js';

export const cliInstallHandler = async (args: any) => {
  const cli = await Cli.get(args as CliOptions);

  try {
    await cli.setup();

    return {
      success: true,
      result: 'CLI installed successfully',
    };
  } catch (error) {
    return {
      success: false,
      output: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
