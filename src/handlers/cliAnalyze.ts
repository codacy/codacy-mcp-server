import { Cli, CliOptions } from '../cli/index.js';

export const cliAnalyzeHandler = async (args: any) => {
  const cli = await Cli.get(args as CliOptions);

  try {
    const results = await cli.analyze({
      file: args.file,
      tool: args.tool,
    });

    // clean up the results to remove superflous information
    const cleanedResults = results?.runs.map(run => {
      return {
        tool: run.tool.driver,
        results: run.results?.map(r => ({
          level: r.level,
          message: r.message.text,
          locations: r.locations,
          ruleId: r.ruleId,
        })),
      };
    });

    return {
      success: true,
      result: cleanedResults,
    };
  } catch (error) {
    return {
      success: false,
      output: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
