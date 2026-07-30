import { Cli, CliOptions } from '../cli/index.js';

export const cliAnalyzeHandler = async (args: any) => {
  const cli = await Cli.get(args as CliOptions);

  try {
    const results = await cli.analyze({
      file: args.file || undefined,
      tool: args.tool || undefined,
    });

    return {
      success: true,
      result: results ?? [],
    };
  } catch (error) {
    return {
      success: false,
      output: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
