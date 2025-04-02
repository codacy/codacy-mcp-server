import { exec } from 'child_process';
import { getCodacyCliPath } from './installCLI.js';

export async function cliAnalysisHandler(args: {
  tool: string;
  format: string;
  output: string;
}): Promise<{
  message: string;
}> {
  const codacyCliPath = await getCodacyCliPath();

  return new Promise((resolve, reject) => {
    const command = `${codacyCliPath} analyze --tool ${args.tool} --format ${args.format} -o ${args.output}`;

    exec(command, (err, stdout) => {
      if (err) {
        console.error(`Analysis error: ${err}`);
        reject({ message: `Analysis failed: ${err.message}` });
        return;
      }

      console.log(`Analysis completed: ${stdout}`);
      resolve({ message: `Analysis completed successfully. Output saved to ${args.output}` });
    });
  });
}
